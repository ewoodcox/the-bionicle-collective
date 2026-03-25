#!/usr/bin/env node
/**
 * Pre-warm R2 with Krana images from BrickLink.
 * Fetches each image from img.bricklink.com and uploads to R2.
 * Reuses the same R2 prefix as the Kanohi proxy (kanohi-images/).
 *
 * Requires: wrangler login (or CLOUDFLARE_API_TOKEN)
 *
 * Usage: node scripts/warm-krana-image-cache.mjs
 *        npm run warm:krana-images
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const kranaPath = join(projectRoot, 'src', 'data', 'krana.json');
const BRICKLINK_IMG_BASE = 'https://img.bricklink.com/ItemImage';
const R2_BUCKET = 'bionicle-collection';
const R2_PREFIX = 'kanohi-images'; // shared prefix with Kanohi proxy route
const DELAY_MS = 250;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let data;
try {
  data = JSON.parse(readFileSync(kranaPath, 'utf8'));
} catch (e) {
  console.error('Could not read krana.json:', e.message);
  process.exit(1);
}

const kranaList = data.krana ?? data;
if (!Array.isArray(kranaList)) {
  console.error('krana.json must have a "krana" array');
  process.exit(1);
}

if (kranaList.length === 0) {
  console.warn('krana.json is empty — populate it with BrickLink part IDs first.');
  process.exit(0);
}

const seen = new Set();
const pairs = [];
for (const k of kranaList) {
  const colorId = String(k.bricklinkColorId ?? '').trim();
  const partId = String(k.partId ?? '').trim();
  if (!colorId || !partId) continue;
  const key = `${colorId}:${partId}`;
  if (seen.has(key)) continue;
  seen.add(key);
  pairs.push({ colorId, partId });
}

console.log(`Pre-warming ${pairs.length} unique Krana images to R2...\n`);

async function run() {
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < pairs.length; i++) {
    const { colorId, partId } = pairs[i];
    const path = `PN/${colorId}/${partId}.png`;
    const r2Key = `${R2_PREFIX}/${path}`;
    const url = `${BRICKLINK_IMG_BASE}/${path}`;

    const tempPath = join(projectRoot, `.warm-temp-${colorId}-${partId}.png`);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`  [${i + 1}/${pairs.length}] ${path} -> ${res.status} (skipped)`);
        fail++;
        continue;
      }
      const buf = await res.arrayBuffer();
      writeFileSync(tempPath, Buffer.from(buf));

      execSync(
        `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${tempPath.replace(/\\/g, '/')}"`,
        { cwd: projectRoot, stdio: 'pipe' }
      );

      unlinkSync(tempPath);
      ok++;
      if ((i + 1) % 20 === 0 || i === pairs.length - 1) {
        console.log(`  [${i + 1}/${pairs.length}] ${ok} uploaded, ${fail} failed`);
      }
    } catch (e) {
      try { unlinkSync(tempPath); } catch {}
      console.warn(`  [${i + 1}/${pairs.length}] ${path} -> ${e.message}`);
      fail++;
    }

    if (i < pairs.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone. ${ok} cached, ${fail} failed.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
