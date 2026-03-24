/**
 * Prefetch Bionicle book cover images from Biosector01.
 *
 * Strategy:
 *   Parse each book's BS01 wiki page (via the MediaWiki API) and extract the
 *   cover image filename from the infobox. Download and upload to R2, then
 *   update src/data/media.json with the R2 URL.
 *
 * Requirements:
 *   - `.env`: R2_BUCKET_NAME, R2_ENDPOINT
 *   - Wrangler auth (npx wrangler login or CLOUDFLARE_API_TOKEN)
 *
 * Run:
 *   node scripts/prefetch-book-covers.mjs
 *   node scripts/prefetch-book-covers.mjs --force
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

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

loadDotEnv(join(projectRoot, '.env'));

const MEDIA_PATH = join(projectRoot, 'src', 'data', 'media.json');
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const FORCE = process.argv.includes('--force');

if (!R2_BUCKET || !R2_ENDPOINT) {
  console.error('Missing R2 env. Ensure .env has R2_BUCKET_NAME and R2_ENDPOINT.');
  process.exit(1);
}

const R2_PREFIX = 'media-covers';
const TEMP_DIR = join(projectRoot, '.tmp-prefetch-book-covers');
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; BionicleCollective/1.0; +https://bioniclecollective.com)',
};

/**
 * Construct the BS01 wiki page title for a book from its issueNumber and title.
 *
 * issueNumber formats: "Chronicles N", "Adventures N", "Legends N",
 *                      "Bara Magna N", "G2 N", "Movie"
 */
function bookPageTitle(m) {
  const issue = (m.issueNumber ?? '').trim();
  const title = m.title;

  const chron = issue.match(/^Chronicles\s+(\d+)$/i);
  if (chron) return `BIONICLE Chronicles ${chron[1]}: ${title}`;

  const adv = issue.match(/^Adventures\s+(\d+)$/i);
  if (adv) return `BIONICLE Adventures ${adv[1]}: ${title}`;

  const leg = issue.match(/^Legends\s+(\d+)$/i);
  if (leg) return `BIONICLE Legends ${leg[1]}: ${title}`;

  // Bara Magna books: novelization of The Legend Reborn has a disambiguated page title
  const bara = issue.match(/^Bara Magna\s+(\d+)$/i);
  if (bara) {
    if (title === 'The Legend Reborn') return `BIONICLE: The Legend Reborn (Book)`;
    return `BIONICLE: ${title}`;
  }

  const g2 = issue.match(/^G2\s+(\d+)$/i);
  if (g2) return `BIONICLE: ${title}`;

  if (issue.toLowerCase() === 'movie') return `BIONICLE: Mask of Light`;

  throw new Error(`Unrecognized issueNumber "${issue}" for book id=${m.id}`);
}

async function fetchWikitext(pageTitle) {
  const url = `https://biosector01.com/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext&format=json`;
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`BS01 API ${res.status} for "${pageTitle}"`);
  const json = await res.json();
  if (json.error) throw new Error(`BS01 API error for "${pageTitle}": ${JSON.stringify(json.error)}`);
  return json?.parse?.wikitext?.['*'] ?? '';
}

/**
 * Extract the first image filename from a wikitext infobox.
 * Looks for |image=, |cover=, then falls back to any [[Image:...]] / [[File:...]] occurrence.
 */
function extractImageFromWikitext(wikitext) {
  // Named param: |image= or |cover=
  for (const param of ['image', 'cover']) {
    const re = new RegExp(`\\|\\s*${param}\\s*=\\s*([^\\|\\}\\n]+)`, 'i');
    const m = wikitext.match(re);
    if (m) {
      const val = m[1].trim();
      // Could be a bare filename or [[Image:Foo.png|...]]
      const inner = val.match(/\[\[(?:Image|File):([^\|\]]+)/i);
      if (inner) return inner[1].trim();
      if (val && !val.startsWith('[[') && !val.startsWith('{{')) return val;
    }
  }

  // Fallback: first [[Image:...]] or [[File:...]] in entire wikitext
  const fallback = wikitext.match(/\[\[(?:Image|File):([^\|\]]+)/i);
  if (fallback) return fallback[1].trim();

  return null;
}

function fileUrlFromFilename(filename) {
  return `https://biosector01.com/wiki/Special:FilePath/${encodeURIComponent(filename).replace(/%20/g, '_')}`;
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

async function downloadToTemp(url, tempPath) {
  const res = await fetch(url, { redirect: 'follow', headers: FETCH_HEADERS });
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${url}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('image/')) throw new Error(`Non-image content-type "${ct}" for ${url}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength < 500) throw new Error(`Suspiciously small file (${buf.byteLength} bytes) for ${url}`);
  writeFileSync(tempPath, Buffer.from(buf));
  return extFromContentType(ct, extFromUrl(res.url || url));
}

function uploadToR2(key, tempPath) {
  const r2Key = `${R2_BUCKET}/${key}`;
  const fileArg = tempPath.replace(/\\/g, '/');
  execSync(`npx wrangler r2 object put "${r2Key}" --file="${fileArg}" --remote`, {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

async function main() {
  const media = JSON.parse(readFileSync(MEDIA_PATH, 'utf8'));
  const books = media.filter((m) => m.category === 'books');
  console.log(`Fetching covers for ${books.length} books...${FORCE ? ' (--force)' : ''}`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < books.length; i++) {
    const m = books[i];
    const label = `[${i + 1}/${books.length}] ${m.id}`;

    const alreadyHasR2 =
      typeof m.imageUrl === 'string' && m.imageUrl.includes(`${R2_PREFIX}/${m.id}/main.`);

    if (!FORCE && alreadyHasR2) {
      skipped++;
      continue;
    }

    let pageTitle;
    try {
      pageTitle = bookPageTitle(m);
    } catch (e) {
      console.warn(`${label}: skipping — ${e.message}`);
      failed++;
      continue;
    }

    console.log(`${label}: fetching "${pageTitle}"`);

    try {
      const wikitext = await fetchWikitext(pageTitle);
      if (!wikitext) throw new Error('Empty wikitext');

      const filename = extractImageFromWikitext(wikitext);
      if (!filename) throw new Error(`No image found in wikitext for "${pageTitle}"`);

      console.log(`  → image: ${filename}`);

      const imgUrl = fileUrlFromFilename(filename);
      const tempPath = join(TEMP_DIR, `${m.id}.dl`);
      const ext = await downloadToTemp(imgUrl, tempPath);

      const r2Key = `${R2_PREFIX}/${m.id}/main.${ext}`;
      uploadToR2(r2Key, tempPath);

      // Update media.json entry (find by id in original array)
      const idx = media.findIndex((x) => x.id === m.id);
      if (idx !== -1) {
        media[idx].imageUrl = `${R2_ENDPOINT}/${r2Key}`;
      }

      unlinkSync(tempPath);
      updated++;
      console.log(`  ✓ uploaded to R2: ${r2Key}`);
    } catch (e) {
      console.warn(`${label}: FAILED — ${e.message}`);
      failed++;
    }

    await delay(300);
  }

  writeFileSync(MEDIA_PATH, JSON.stringify(media, null, 2), 'utf8');
  console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}, failed: ${failed}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
