/**
 * Serve media cover images from R2 (private bucket). Browser-safe replacement for
 * direct *.r2.cloudflarestorage.com URLs, which require auth and fail as <img src>.
 */
import { getMediaById, type MediaRecord } from '../../../../data/media';
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

/** Must match bucket segment in stored URLs (see wrangler.jsonc bucket_name). */
const R2_BUCKET_SEGMENT = 'bionicle-collection';

/** Subset of R2 get() result used below (avoids tight coupling to Workers typings in this file). */
type R2ObjectForResponse = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  etag?: string;
};

/** Minimal R2 binding surface for this route. */
interface R2BucketLike {
  get(key: string): Promise<R2ObjectForResponse | null>;
}

type Env = { BIONICLE_COLLECTION?: R2BucketLike };

/**
 * R2 binding: `locals.runtime.env` (Astro 5) and/or `cloudflare:workers` `env` (Astro 6+).
 * Binding name must match `wrangler.jsonc` → `r2_buckets[].binding` (`BIONICLE_COLLECTION`).
 */
function getBucket(locals: { runtime?: { env?: Env } }): R2BucketLike | null {
  const fromLocals = locals?.runtime?.env?.BIONICLE_COLLECTION;
  if (fromLocals) return fromLocals;
  const fromCf = cfEnv as unknown as Env;
  return fromCf?.BIONICLE_COLLECTION ?? null;
}

function objectKeyFromStoredUrl(imageUrl: string): string | null {
  try {
    const u = new URL(imageUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    // S3-style: https://<account>.r2.cloudflarestorage.com/<bucket>/<key...>
    if (u.hostname.includes('r2.cloudflarestorage.com') && parts[0] === R2_BUCKET_SEGMENT) {
      return parts.slice(1).join('/');
    }
    // Public/custom host: path may start with `media-covers/...` (no bucket segment)
    if (parts[0] === 'media-covers') {
      return parts.join('/');
    }
    return null;
  } catch {
    return null;
  }
}

function extFromStoredUrl(url: string | undefined): string {
  if (!url) return 'png';
  const m = url.match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  if (!m) return 'png';
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}

/** Try several keys in order: parsed URL, then canonical `media-covers/<id>/main|alt.<ext>` fallbacks. */
function candidateKeysForMedia(media: MediaRecord, variant: 'main' | 'alt'): string[] {
  const primaryUrl = variant === 'alt' && media.imageUrlAlt?.trim() ? media.imageUrlAlt : media.imageUrl;
  const keys: string[] = [];
  const fromStored = primaryUrl ? objectKeyFromStoredUrl(primaryUrl) : null;
  if (fromStored) keys.push(fromStored);

  const ext = extFromStoredUrl(primaryUrl);
  keys.push(`media-covers/${media.id}/${variant}.${ext}`);

  // Extension fallbacks (uploaded file may differ from JSON hint)
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'gif'] as const;
  for (const e of exts) {
    keys.push(`media-covers/${media.id}/${variant}.${e}`);
  }
  return [...new Set(keys)];
}

function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

export const GET = async ({ params, url, locals }: { params: { id?: string }; url: URL; locals: any }) => {
  const rawId = params.id;
  const id = rawId ? decodeURIComponent(rawId) : '';
  if (!id) {
    return new Response('Not found', { status: 404 });
  }

  const media = getMediaById(id);
  if (!media) {
    return new Response('Not found', { status: 404 });
  }

  const variant = url.searchParams.get('variant') === 'alt' ? 'alt' : 'main';
  const chosenUrl =
    variant === 'alt' && media.imageUrlAlt && media.imageUrlAlt.trim() !== '' ? media.imageUrlAlt : media.imageUrl;

  if (!chosenUrl || chosenUrl.trim() === '') {
    return new Response('Not found', { status: 404 });
  }

  // Placeholders and other public HTTPS URLs — redirect (works in <img>)
  if (!chosenUrl.includes('r2.cloudflarestorage.com')) {
    return Response.redirect(chosenUrl, 302);
  }

  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response('Storage not configured', { status: 503 });
  }

  const keys = candidateKeysForMedia(media, variant);
  let obj: R2ObjectForResponse | null = null;
  let resolvedKey: string | null = null;
  for (const key of keys) {
    const o = await bucket.get(key);
    if (o) {
      obj = o;
      resolvedKey = key;
      break;
    }
  }

  if (!obj || !resolvedKey) {
    const body =
      `Cover not found in R2 for media id "${id}". Keys tried (in order):\n${keys.join('\n')}\n\n` +
      `Upload/sync must use this exact id as the folder name, e.g. media-covers/${id}/main.png in bucket "bionicle-collection".`;
    return new Response(body, {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const contentType = obj.httpMetadata?.contentType || contentTypeForKey(resolvedKey);

  return new Response(obj.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      ...(obj.etag ? { ETag: obj.etag } : {}),
    },
  });
};
