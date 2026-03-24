/**
 * One-shot rescue script: uploads media covers from local wrangler R2 storage
 * to the remote R2 bucket. Use this when prefetch-media-covers.mjs previously
 * ran without --remote and the images are cached locally but not in production.
 *
 * Usage:
 *   node scripts/upload-local-covers-to-r2.mjs
 *   node scripts/upload-local-covers-to-r2.mjs --dry-run
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = (() => {
  try { return require('better-sqlite3'); } catch { return null; }
})();

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const SQLITE_PATH = join(
  projectRoot,
  '.wrangler/state/v3/r2/miniflare-R2BucketObject',
  '25b9a4e5d5d4c75cec3364018876347018d96ce2dbe6dbd7ec6555040d6aa634.sqlite'
);
const BLOBS_DIR = join(projectRoot, '.wrangler/state/v3/r2/bionicle-collection/blobs');
const R2_BUCKET = 'bionicle-collection';

if (!existsSync(SQLITE_PATH)) {
  console.error('Local wrangler SQLite not found:', SQLITE_PATH);
  process.exit(1);
}

// Use sqlite3 CLI since better-sqlite3 may not be installed
function queryRows() {
  const result = execSync(
    `sqlite3 "${SQLITE_PATH}" "SELECT key, blob_id, http_metadata FROM _mf_objects WHERE key LIKE 'media-covers%';"`,
    { encoding: 'utf8' }
  );
  return result.trim().split('\n').filter(Boolean).map((line) => {
    const parts = line.split('|');
    const key = parts[0];
    const blob_id = parts[1];
    const http_metadata = parts.slice(2).join('|');
    let contentType = 'application/octet-stream';
    try {
      const meta = JSON.parse(http_metadata);
      if (meta?.contentType) contentType = meta.contentType;
    } catch { /* */ }
    return { key, blob_id, contentType };
  });
}

const rows = queryRows();
console.log(`Found ${rows.length} media-cover objects in local wrangler storage.${DRY_RUN ? ' (dry-run)' : ''}\n`);

let ok = 0;
let failed = 0;

for (const { key, blob_id, contentType } of rows) {
  const blobPath = join(BLOBS_DIR, blob_id);
  if (!existsSync(blobPath)) {
    console.warn(`  MISSING blob for ${key} (${blob_id})`);
    failed++;
    continue;
  }

  const r2Key = `${R2_BUCKET}/${key}`;
  if (DRY_RUN) {
    console.log(`  would put: ${r2Key}  (${contentType})`);
    ok++;
    continue;
  }

  try {
    execSync(
      `npx wrangler r2 object put "${r2Key}" --file="${blobPath}" --content-type="${contentType}" --remote`,
      { cwd: projectRoot, stdio: 'inherit' }
    );
    console.log(`  ok: ${key}`);
    ok++;
  } catch {
    console.error(`  FAILED: ${key}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} uploaded, ${failed} failed.`);
if (failed > 0) process.exit(1);
