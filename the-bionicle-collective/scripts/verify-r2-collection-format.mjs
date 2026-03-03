/**
 * Verify the format of collection.json in your R2 bucket.
 * The R2 migration expects: Record<setId, { acquiredDate?, acquiredFrom?, status?, notes? }>
 *
 * Usage:
 *   Option A: npx wrangler r2 object get bionicle-collection collection.json --file=./temp-collection.json
 *   Then: node scripts/verify-r2-collection-format.mjs ./temp-collection.json
 *
 *   Option B: If you have the file locally (e.g. downloaded from Cloudflare dashboard):
 *   node scripts/verify-r2-collection-format.mjs /path/to/collection.json
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const filePath = process.argv[2] || join(projectRoot, 'temp-collection.json');

if (!existsSync(filePath)) {
  console.log(`
To verify your R2 collection.json format:

1. Download it from Cloudflare:
   - Go to Workers & Pages → R2 → bionicle-collection bucket
   - Click on collection.json → Download

2. Save to the project root as temp-collection.json, then run:
   node scripts/verify-r2-collection-format.mjs temp-collection.json

   Or use wrangler (requires CLOUDFLARE_API_TOKEN or wrangler login):
   npx wrangler r2 object get "bionicle-collection/collection.json" --file=temp-collection.json --remote
   node scripts/verify-r2-collection-format.mjs temp-collection.json
`);
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(filePath, 'utf8');
} catch (e) {
  console.error('Could not read', filePath, e.message);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Invalid JSON:', e.message);
  process.exit(1);
}

console.log('\n=== R2 collection.json format verification ===\n');

if (Array.isArray(data)) {
  console.log('FORMAT: Array of set records (full collection catalog)');
  console.log('Expected for migration: Object keyed by set ID with overlay data');
  console.log('\nYour file appears to be the full set list, not the "In my collection" overlay.');
  console.log('The migration expects the *store* format: { "tahu-2001": { acquiredDate, acquiredFrom, status, notes }, ... }');
  console.log('\nIf you use this array format, we would need an adapter or different approach.');
  process.exit(1);
}

if (data && typeof data === 'object' && !Array.isArray(data)) {
  const keys = Object.keys(data);
  console.log(`Found ${keys.length} entries (keyed by set ID)\n`);

  if (keys.length === 0) {
    console.log('Object is empty. Compatible (will start fresh).');
    process.exit(0);
  }

  const sampleKey = keys[0];
  const sample = data[sampleKey];
  const expectedFields = ['acquiredDate', 'acquiredFrom', 'status', 'notes'];
  const hasStoreFields = sample && typeof sample === 'object' && expectedFields.some((f) => f in sample);

  if (hasStoreFields) {
    console.log('COMPATIBLE: Object with collection-store style entries.');
    console.log('\nSample entry:', JSON.stringify({ [sampleKey]: sample }, null, 2));
    console.log('\nYour R2 collection.json is ready for the migration.');
    process.exit(0);
  }

  console.log('FORMAT: Object, but values may not match expected structure');
  console.log('\nSample entry:', JSON.stringify({ [sampleKey]: sample }, null, 2));
  console.log('\nExpected fields per entry: acquiredDate?, acquiredFrom?, status?, notes?');
  console.log('If your structure differs, we may need an adapter.');
  process.exit(1);
}

console.log('Unexpected format. Could not determine structure.');
process.exit(1);
