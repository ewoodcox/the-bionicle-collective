/**
 * Serve set photos from R2.
 *
 * R2 key structure: `set-photos/{setId}/{variant}.{ext}`
 * e.g. `set-photos/tahu-2001/built.jpg`
 *
 * GET /api/sets/photo/{setId}             → auto-picks best available variant
 * GET /api/sets/photo/{setId}?variant=box → serves that specific variant
 *
 * Falls back to the set's imageUrl from collection.json if nothing is found in R2.
 */
import { getSetById } from '../../../../data/sets';
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

/** Tried in order when no variant is specified. */
const DEFAULT_VARIANT_PRIORITY = ['built', 'front', 'box', 'parts'];

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

interface R2BucketLike {
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string }; etag?: string } | null>;
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

function candidateKeys(setId: string, variant: string | null): string[] {
  const keys: string[] = [];
  if (variant) {
    for (const ext of EXTENSIONS) {
      keys.push(`set-photos/${setId}/${variant}.${ext}`);
    }
  } else {
    for (const v of DEFAULT_VARIANT_PRIORITY) {
      for (const ext of EXTENSIONS) {
        keys.push(`set-photos/${setId}/${v}.${ext}`);
      }
    }
  }
  return keys;
}

export const GET = async ({ params, url, locals }: { params: { id?: string }; url: URL; locals: any }) => {
  const id = params.id ? decodeURIComponent(params.id) : '';
  if (!id) return new Response('Not found', { status: 404 });

  const variant = url.searchParams.get('variant') || null;
  const bucket = getBucket(locals);

  if (bucket) {
    const keys = candidateKeys(id, variant);
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
  const set = getSetById(id);
  if (set?.imageUrl) {
    return Response.redirect(set.imageUrl, 302);
  }

  return new Response('Not found', { status: 404 });
};
