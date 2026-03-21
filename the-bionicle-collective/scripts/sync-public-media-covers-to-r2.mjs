/**
 * Upload everything under `public/media-covers/` to the R2 bucket using the same
 * object keys as `prefetch-media-covers.mjs` and `/api/media/cover/[id]`:
 *   `media-covers/<media-id>/main.<ext>`  (and optional `alt.*`, etc.)
 *
 * Requirements:
 * - `.env`: `R2_BUCKET_NAME` (must match `wrangler.jsonc` → `bucket_name`, e.g. `bionicle-collection`)
 * - Wrangler auth: `npx wrangler login` or `CLOUDFLARE_API_TOKEN`
 *
 * Usage:
 *   node scripts/sync-public-media-covers-to-r2.mjs
 *   node scripts/sync-public-media-covers-to-r2.mjs --dry-run
 *   node scripts/sync-public-media-covers-to-r2.mjs --delete-local   # after each successful upload, remove local file
 */

import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const envPath = join(projectRoot, '.env');

const DRY_RUN = process.argv.includes('--dry-run');
const DELETE_LOCAL = process.argv.includes('--delete-local');

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
const PUBLIC_COVERS_DIR = join(projectRoot, 'public', 'media-covers');
const R2_PREFIX = 'media-covers';

if (!R2_BUCKET) {
  console.error('Missing R2_BUCKET_NAME. Add it to `.env` (same as prefetch-media-covers.mjs).');
  process.exit(1);
}

/** @param {string} dir */
function walkFiles(dir) {
  /** @type {string[]} */
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.name.startsWith('.')) continue;
    if (ent.isDirectory()) {
      results.push(...walkFiles(p));
    } else if (ent.isFile()) {
      if (ent.name === '.DS_Store' || ent.name === 'Thumbs.db') continue;
      results.push(p);
    }
  }
  return results;
}

function main() {
  if (!existsSync(PUBLIC_COVERS_DIR)) {
    console.error(`Folder not found: ${PUBLIC_COVERS_DIR}`);
    console.error('Create it or run prefetch-media-covers.mjs first so files exist under public/media-covers/.');
    process.exit(1);
  }

  const files = walkFiles(PUBLIC_COVERS_DIR);
  if (files.length === 0) {
    console.log(`No files under ${PUBLIC_COVERS_DIR}. Nothing to upload.`);
    process.exit(0);
  }

  console.log(
    `${DRY_RUN ? '[dry-run] ' : ''}Uploading ${files.length} file(s) to R2 bucket "${R2_BUCKET}"...\n`,
  );

  let ok = 0;
  let failed = 0;

  for (const absPath of files) {
    const rel = relative(PUBLIC_COVERS_DIR, absPath).replace(/\\/g, '/');
    const objectKey = `${R2_PREFIX}/${rel}`;
    const r2FullKey = `${R2_BUCKET}/${objectKey}`;
    const fileArg = absPath.replace(/\\/g, '/');

    if (DRY_RUN) {
      console.log(`  would put: ${r2FullKey}`);
      console.log(`           file: ${fileArg}`);
      ok++;
      continue;
    }

    try {
      execSync(`npx wrangler r2 object put "${r2FullKey}" --file="${fileArg}"`, {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      console.log(`  ok: ${objectKey}`);
      ok++;
      if (DELETE_LOCAL) {
        unlinkSync(absPath);
        console.log(`  [delete-local] removed ${fileArg}`);
      }
    } catch {
      console.error(`  FAILED: ${objectKey}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} succeeded, ${failed} failed.`);
  if (DELETE_LOCAL && !DRY_RUN) {
    console.log('Local files were deleted after upload (--delete-local).');
  }
  if (failed > 0) process.exit(1);
}

main();
