/**
 * Lightweight audit log stored in R2.
 * Every write operation appends an entry; entries older than 30 days are pruned.
 * Log writes are best-effort — failures are swallowed so they never block data writes.
 */

const R2_KEY = 'change-log.json';
const MAX_AGE_DAYS = 30;
const MAX_ENTRIES = 300;

export interface ChangeEntry {
  id: string;
  timestamp: string;
  action: string;
  entityId: string;
  before: unknown;
  after: unknown;
}

interface LogShape {
  entries: ChangeEntry[];
}

interface R2BucketLike {
  get(key: string): Promise<{ text(): Promise<string> } | null>;
  put(key: string, value: string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

function parseLog(raw: string | null): ChangeEntry[] {
  if (!raw) return [];
  try {
    const parsed: LogShape = JSON.parse(raw);
    if (Array.isArray(parsed?.entries)) return parsed.entries;
  } catch {
    // ignore
  }
  return [];
}

function pruned(entries: ChangeEntry[]): ChangeEntry[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return entries
    .filter((e) => new Date(e.timestamp).getTime() > cutoff)
    .slice(0, MAX_ENTRIES);
}

/** Append a new entry. Silently swallows errors so a log failure never blocks a data write. */
export async function appendLog(bucket: R2BucketLike, entry: Omit<ChangeEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const object = await bucket.get(R2_KEY);
    const raw = object ? await object.text() : null;
    const existing = parseLog(raw);
    const newEntry: ChangeEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const entries = pruned([newEntry, ...existing]);
    await bucket.put(R2_KEY, JSON.stringify({ entries }), {
      httpMetadata: { contentType: 'application/json' },
    });
  } catch {
    // best-effort — never propagate
  }
}

/** Read the log. Returns entries newest-first. */
export async function getLog(bucket: R2BucketLike): Promise<ChangeEntry[]> {
  try {
    const object = await bucket.get(R2_KEY);
    const raw = object ? await object.text() : null;
    return parseLog(raw);
  } catch {
    return [];
  }
}
