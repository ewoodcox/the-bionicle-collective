/**
 * Tracks catalog sets (known LEGO set numbers not yet in collection.json) that the user owns.
 * Keys are stored as "year:setNumber" strings, e.g. "2001:8534".
 */

const R2_KEY = 'catalog-owned.json';

interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

export async function getCatalogOwnedKeys(bucket: R2BucketLike): Promise<string[]> {
  const object = await bucket.get(R2_KEY);
  if (!object) return [];
  const raw = await object.text();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    // ignore
  }
  return [];
}

export async function setCatalogOwnedKeys(bucket: R2BucketLike, keys: string[]): Promise<void> {
  const deduped = [...new Set(keys)];
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
}
