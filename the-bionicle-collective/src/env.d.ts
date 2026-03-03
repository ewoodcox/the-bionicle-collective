/// <reference path="../.astro/types.d.ts" />

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}