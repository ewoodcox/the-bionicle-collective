/**
 * Kanohi collection store backed by Cloudflare R2.
 * Reads/writes kanohi-collection.json in the bound R2 bucket.
 */

const R2_KEY = 'kanohi-collection.json';

/** Minimal R2 bucket interface (matches Cloudflare Workers R2Bucket binding) */
interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

function parseStore(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    // ignore
  }
  return [];
}

export async function getKanohiOwnedIds(bucket: R2BucketLike): Promise<string[]> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  return parseStore(raw);
}

export async function setKanohiOwnedIds(bucket: R2BucketLike, ids: string[]): Promise<string[]> {
  const deduped = [...new Set(ids)].filter(Boolean);
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
  return deduped;
}
