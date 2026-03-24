/**
 * Upload everything under `public/set-photos/` to the R2 bucket.
 * Expected local structure: `public/set-photos/{year}/{setId}/{variant}.{ext}`
 * R2 object keys:           `set-photos/{year}/{setId}/{variant}.{ext}`
 *
 * Requirements:
 * - `.env`: `R2_BUCKET_NAME` (must match `wrangler.jsonc` → `bucket_name`, e.g. `bionicle-collection`)
 * - Wrangler auth: `npx wrangler login` or `CLOUDFLARE_API_TOKEN`
 *
 * Usage:
 *   node scripts/sync-set-photos-to-r2.mjs
 *   node scripts/sync-set-photos-to-r2.mjs --dry-run
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

const DRY_RUN = process.argv.includes('--dry-run');

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

const R2_BUCKET = process.env.R2_BUCKET_NAME;
const SET_PHOTOS_DIR = join(projectRoot, 'public', 'set-photos');
const R2_PREFIX = 'set-photos';

if (!R2_BUCKET) {
  console.error('Missing R2_BUCKET_NAME in .env (e.g. R2_BUCKET_NAME=bionicle-collection).');
  process.exit(1);
}

/**
 * Walk set photos and return { absPath, r2Key } pairs.
 * Expected structure: public/set-photos/{year}/{setId}/{variant}.jpg
 * Skips entries that don't match this 3-level layout.
 */
function collectUploads(dir) {
  /** @type {{ absPath: string; r2Key: string }[]} */
  const results = [];
  if (!existsSync(dir)) return results;

  for (const yearEnt of readdirSync(dir, { withFileTypes: true })) {
    if (yearEnt.name.startsWith('.') || !yearEnt.isDirectory()) continue;
    const yearDir = join(dir, yearEnt.name);

    for (const setEnt of readdirSync(yearDir, { withFileTypes: true })) {
      if (setEnt.name.startsWith('.') || !setEnt.isDirectory()) continue;
      const setDir = join(yearDir, setEnt.name);

      for (const file of readdirSync(setDir, { withFileTypes: true })) {
        if (file.name.startsWith('.') || file.name === 'Thumbs.db' || !file.isFile()) continue;
        results.push({
          absPath: join(setDir, file.name),
          r2Key: `${R2_PREFIX}/${yearEnt.name}/${setEnt.name}/${file.name}`,
        });
      }
    }
  }
  return results;
}

function main() {
  if (!existsSync(SET_PHOTOS_DIR)) {
    console.log(`No set-photos folder found at ${SET_PHOTOS_DIR}. Nothing to upload.`);
    process.exit(0);
  }

  const uploads = collectUploads(SET_PHOTOS_DIR);
  if (uploads.length === 0) {
    console.log('No set photos found. Nothing to upload.');
    process.exit(0);
  }

  console.log(
    `${DRY_RUN ? '[dry-run] ' : ''}Uploading ${uploads.length} set photo(s) to R2 bucket "${R2_BUCKET}"...\n`,
  );

  let ok = 0;
  let failed = 0;

  for (const { absPath, r2Key } of uploads) {
    const r2FullKey = `${R2_BUCKET}/${r2Key}`;
    const fileArg = absPath.replace(/\\/g, '/');

    if (DRY_RUN) {
      console.log(`  would put: ${r2FullKey}`);
      ok++;
      continue;
    }

    try {
      execSync(`npx wrangler r2 object put "${r2FullKey}" --file="${fileArg}" --remote`, {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      console.log(`  ok: ${r2Key}`);
      ok++;
    } catch {
      console.error(`  FAILED: ${r2Key}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
