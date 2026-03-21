/**
 * Prefetch Bionicle "media" cover images from Biosector01.
 *
 * What it does:
 * - Reads `src/data/media.json`
 * - For each `category === "comics"` entry, fetches the Biosector issue wiki page
 * - Parses the Comic template's `image=` entries (main cover + optional BrickMaster/alternate cover)
 * - Downloads the images and uploads them to Cloudflare R2 via `wrangler r2 object put`
 * - Updates `src/data/media.json`:
 *    - `imageUrl` -> `${R2_ENDPOINT}/${r2KeyMain}`
 *    - `imageUrlAlt` -> `${R2_ENDPOINT}/${r2KeyAlt}` (if found)
 *
 * Requirements:
 * - Ensure wrangler is authenticated (CLOUDFLARE_API_TOKEN or `npx wrangler login`)
 * - Local `.env` must include:
 *    - `R2_BUCKET_NAME`
 *    - `R2_ENDPOINT`
 *
 * Run:
 *   node scripts/prefetch-media-covers.mjs
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

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
  // MediaWiki-friendly segment: spaces become underscores; other characters are encoded.
  return encodeURIComponent(str).replace(/%20/g, '_');
}

function issuePageTitleFromMedia(m) {
  const issue = (m.issueNumber ?? '').trim();
  const title = m.title;
  if (!issue) throw new Error(`Missing issueNumber for media id=${m.id}`);

  const main = issue.match(/^Issue\s+(\d+)$/i);
  if (main) {
    const n = main[1];
    // Example: BIONICLE_1:_The_Coming_of_the_Toa
    return `BIONICLE_${n}:_${title}`;
  }

  const ign = issue.match(/^Ignition\s+(\d+)$/i);
  if (ign) {
    const n = ign[1];
    // Example: BIONICLE_Ignition_1:_If_a_Universe_Ends_...
    // Special case: Ignition 0 has no `:_<title>` suffix on Biosector.
    return n === '0' ? `BIONICLE_Ignition_${n}` : `BIONICLE_Ignition_${n}:_${title}`;
  }

  const glat = issue.match(/^Glatorian\s+(\d+)$/i);
  if (glat) {
    const n = glat[1];
    // Example: BIONICLE_Glatorian_1:_Sands_of_Bara_Magna
    return `BIONICLE_Glatorian_${n}:_${title}`;
  }

  throw new Error(`Unrecognized issueNumber format for media id=${m.id}: ${issue}`);
}

function extractCoverFilenamesFromWikitext(wikitext) {
  // The Comic template for Bionicle covers usually looks like:
  // {{Comic
  // |image=[[Image:Comic1.PNG|250px]]
  // [[Image:Comic1-TheComingoftheToa2.png|250px]]
  // |covertitle=...
  // }}
  const m = wikitext.match(/\{\{Comic[\s\S]*?\|image=([\s\S]*?)\|covertitle=/i);
  const imageBlock = m ? m[1] : '';
  const filenames = Array.from(imageBlock.matchAll(/\[\[Image:([^|\]]+)/g)).map((x) => x[1].trim());
  return filenames.filter(Boolean);
}

function fileUrlFromFilename(filename) {
  // MediaWiki: Special:FilePath redirects to the actual image (thumb/original).
  return `https://biosector01.com/wiki/Special:FilePath/${toUrlSegment(filename)}`;
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
    const m = u.pathname.match(/\.([a-zA-Z0-9]+)$/);
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

async function downloadToTemp(url, tempPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}) for ${url}`);
  }
  const buf = await res.arrayBuffer();
  writeFileSync(tempPath, Buffer.from(buf));
  const ext = extFromContentType(res.headers.get('content-type'), extFromUrl(url));
  return ext;
}

function uploadTempToR2({ key, tempPath }) {
  // `wrangler r2 object put` handles the upload; we rely on it being authenticated.
  const r2Key = `${R2_BUCKET}/${key}`;
  const fileArg = tempPath.replace(/\\/g, '/');
  execSync(`npx wrangler r2 object put "${r2Key}" --file="${fileArg}"`, { cwd: projectRoot, stdio: 'inherit' });
}

async function main() {
  const media = JSON.parse(readFileSync(MEDIA_PATH, 'utf8'));
  if (!Array.isArray(media)) {
    throw new Error(`Expected ${MEDIA_PATH} to be an array.`);
  }

  const comics = media.filter((m) => m.category === 'comics');
  console.log(`Prefetching ${comics.length} comics covers from Biosector...`);

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < comics.length; i++) {
    const m = comics[i];
    const pageTitle = issuePageTitleFromMedia(m);
    const issueUrl = `https://biosector01.com/wiki/${toUrlSegment(pageTitle)}`;

    try {
      const wikitext = await fetchWikitextForIssue(pageTitle);
      if (!wikitext) throw new Error('Empty wikitext');

      const filenames = extractCoverFilenamesFromWikitext(wikitext);
      if (filenames.length === 0) {
        console.warn(`  [${i + 1}/${comics.length}] No cover images found: ${m.id} (${issueUrl})`);
        skipped++;
        continue;
      }

      const mainFilename = filenames[0];
      const altFilename = filenames[1] ?? null;

      const mainKey = `${R2_PREFIX}/${m.id}/main`;
      const altKey = `${R2_PREFIX}/${m.id}/alt`;

      // Skip if already present (best-effort: rely on public R2 URLs).
      // If R2 isn't public, the script will still upload on the next run.
      const mainExisting = typeof m.imageUrl === 'string' && m.imageUrl.includes(`${R2_PREFIX}/${m.id}/main.`);
      const altExisting = typeof m.imageUrlAlt === 'string' && m.imageUrlAlt.includes(`${R2_PREFIX}/${m.id}/alt.`);
      if (mainExisting && (!altFilename || altExisting)) {
        skipped++;
        continue;
      }

      const mainUrl = fileUrlFromFilename(mainFilename);
      const altUrl = altFilename ? fileUrlFromFilename(altFilename) : null;

      // Download main
      const mainTempBase = join(TEMP_DIR, `${m.id}-main`);
      const mainTempPath = `${mainTempBase}.tmp`;
      const mainExt = await downloadToTemp(mainUrl, mainTempPath);
      unlinkSync(mainTempPath);

      const mainFinalTemp = `${mainTempBase}.${mainExt}`;
      // Re-download into final temp with correct extension for wrangler clarity.
      const mainExt2 = await downloadToTemp(mainUrl, mainFinalTemp);
      unlinkSync(mainFinalTemp);
      // Use ext returned by second download (should match).
      const finalMainExt = mainExt2;

      // Download again for upload (small inefficiency, but avoids mismatch on ext).
      await downloadToTemp(mainUrl, mainFinalTemp);

      // Upload main
      const mainR2KeyWithExt = `${mainKey}.${finalMainExt}`;
      uploadTempToR2({ key: mainR2KeyWithExt, tempPath: mainFinalTemp });

      // Copy to public for local-first static serving
      const publicMainDir = join(PUBLIC_COVERS_DIR, m.id);
      if (!existsSync(publicMainDir)) mkdirSync(publicMainDir, { recursive: true });
      copyFileSync(mainFinalTemp, join(publicMainDir, `main.${finalMainExt}`));

      const mainDirectUrl = `${R2_ENDPOINT}/${mainR2KeyWithExt}`;
      m.imageUrl = mainDirectUrl;
      unlinkSync(mainFinalTemp);

      // Download/upload alt if present
      if (altUrl) {
        const altTempBase = join(TEMP_DIR, `${m.id}-alt`);
        const altTempPath = `${altTempBase}.tmp`;
        const altExt1 = await downloadToTemp(altUrl, altTempPath);
        unlinkSync(altTempPath);

        const altFinalTemp = `${altTempBase}.${altExt1}`;
        await downloadToTemp(altUrl, altFinalTemp);

        const altR2KeyWithExt = `${altKey}.${altExt1}`;
        uploadTempToR2({ key: altR2KeyWithExt, tempPath: altFinalTemp });

        // Copy to public for local-first static serving
        const publicAltDir = join(PUBLIC_COVERS_DIR, m.id);
        if (!existsSync(publicAltDir)) mkdirSync(publicAltDir, { recursive: true });
        copyFileSync(altFinalTemp, join(publicAltDir, `alt.${altExt1}`));

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

