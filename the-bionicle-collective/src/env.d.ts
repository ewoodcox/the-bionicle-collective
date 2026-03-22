/// <reference path="../.astro/types.d.ts" />

/**
 * R2 / object body — minimal shapes used in this repo.
 * Avoids `/// <reference types="@cloudflare/workers-types" />`, which breaks when
 * the package is missing from node_modules or the IDE can’t resolve it.
 * (You can still install `@cloudflare/workers-types` for richer editor hints elsewhere.)
 */
interface R2ObjectBody {
  readonly body: ReadableStream;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  json(): Promise<unknown>;
  httpMetadata?: { contentType?: string };
  etag?: string;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  delete(keys: string | string[]): Promise<void>;
  head(key: string): Promise<R2ObjectBody | null>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    objects: { key: string }[];
    truncated: boolean;
    cursor?: string;
  }>;
}

/** Resolved at runtime by Cloudflare Workers / Astro Cloudflare adapter. */
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}