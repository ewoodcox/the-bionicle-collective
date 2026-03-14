/**
 * Rate limiting backed by R2.
 * Stores timestamps per IP for contact (5/hour) and suggestions (5/day).
 */

/// <reference types="@cloudflare/workers-types" />

const R2_KEY = 'rate-limit.json';
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SUGGESTIONS_LIMIT = 5;
const SUGGESTIONS_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day

type RateLimitStore = {
  [ip: string]: {
    contact?: number[];
    suggestions?: number[];
  };
};

function parseStore(raw: string | null): RateLimitStore {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as RateLimitStore;
  } catch {
    // ignore
  }
  return {};
}

function pruneTimestamps(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff);
}

export async function checkRateLimitContact(
  bucket: R2Bucket | null | undefined,
  ip: string
): Promise<boolean> {
  if (!bucket) return true; // Skip rate limit when R2 not available (e.g. local dev)
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  const entry = store[ip] ?? {};
  let contact = pruneTimestamps(entry.contact ?? [], CONTACT_WINDOW_MS);

  if (contact.length >= CONTACT_LIMIT) return false;

  contact.push(Date.now());
  store[ip] = { ...entry, contact };
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: 'application/json' },
  });
  return true;
}

export async function checkRateLimitSuggestions(
  bucket: R2Bucket | null | undefined,
  ip: string
): Promise<boolean> {
  if (!bucket) return true; // Skip rate limit when R2 not available (e.g. local dev)
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  const entry = store[ip] ?? {};
  let suggestions = pruneTimestamps(entry.suggestions ?? [], SUGGESTIONS_WINDOW_MS);

  if (suggestions.length >= SUGGESTIONS_LIMIT) return false;

  suggestions.push(Date.now());
  store[ip] = { ...entry, suggestions };
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: 'application/json' },
  });
  return true;
}
