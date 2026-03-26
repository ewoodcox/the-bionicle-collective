#!/usr/bin/env node
/**
 * Pre-warm R2 with Kanoka disk images from BrickLink.
 * Fetches each image from img.bricklink.com and uploads to R2 under kanoka-images/.
 *
 * Requires: CLOUDFLARE_API_TOKEN in .env (or wrangler login)
 *
 * Usage: node --env-file=.env scripts/warm-kanoka-image-cache.mjs
 *        npm run warm:kanoka-images
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const kanokaPath = join(projectRoot, 'src', 'data', 'kanoka.json');
const BRICKLINK_IMG_BASE = 'https://img.bricklink.com/ItemImage';
const R2_BUCKET = 'bionicle-collection';
const R2_PREFIX = 'kanoka-images';
const DELAY_MS = 300;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let data;
try {
  data = JSON.parse(readFileSync(kanokaPath, 'utf8'));
} catch (e) {
  console.error('Could not read kanoka.json:', e.message);
  process.exit(1);
}

const kanokaList = Array.isArray(data) ? data : data.kanoka ?? [];
if (kanokaList.length === 0) {
  console.warn('kanoka.json is empty.');
  process.exit(0);
}

const seen = new Set();
const pairs = [];
for (const k of kanokaList) {
  const colorId = String(k.colorId ?? '').trim();
  const partId = String(k.partId ?? '').trim();
  if (!colorId || !partId) continue;
  const key = `${colorId}:${partId}`;
  if (seen.has(key)) continue;
  seen.add(key);
  pairs.push({ colorId, partId, id: k.id });
}

console.log(`Pre-warming ${pairs.length} Kanoka images to R2 (kanoka-images/)...\n`);

/** Strip pb suffix to get the base mold part ID (e.g. "32533pb117" → "32533"). */
function baseMold(partId) {
  return partId.replace(/pb\d+$/i, '');
}

async function fetchImage(colorId, partId) {
  const path = `PN/${colorId}/${partId}.png`;
  const url = `${BRICKLINK_IMG_BASE}/${path}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  return buf;
}

async function run() {
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < pairs.length; i++) {
    const { colorId, partId, id } = pairs[i];
    const r2Key = `${R2_PREFIX}/PN/${colorId}/${partId}.png`;
    const tempPath = join(projectRoot, `.warm-temp-kanoka-${id}.png`);

    try {
      let buf = await fetchImage(colorId, partId);
      let source = partId;

      if (!buf) {
        const mold = baseMold(partId);
        if (mold !== partId) {
          buf = await fetchImage(colorId, mold);
          if (buf) source = `${mold} (fallback)`;
        }
      }

      if (!buf) {
        console.warn(`  [${i + 1}/${pairs.length}] ${id} (${partId}) -> 404, no fallback (skipped)`);
        fail++;
        await sleep(DELAY_MS);
        continue;
      }

      writeFileSync(tempPath, Buffer.from(buf));
      execSync(
        `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${tempPath.replace(/\\/g, '/')}"`,
        { cwd: projectRoot, stdio: 'pipe' }
      );
      unlinkSync(tempPath);
      ok++;
      if ((i + 1) % 10 === 0 || i === pairs.length - 1) {
        console.log(`  [${i + 1}/${pairs.length}] ${ok} uploaded, ${fail} failed  (last: ${id} via ${source})`);
      }
    } catch (e) {
      try { unlinkSync(tempPath); } catch {}
      console.warn(`  [${i + 1}/${pairs.length}] ${id} -> ${e.message}`);
      fail++;
    }

    if (i < pairs.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone. ${ok} cached, ${fail} failed.`);
  if (fail > 0) {
    console.log('Remaining failures have no BrickLink image for the part or its base mold.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
