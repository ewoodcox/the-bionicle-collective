/**
 * Kanoka disk ownership store backed by Cloudflare R2.
 * Stores an array of owned disk IDs (e.g. "116", "279", "vakama").
 * Default (empty / missing) = no disks owned.
 */

const R2_KEY = 'kanoka-collection.json';

interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

export async function getKanokaOwnedIds(bucket: R2BucketLike): Promise<string[]> {
  const object = await bucket.get(R2_KEY);
  if (!object) return [];
  const raw = await object.text();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return [...new Set(parsed.filter((x): x is string => typeof x === 'string'))];
  } catch {
    // ignore
  }
  return [];
}

export async function setKanokaOwnedIds(bucket: R2BucketLike, ids: string[]): Promise<void> {
  const deduped = [...new Set(ids)];
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
}
