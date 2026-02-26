/**
 * One-time upload of src/data/collection-store.json to Cloudflare KV.
 * Usage: node scripts/upload-collection-store-to-kv.mjs <COLLECTION_STORE_NAMESPACE_ID>
 * Or set env COLLECTION_STORE_NAMESPACE_ID.
 *
 * Create the namespace first: npx wrangler kv namespace create "COLLECTION_STORE"
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const storePath = join(projectRoot, 'src', 'data', 'collection-store.json');

const namespaceId =
  process.env.COLLECTION_STORE_NAMESPACE_ID ||
  process.argv[2];

if (!namespaceId || namespaceId.includes('REPLACE')) {
  console.error('Usage: node scripts/upload-collection-store-to-kv.mjs <COLLECTION_STORE_NAMESPACE_ID>');
  console.error('Or set COLLECTION_STORE_NAMESPACE_ID in the environment.');
  console.error('Get the id from: npx wrangler kv namespace create "COLLECTION_STORE" (or from the dashboard).');
  process.exit(1);
}

let json;
try {
  json = readFileSync(storePath, 'utf8');
} catch (e) {
  console.error('Could not read', storePath, e.message);
  process.exit(1);
}

// Write to a temp file so we can pass to wrangler (avoids shell escaping)
const tmpPath = join(projectRoot, '.collection-store-upload-tmp.json');
try {
  writeFileSync(tmpPath, json, 'utf8');
  execSync(
    `npx wrangler kv key put "collection-store" --path="${tmpPath.replace(/\\/g, '/')}" --namespace-id=${namespaceId}`,
    { cwd: projectRoot, stdio: 'inherit' }
  );
  unlinkSync(tmpPath);
  console.log('Uploaded collection-store.json to KV key "collection-store".');
} catch (e) {
  try {
    unlinkSync(tmpPath);
  } catch {}
  console.error('Upload failed:', e.message);
  process.exit(1);
}
