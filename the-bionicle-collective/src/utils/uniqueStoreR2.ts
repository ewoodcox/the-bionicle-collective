/**
 * Unique items store backed by Cloudflare R2.
 * Stores custom builds, signed media, and other one-of-a-kind items.
 * Saved under `unique-store.json` in the bound R2 bucket.
 */

const R2_KEY = 'unique-store.json';

export interface UniqueItem {
  id: string;
  name: string;
  /** 'build' = shows in Other tab; 'media' = shows in Media tab */
  kind: 'build' | 'media';
  year?: number;
  imageUrl?: string;
  description?: string;
  acquiredDate?: string;
  acquiredFrom?: string;
  notes?: string;
  /** For builds: who built it (e.g. "Me", "Custom MOC") */
  builder?: string;
  /** For media: reference to an existing catalog item (e.g. a comic id) */
  mediaRef?: string;
  /** For media: who signed it */
  signedBy?: string;
}

interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

function parseItems(raw: string | null): UniqueItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as UniqueItem[];
  } catch {
    // ignore
  }
  return [];
}

async function getRaw(bucket: R2BucketLike): Promise<string | null> {
  const object = await bucket.get(R2_KEY);
  return object ? object.text() : null;
}

export async function getUniqueItems(bucket: R2BucketLike): Promise<UniqueItem[]> {
  const raw = await getRaw(bucket);
  return parseItems(raw);
}

export async function getUniqueItem(bucket: R2BucketLike, id: string): Promise<UniqueItem | null> {
  const items = await getUniqueItems(bucket);
  return items.find((i) => i.id === id) ?? null;
}

export async function createUniqueItem(bucket: R2BucketLike, item: UniqueItem): Promise<UniqueItem> {
  const items = await getUniqueItems(bucket);
  if (items.some((i) => i.id === item.id)) {
    throw new Error(`Unique item with id "${item.id}" already exists`);
  }
  items.push(item);
  await bucket.put(R2_KEY, JSON.stringify(items), {
    httpMetadata: { contentType: 'application/json' },
  });
  return item;
}

export async function updateUniqueItem(
  bucket: R2BucketLike,
  id: string,
  patch: Partial<Omit<UniqueItem, 'id'>>
): Promise<UniqueItem> {
  const items = await getUniqueItems(bucket);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error(`Unique item "${id}" not found`);
  items[idx] = { ...items[idx], ...patch };
  await bucket.put(R2_KEY, JSON.stringify(items), {
    httpMetadata: { contentType: 'application/json' },
  });
  return items[idx];
}

export async function deleteUniqueItem(bucket: R2BucketLike, id: string): Promise<void> {
  const items = await getUniqueItems(bucket);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) throw new Error(`Unique item "${id}" not found`);
  await bucket.put(R2_KEY, JSON.stringify(filtered), {
    httpMetadata: { contentType: 'application/json' },
  });
}
