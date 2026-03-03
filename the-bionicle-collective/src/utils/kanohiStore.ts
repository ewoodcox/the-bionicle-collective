/**
 * Kanohi collection store (file-based, for local dev).
 * Uses src/data/kanohi-store.json.
 */
/// <reference types="node" />

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname, '..', 'data', 'kanohi-store.json');

async function readStore(): Promise<string[]> {
  if (!existsSync(STORE_PATH)) return [];
  try {
    const raw = await readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    // ignore
  }
  return [];
}

async function writeStore(ids: string[]): Promise<void> {
  await writeFile(STORE_PATH, JSON.stringify(ids, null, 2), 'utf8');
}

export async function getKanohiOwnedIds(): Promise<string[]> {
  return readStore();
}

export async function setKanohiOwnedIds(ids: string[]): Promise<void> {
  await writeStore([...new Set(ids)].filter(Boolean));
}
