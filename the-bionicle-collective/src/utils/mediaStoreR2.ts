/**
 * Media owned-store backed by Cloudflare R2.
 *
 * Similar to Kanohi ownership:
 * - Store a JSON array of media IDs that the editor owns.
 * - Saved under `media-collection.json` in the bound R2 bucket.
 */

const R2_KEY = 'media-collection.json';

/** Minimal R2 bucket interface (matches Cloudflare Workers R2Bucket binding). */
interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  } catch {
    // ignore
  }
  return [];
}

export async function getMediaOwnedIds(bucket: R2BucketLike): Promise<string[]> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  return parseIds(raw);
}

export async function setMediaOwnedIds(bucket: R2BucketLike, ids: string[]): Promise<string[]> {
  const deduped = [...new Set(ids)].filter((x) => typeof x === 'string' && x.trim() !== '');
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
  return deduped;
}

