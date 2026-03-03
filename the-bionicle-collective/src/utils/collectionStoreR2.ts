/**
 * Collection store backed by Cloudflare R2.
 * Reads/writes collection.json in the bound R2 bucket.
 */

const R2_KEY = 'collection.json';

export interface CollectionEntry {
  acquiredDate?: string;
  acquiredFrom?: string;
  status?: string;
  notes?: string;
}

type StoreShape = Record<string, CollectionEntry>;

function parseStore(raw: string | null): StoreShape {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as StoreShape;
  } catch {
    // ignore
  }
  return {};
}

export async function getCollectionEntry(
  bucket: R2Bucket,
  setId: string
): Promise<CollectionEntry | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  return store[setId] ?? null;
}

export async function upsertCollectionEntry(
  bucket: R2Bucket,
  setId: string,
  data: CollectionEntry
): Promise<CollectionEntry> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  const existing = store[setId] ?? {};
  const merged: CollectionEntry = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? '',
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? '',
    status: data.status ?? existing.status ?? '',
    notes: data.notes ?? existing.notes ?? '',
  };
  store[setId] = merged;
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: 'application/json' },
  });
  return merged;
}
