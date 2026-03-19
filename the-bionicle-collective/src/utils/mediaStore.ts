/**
 * Media owned-store for local dev.
 *
 * In Workers we don't have fs, so this is only used when running locally.
 */

// Keep in-memory copy so GET/PUT can work even if fs writes fail.
const memoryStore: string[] = [];

function parseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string' && x.trim() !== '');
}

async function readStore(): Promise<string[]> {
  try {
    // Avoid relying on Node built-in type declarations.
    // For local dev only: use file URLs instead of `path` + `url`.
    const fsPromises = (await (new Function('return import("fs/promises")')() as Promise<any>)) as any;
    const STORE_URL = new URL('../data/media-store.json', import.meta.url);
    const raw = await fsPromises.readFile(STORE_URL, 'utf8');
    return parseIds(JSON.parse(raw));
  } catch {
    return [...memoryStore];
  }
}

async function writeStore(ids: string[]): Promise<void> {
  memoryStore.length = 0;
  memoryStore.push(...ids);
  try {
    // Avoid relying on Node built-in type declarations.
    const fsPromises = (await (new Function('return import("fs/promises")')() as Promise<any>)) as any;
    const STORE_URL = new URL('../data/media-store.json', import.meta.url);
    await fsPromises.writeFile(STORE_URL, JSON.stringify(ids, null, 2), 'utf8');
  } catch {
    // In Workers or restricted environments, fs isn't available.
  }
}

export async function getMediaOwnedIds(): Promise<string[]> {
  return readStore();
}

export async function setMediaOwnedIds(ids: string[]): Promise<string[]> {
  const deduped = [...new Set(ids)].filter((x) => typeof x === 'string' && x.trim() !== '');
  await writeStore(deduped);
  return deduped;
}

