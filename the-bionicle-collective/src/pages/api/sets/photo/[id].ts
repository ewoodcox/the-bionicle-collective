/**
 * Serve set photos from R2.
 *
 * R2 key structure: `set-photos/{year}/{setId}/{variant}.{ext}`
 * e.g. `set-photos/2001/tahu-2001/built.jpg`
 *
 * GET /api/sets/photo/{setId}             → auto-picks best available variant
 * GET /api/sets/photo/{setId}?variant=box → serves that specific variant
 *
 * Falls back to the set's imageUrl from collection.json if nothing is found in R2.
 */
import { getSetById } from '../../../../data/sets';
import { env as cfEnv } from 'cloudflare:workers';
import { isAuthConfigured, isAuthenticated } from '../../../../utils/adminAuth';

export const prerender = false;

/** Tried in order when no variant is specified. */
const DEFAULT_VARIANT_PRIORITY = ['built', 'front', 'box', 'parts'];

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

interface R2BucketLike {
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; etag?: string } | null>;
  put(key: string, value: ArrayBuffer | ReadableStream | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

type Env = {
  BIONICLE_COLLECTION?: R2BucketLike;
};

function getBucket(locals: { runtime?: { env?: Env } }): R2BucketLike | null {
  const fromLocals = locals?.runtime?.env?.BIONICLE_COLLECTION;
  if (fromLocals) return fromLocals;
  return (cfEnv as unknown as Env)?.BIONICLE_COLLECTION ?? null;
}

function contentTypeForKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function candidateKeys(setId: string, year: number, variant: string | null): string[] {
  const keys: string[] = [];
  const variants = variant ? [variant] : DEFAULT_VARIANT_PRIORITY;
  for (const v of variants) {
    for (const ext of EXTENSIONS) {
      keys.push(`set-photos/${year}/${setId}/${v}.${ext}`);
    }
  }
  return keys;
}

export const GET = async ({ params, url, locals }: { params: { id?: string }; url: URL; locals: any }) => {
  const id = params.id ? decodeURIComponent(params.id) : '';
  if (!id) return new Response('Not found', { status: 404 });

  const variant = url.searchParams.get('variant') || null;

  // Need the set record for year (used in R2 key) and imageUrl fallback
  const set = getSetById(id);

  const bucket = getBucket(locals);

  if (bucket && set) {
    const keys = candidateKeys(id, set.year, variant);
    for (const key of keys) {
      const obj = await bucket.get(key);
      if (obj) {
        const contentType = obj.httpMetadata?.contentType || contentTypeForKey(key);
        return new Response(obj.body, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            ...(obj.etag ? { ETag: obj.etag } : {}),
          },
        });
      }
    }
  }

  // Fall back to imageUrl from collection.json
  if (set?.imageUrl) {
    return Response.redirect(set.imageUrl, 302);
  }

  return new Response('Not found', { status: 404 });
};

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const POST = async ({ params, request, locals }: { params: { id?: string }; request: Request; locals: any }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const id = params.id ? decodeURIComponent(params.id) : '';
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const set = getSetById(id);
  if (!set) return new Response(JSON.stringify({ error: 'Set not found' }), { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid form data' }), { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return new Response(JSON.stringify({ error: 'File must be jpg, png, or webp' }), { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'File too large (max 5 MB)' }), { status: 400 });
  }

  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 503 });
  }

  const key = `set-photos/${set.year}/${id}/built.${ext}`;
  const buffer = await file.arrayBuffer();
  await bucket.put(key, buffer, { httpMetadata: { contentType: file.type } });

  return new Response(JSON.stringify({ ok: true, key }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
