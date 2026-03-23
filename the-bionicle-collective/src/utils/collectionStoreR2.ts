/**
 * Collection store backed by Cloudflare R2.
 * Reads/writes collection-store.json in the bound R2 bucket.
 * This is the master reference for "In my collection" bios; R2 is authoritative in production.
 *
 * Migration: If collection-store.json is missing but collection.json (legacy) exists, we read from
 * legacy and write to the new key so future reads use the canonical location.
 */
const R2_KEY = 'collection-store.json';
const LEGACY_KEY = 'collection.json';

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

async function getStoreRaw(bucket: any): Promise<string | null> {
  let object: any = null;
  try {
    object = await bucket.get(R2_KEY);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`R2 get failed for key "${R2_KEY}": ${message}`);
  }

  let raw: string | null = null;
  if (object) {
    try {
      raw = await object.text();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`R2 read failed for key "${R2_KEY}": ${message}`);
    }
  }
  if (!raw) {
    try {
      object = await bucket.get(LEGACY_KEY);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`R2 get failed for legacy key "${LEGACY_KEY}": ${message}`);
    }
    if (object) {
      try {
        raw = await object.text();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`R2 read failed for legacy key "${LEGACY_KEY}": ${message}`);
      }
    } else {
      raw = null;
    }
    if (raw) {
      try {
        await bucket.put(R2_KEY, raw, { httpMetadata: { contentType: 'application/json' } });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`R2 put failed for key "${R2_KEY}" (migration from legacy): ${message}`);
      }
    }
  }
  return raw;
}

export async function getCollectionEntry(bucket: any, setId: string): Promise<CollectionEntry | null> {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  return store[setId] ?? null;
}

export async function bulkPatchCollectionEntries(
  bucket: any,
  ids: string[],
  fields: Partial<CollectionEntry>
): Promise<void> {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  for (const id of ids) {
    const existing = store[id] ?? {};
    store[id] = {
      acquiredDate: 'acquiredDate' in fields ? (fields.acquiredDate ?? '') : (existing.acquiredDate ?? ''),
      acquiredFrom: 'acquiredFrom' in fields ? (fields.acquiredFrom ?? '') : (existing.acquiredFrom ?? ''),
      status: 'status' in fields ? (fields.status ?? '') : (existing.status ?? ''),
      notes: 'notes' in fields ? (fields.notes ?? '') : (existing.notes ?? ''),
    };
  }
  try {
    await bucket.put(R2_KEY, JSON.stringify(store), {
      httpMetadata: { contentType: 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`R2 put failed for key "${R2_KEY}": ${message}`);
  }
}

export async function upsertCollectionEntry(
  bucket: any,
  setId: string,
  data: CollectionEntry
): Promise<CollectionEntry> {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  const existing = store[setId] ?? {};
  const merged: CollectionEntry = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? '',
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? '',
    status: data.status ?? existing.status ?? '',
    notes: data.notes ?? existing.notes ?? '',
  };
  store[setId] = merged;
  try {
    await bucket.put(R2_KEY, JSON.stringify(store), {
      httpMetadata: { contentType: 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`R2 put failed for key "${R2_KEY}": ${message}`);
  }
  return merged;
}
