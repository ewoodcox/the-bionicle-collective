import type { APIRoute } from 'astro';

export const prerender = false;

const BRICKLINK_IMG_BASE = 'https://img.bricklink.com/ItemImage';
const R2_PREFIX = 'kanoka-images/';

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getBucket(locals: App.Locals): R2Bucket | null {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  return env?.BIONICLE_COLLECTION ?? null;
}

export const GET: APIRoute = async ({ params, locals }) => {
  const pathParam = params.path;
  const path =
    pathParam == null ? '' : Array.isArray(pathParam) ? (pathParam as string[]).join('/') : String(pathParam);
  if (!path) {
    return new Response('Not found', { status: 404 });
  }
  // Allow alphanumeric part IDs (e.g. 32533pb159, 32171pb064)
  if (!path.match(/^PN\/\d+\/[A-Za-z0-9]+\.png$/i)) {
    return new Response('Invalid path', { status: 400 });
  }

  const bucket = getBucket(locals);
  const r2Key = R2_PREFIX + path;

  if (bucket) {
    const cached = await bucket.get(r2Key);
    if (cached) {
      const etag = cached.etag;
      return new Response(cached.body, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...(etag ? { ETag: etag } : {}),
        },
      });
    }
  }

  const bricklinkUrl = `${BRICKLINK_IMG_BASE}/${path}`;
  const fetchRes = await fetch(bricklinkUrl);
  if (!fetchRes.ok) {
    return new Response('Upstream error', { status: fetchRes.status });
  }

  const imageData = await fetchRes.arrayBuffer();

  if (bucket) {
    try {
      await bucket.put(r2Key, imageData, {
        httpMetadata: { contentType: 'image/png' },
      });
    } catch {
      // continue without caching
    }
  }

  return new Response(imageData, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
