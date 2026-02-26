/**
 * Collection store backed by Cloudflare KV.
 * Used when running on Cloudflare (env.COLLECTION_STORE is bound).
 */

const KV_KEY = 'collection-store';

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
  kv: KVNamespace,
  setId: string
): Promise<CollectionEntry | null> {
  const raw = await kv.get(KV_KEY);
  const store = parseStore(raw);
  return store[setId] ?? null;
}

export async function upsertCollectionEntry(
  kv: KVNamespace,
  setId: string,
  data: CollectionEntry
): Promise<CollectionEntry> {
  const raw = await kv.get(KV_KEY);
  const store = parseStore(raw);
  const existing = store[setId] ?? {};
  const merged: CollectionEntry = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? '',
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? '',
    status: data.status ?? existing.status ?? '',
    notes: data.notes ?? existing.notes ?? '',
  };
  store[setId] = merged;
  await kv.put(KV_KEY, JSON.stringify(store));
  return merged;
}
