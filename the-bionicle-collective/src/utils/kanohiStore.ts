/**
 * Kanohi collection store (file-based for local dev, in-memory fallback in Workers).
 * Uses src/data/kanohi-store.json when Node fs is available.
 * Falls back to in-memory when running in Cloudflare Workers (no fs).
 */
/// <reference types="node" />

const memoryStore: string[] = [];

function parseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

async function readStore(): Promise<string[]> {
  try {
    const { readFile } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const { dirname, join } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const STORE_PATH = join(__dirname, '..', 'data', 'kanohi-store.json');
    if (!existsSync(STORE_PATH)) return [...memoryStore];
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parseIds(parsed);
  } catch {
    return [...memoryStore];
  }
}

async function writeStore(ids: string[]): Promise<void> {
  memoryStore.length = 0;
  memoryStore.push(...ids);
  try {
    const { writeFile } = await import('fs/promises');
    const { dirname, join } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const STORE_PATH = join(__dirname, '..', 'data', 'kanohi-store.json');
    await writeFile(STORE_PATH, JSON.stringify(ids, null, 2), 'utf8');
  } catch {
    /* In Workers: memory store already updated above */
  }
}

export async function getKanohiOwnedIds(): Promise<string[]> {
  return readStore();
}

export async function setKanohiOwnedIds(ids: string[]): Promise<string[]> {
  const deduped = [...new Set(ids)].filter(Boolean);
  await writeStore(deduped);
  return deduped;
}
