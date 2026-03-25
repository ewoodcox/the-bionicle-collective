/**
 * Krana collection store backed by Cloudflare R2.
 * Reads/writes krana-collection.json in the bound R2 bucket.
 */

import { appendLog } from './changeLogR2';

const R2_KEY = 'krana-collection.json';

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

export async function getKranaOwnedIds(bucket: R2BucketLike): Promise<string[]> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  return parseStore(raw);
}

export async function setKranaOwnedIds(bucket: R2BucketLike, ids: string[]): Promise<string[]> {
  const before = await getKranaOwnedIds(bucket);
  const deduped = [...new Set(ids)].filter(Boolean);
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: 'application/json' },
  });
  await appendLog(bucket, { action: 'krana.ownership', entityId: 'krana-collection', before, after: deduped });
  return deduped;
}
