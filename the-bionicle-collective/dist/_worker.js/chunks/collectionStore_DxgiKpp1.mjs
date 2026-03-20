globalThis.process ??= {}; globalThis.process.env ??= {};
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname$1, "..", "data", "collection-store.json");
async function readStore() {
  if (!existsSync(STORE_PATH)) return {};
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function writeStore(store) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
async function getCollectionEntry(setId) {
  const store = await readStore();
  return store[setId] ?? null;
}
async function upsertCollectionEntry(setId, data) {
  const store = await readStore();
  const existing = store[setId] ?? {};
  const merged = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? "",
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? "",
    status: data.status ?? existing.status ?? "",
    notes: data.notes ?? existing.notes ?? ""
  };
  store[setId] = merged;
  await writeStore(store);
  return merged;
}

export { getCollectionEntry, upsertCollectionEntry };
