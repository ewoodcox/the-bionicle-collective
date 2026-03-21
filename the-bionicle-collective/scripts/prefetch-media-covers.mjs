/**
 * Prefetch Bionicle "media" cover images from Biosector01.
 *
 * Strategy (in order):
 * 1. **Convention** — BS01 stores comics as `File:Comic{N}.PNG` (issue 1) or
 *    `File:Comic{N}-{TitleWordsRunTogether}.png` (issues 2+). Examples:
 *    - https://biosector01.com/wiki/File:Comic1.PNG
 *    - https://biosector01.com/wiki/File:Comic1-TheComingoftheToa2.png (alt)
 *    - https://biosector01.com/wiki/File:Comic2-DeepintoDarkness.png
 * 2. **Fallback** — Parse the issue wiki page wikitext for `[[Image:...]]` (Ignition,
 *    Glatorian, or when naming doesn't match our slug guesses).
 *
 * Uploads to R2 + copies to `public/media-covers/`, updates `src/data/media.json`.
 *
 * Requirements:
 * - `.env`: `R2_BUCKET_NAME`, `R2_ENDPOINT`
 * - Wrangler auth (`npx wrangler login` or CLOUDFLARE_API_TOKEN)
 *
 * Run:
 *   node scripts/prefetch-media-covers.mjs
 *   node scripts/prefetch-media-covers.mjs --force   # re-download even if media.json already has R2 URLs
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

const FORCE = process.argv.includes('--force');

function loadDotEnv(dotEnvPath) {
  if (!existsSync(dotEnvPath)) return;
  const raw = readFileSync(dotEnvPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (key) process.env[key] = value;
  }
}

loadDotEnv(envPath);

const MEDIA_PATH = join(projectRoot, 'src', 'data', 'media.json');
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

if (!R2_BUCKET || !R2_ENDPOINT) {
  console.error('Missing R2 env. Ensure `.env` has R2_BUCKET_NAME and R2_ENDPOINT.');
  process.exit(1);
}

const R2_PREFIX = 'media-covers';
const PUBLIC_COVERS_DIR = join(projectRoot, 'public', 'media-covers');

const TEMP_DIR = join(projectRoot, '.tmp-prefetch-media-covers');
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function toUrlSegment(str) {
  return encodeURIComponent(str).replace(/%20/g, '_');
}

/** BS01 wiki page title for API parse (unchanged from before). */
function issuePageTitleFromMedia(m) {
  const issue = (m.issueNumber ?? '').trim();
  const title = m.title;
  if (!issue) throw new Error(`Missing issueNumber for media id=${m.id}`);

  const main = issue.match(/^Issue\s+(\d+)$/i);
  if (main) {
    const n = main[1];
    return `BIONICLE_${n}:_${title}`;
  }

  const ign = issue.match(/^Ignition\s+(\d+)$/i);
  if (ign) {
    const n = ign[1];
    return n === '0' ? `BIONICLE_Ignition_${n}` : `BIONICLE_Ignition_${n}:_${title}`;
  }

  const glat = issue.match(/^Glatorian\s+(\d+)$/i);
  if (glat) {
    const n = glat[1];
    return `BIONICLE_Glatorian_${n}:_${title}`;
  }

  throw new Error(`Unrecognized issueNumber format for media id=${m.id}: ${issue}`);
}

/**
 * Guess how BS01 runs together the issue title for `ComicN-{slug}.png`.
 * Tries several variants because punctuation differs (e.g. "The End of the Toa?" → no `?` in filename).
 */
function comicTitleSlugCandidates(title) {
  if (!title || !String(title).trim()) return [];
  const t = String(title).trim();
  const out = [];
  const push = (s) => {
    if (s && !out.includes(s)) out.push(s);
  };

  push(t.replace(/\s+/g, ''));
  push(t.replace(/\s+/g, '').replace(/[?!]+$/g, ''));
  push(t.replace(/\s+/g, '').replace(/[!?]+/g, ''));
  push(t.replace(/\s*--\s*/g, ' ').replace(/\s+/g, ''));
  push(t.replace(/\s*--\s*/g, '').replace(/\s+/g, '').replace(/[?!]+$/g, ''));
  const letters = t.replace(/[^a-zA-Z0-9]+/g, '');
  if (letters) push(letters);

  if (t.includes('...')) {
    push(t.replace(/\s+/g, '').replace(/\.\.\./g, '....'));
  }

  // BS01 sometimes runs "The" in the middle as "the" (e.g. Comic6-IntotheNest.png vs IntoTheNest).
  const extra = [];
  for (const s of out) {
    extra.push(s.replace(/(?<=[a-z])The(?=[a-z])/g, 'the'));
  }
  for (const s of extra) push(s);

  return out;
}

/**
 * For "Issue N" comics: ordered list of likely `File:` names for the **main** cover.
 */
function conventionMainFilenames(issueNum, title) {
  const n = String(issueNum);
  if (n === '1') {
    return ['Comic1.PNG', 'Comic1.png'];
  }
  const slugs = comicTitleSlugCandidates(title);
  const names = [];
  for (const slug of slugs) {
    names.push(`Comic${n}-${slug}.png`);
  }
  return names;
}

/**
 * Alternate / second cover filenames (Issue 1 BrickMaster-style).
 */
function conventionAltFilenames(issueNum, title) {
  const n = String(issueNum);
  if (n === '1') {
    return ['Comic1-TheComingoftheToa2.png'];
  }
  return [];
}

function fileUrlFromFilename(filename) {
  return `https://biosector01.com/wiki/Special:FilePath/${toUrlSegment(filename)}`;
}

function extractCoverFilenamesFromWikitext(wikitext) {
  let imageBlock = '';
  const m1 = wikitext.match(/\{\{Comic[\s\S]*?\|image=([\s\S]*?)\|covertitle=/i);
  if (m1) imageBlock = m1[1];
  if (!imageBlock) {
    const m2 = wikitext.match(/\{\{Comic[\s\S]*?\|image=([\s\S]*?)(?:\n\|[^}]|\|covertitle=)/i);
    if (m2) imageBlock = m2[1];
  }
  if (!imageBlock) {
    const m3 = wikitext.match(/\{\{Comic[\s\S]*?\|image=([\s\S]*?)\}\}/i);
    if (m3) imageBlock = m3[1];
  }
  let filenames = Array.from(imageBlock.matchAll(/\[\[Image:([^|\]]+)/gi)).map((x) => x[1].trim());
  if (filenames.length === 0) {
    filenames = Array.from(imageBlock.matchAll(/\[\[File:([^|\]]+)/gi)).map((x) => x[1].trim());
  }
  return filenames.filter(Boolean);
}

function extFromContentType(contentType, fallbackFromUrl) {
  const ct = String(contentType || '').toLowerCase();
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/jpeg')) return 'jpg';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/gif')) return 'gif';
  return fallbackFromUrl || 'png';
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

async function fetchWikitextForIssue(pageTitle) {
  const apiUrl = `https://biosector01.com/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&format=json`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Biosector API failed (${res.status}) for ${pageTitle}`);
  }
  const json = await res.json();
  return json?.parse?.wikitext?.['*'] || '';
}

/** Returns { ok: true, ext, tempPath } or { ok: false } */
async function tryDownloadToTemp(url, tempPath) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return { ok: false };
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('image/')) return { ok: false };
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 500) return { ok: false };
  writeFileSync(tempPath, Buffer.from(buf));
  const ext = extFromContentType(ct, extFromUrl(res.url || url));
  return { ok: true, ext, tempPath };
}

function uploadTempToR2({ key, tempPath }) {
  const r2Key = `${R2_BUCKET}/${key}`;
  const fileArg = tempPath.replace(/\\/g, '/');
  execSync(`npx wrangler r2 object put "${r2Key}" --file="${fileArg}"`, { cwd: projectRoot, stdio: 'inherit' });
}

function parseIssueN(m) {
  const issue = (m.issueNumber ?? '').trim();
  const main = issue.match(/^Issue\s+(\d+)$/i);
  if (main) return { kind: 'issue', n: main[1] };
  return null;
}

/**
 * Resolve main + optional alt filenames: convention first, then wikitext.
 */
async function resolveFilenames(m) {
  const parsed = parseIssueN(m);
  const pageTitle = issuePageTitleFromMedia(m);

  let mainFilename = null;
  let altFilename = null;
  let source = '';

  if (parsed?.kind === 'issue') {
    const candidates = conventionMainFilenames(parsed.n, m.title);
    for (const name of candidates) {
      const url = fileUrlFromFilename(name);
      const tmp = join(TEMP_DIR, `probe-${m.id}-main.tmp`);
      const r = await tryDownloadToTemp(url, tmp);
      if (r.ok) {
        unlinkSync(tmp);
        mainFilename = name;
        source = `convention:${name}`;
        break;
      }
      try {
        unlinkSync(tmp);
      } catch {
        /* */
      }
    }

    const altCandidates = conventionAltFilenames(parsed.n, m.title);
    for (const name of altCandidates) {
      const url = fileUrlFromFilename(name);
      const tmp = join(TEMP_DIR, `probe-${m.id}-alt.tmp`);
      const r = await tryDownloadToTemp(url, tmp);
      if (r.ok) {
        unlinkSync(tmp);
        altFilename = name;
        break;
      }
      try {
        unlinkSync(tmp);
      } catch {
        /* */
      }
    }
  }

  const wikitext = await fetchWikitextForIssue(pageTitle);
  const fromWiki = extractCoverFilenamesFromWikitext(wikitext);

  if (!mainFilename && fromWiki.length > 0) {
    mainFilename = fromWiki[0];
    source = source ? `${source};wiki` : `wiki:${mainFilename}`;
  }
  if (!altFilename && fromWiki.length > 1) {
    altFilename = fromWiki[1];
  }

  return { mainFilename, altFilename, source, issueUrl: `https://biosector01.com/wiki/${toUrlSegment(pageTitle)}` };
}

async function downloadToFinal(url, finalTempPath) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
  const buf = await res.arrayBuffer();
  writeFileSync(finalTempPath, Buffer.from(buf));
  return extFromContentType(res.headers.get('content-type'), extFromUrl(res.url || url));
}

async function main() {
  const media = JSON.parse(readFileSync(MEDIA_PATH, 'utf8'));
  if (!Array.isArray(media)) {
    throw new Error(`Expected ${MEDIA_PATH} to be an array.`);
  }

  const comics = media.filter((m) => m.category === 'comics');
  console.log(`Prefetching ${comics.length} comics covers from Biosector...${FORCE ? ' (--force)' : ''}`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < comics.length; i++) {
    const m = comics[i];

    const mainKey = `${R2_PREFIX}/${m.id}/main`;
    const altKey = `${R2_PREFIX}/${m.id}/alt`;

    const mainExisting =
      typeof m.imageUrl === 'string' && m.imageUrl.includes(`${R2_PREFIX}/${m.id}/main.`);
    const altExisting =
      typeof m.imageUrlAlt === 'string' && m.imageUrlAlt.includes(`${R2_PREFIX}/${m.id}/alt.`);

    try {
      const { mainFilename, altFilename, source, issueUrl } = await resolveFilenames(m);

      if (!mainFilename) {
        console.warn(`  [${i + 1}/${comics.length}] No cover images found: ${m.id} (${issueUrl})`);
        skipped++;
        await delay(200);
        continue;
      }

      if (!FORCE && mainExisting && (!altFilename || altExisting)) {
        skipped++;
        await delay(50);
        continue;
      }

      if (source) {
        console.log(`  [${m.id}] ${source}`);
      }

      const mainUrl = fileUrlFromFilename(mainFilename);
      const altUrl = altFilename ? fileUrlFromFilename(altFilename) : null;

      const mainTempBase = join(TEMP_DIR, `${m.id}-main`);
      const mainFinalTemp = `${mainTempBase}.dl`;
      const finalMainExt = await downloadToFinal(mainUrl, mainFinalTemp);

      const mainR2KeyWithExt = `${mainKey}.${finalMainExt}`;
      uploadTempToR2({ key: mainR2KeyWithExt, tempPath: mainFinalTemp });

      const publicMainDir = join(PUBLIC_COVERS_DIR, m.id);
      if (!existsSync(publicMainDir)) mkdirSync(publicMainDir, { recursive: true });
      copyFileSync(mainFinalTemp, join(publicMainDir, `main.${finalMainExt}`));

      m.imageUrl = `${R2_ENDPOINT}/${mainR2KeyWithExt}`;
      unlinkSync(mainFinalTemp);

      if (altUrl) {
        const altTempBase = join(TEMP_DIR, `${m.id}-alt`);
        const altFinalTemp = `${altTempBase}.dl`;
        const altExt = await downloadToFinal(altUrl, altFinalTemp);
        const altR2KeyWithExt = `${altKey}.${altExt}`;
        uploadTempToR2({ key: altR2KeyWithExt, tempPath: altFinalTemp });

        const publicAltDir = join(PUBLIC_COVERS_DIR, m.id);
        if (!existsSync(publicAltDir)) mkdirSync(publicAltDir, { recursive: true });
        copyFileSync(altFinalTemp, join(publicAltDir, `alt.${altExt}`));

        m.imageUrlAlt = `${R2_ENDPOINT}/${altR2KeyWithExt}`;
        unlinkSync(altFinalTemp);
      } else {
        m.imageUrlAlt = undefined;
      }

      updated++;
      if ((i + 1) % 5 === 0 || i === comics.length - 1) {
        console.log(`  Updated ${updated}/${comics.length} so far...`);
      }

      await delay(250);
    } catch (e) {
      console.warn(`  [${i + 1}/${comics.length}] Failed ${m.id}:`, e?.message || e);
    }
  }

  writeFileSync(MEDIA_PATH, JSON.stringify(media, null, 2), 'utf8');
  console.log(`Done. Updated ${updated} comics covers; skipped ${skipped}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
