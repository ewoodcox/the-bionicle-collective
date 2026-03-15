/**
 * Collection store backed by Cloudflare R2.
 * Reads/writes collection-store.json in the bound R2 bucket.
 * This is the master reference for "In my collection" bios; R2 is authoritative in production.
 *
 * Migration: If collection-store.json is missing but collection.json (legacy) exists, we read from
 * legacy and write to the new key so future reads use the canonical location.
 */
/// <reference types="@cloudflare/workers-types" />

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

async function getStoreRaw(bucket: R2Bucket): Promise<string | null> {
  let object = await bucket.get(R2_KEY);
  let raw = object ? await object.text() : null;
  if (!raw) {
    object = await bucket.get(LEGACY_KEY);
    raw = object ? await object.text() : null;
    if (raw) {
      await bucket.put(R2_KEY, raw, { httpMetadata: { contentType: 'application/json' } });
    }
  }
  return raw;
}

export async function getCollectionEntry(
  bucket: R2Bucket,
  setId: string
): Promise<CollectionEntry | null> {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  return store[setId] ?? null;
}

export async function upsertCollectionEntry(
  bucket: R2Bucket,
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
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: 'application/json' },
  });
  return merged;
}
