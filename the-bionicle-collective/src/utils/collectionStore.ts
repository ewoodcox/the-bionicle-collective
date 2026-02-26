import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname, '..', 'data', 'collection-store.json');

export interface CollectionEntry {
  acquiredDate?: string;
  acquiredFrom?: string;
  status?: string;
  notes?: string;
}

type StoreShape = Record<string, CollectionEntry>;

async function readStore(): Promise<StoreShape> {
  if (!existsSync(STORE_PATH)) return {};
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as StoreShape;
  } catch {
    // Ignore and fall through to empty object.
  }
  return {};
}

async function writeStore(store: StoreShape): Promise<void> {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export async function getCollectionEntry(setId: string): Promise<CollectionEntry | null> {
  const store = await readStore();
  return store[setId] ?? null;
}

export async function upsertCollectionEntry(setId: string, data: CollectionEntry): Promise<CollectionEntry> {
  const store = await readStore();
  const existing = store[setId] ?? {};
  const merged: CollectionEntry = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? '',
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? '',
    status: data.status ?? existing.status ?? '',
    notes: data.notes ?? existing.notes ?? '',
  };
  store[setId] = merged;
  await writeStore(store);
  return merged;
}

