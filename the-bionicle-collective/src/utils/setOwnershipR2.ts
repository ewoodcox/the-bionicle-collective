/**
 * Set ownership store backed by Cloudflare R2.
 * Stores the array of set IDs that are NOT currently owned.
 * Default (empty file / missing key) = all sets in collection.json are owned.
 */

const R2_KEY = 'set-unowned.json';

interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

export async function getUnownedSetIds(bucket: R2BucketLike): Promise<string[]> {
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

export async function setUnownedSetIds(bucket: R2BucketLike, ids: string[]): Promise<void> {
  const deduped = [...new Set(ids)];
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
}
