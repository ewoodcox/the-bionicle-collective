/**
 * Serve and upload photos for unique items.
 *
 * R2 key: `unique-items/{id}/main.{ext}`
 *
 * GET  /api/unique/photo/{id}  → serves from R2, falls back to external imageUrl
 * POST /api/unique/photo/{id}  → upload file, store in R2, update item's imageUrl
 */
import type { APIRoute } from 'astro';
import { getUniqueItem, updateUniqueItem } from '../../../utils/uniqueStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getBucket(locals: App.Locals): R2Bucket | null {
  return (locals as { runtime?: { env?: Env } }).runtime?.env?.BIONICLE_COLLECTION ?? null;
}

function contentType(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id;
  if (!id) return new Response('Not found', { status: 404 });

  const bucket = getBucket(locals);
  if (!bucket) return new Response('Not found', { status: 404 });

  for (const ext of EXTENSIONS) {
    const obj = await bucket.get(`unique-items/${id}/main.${ext}`);
    if (obj) {
      return new Response(obj.body, {
        status: 200,
        headers: {
          'Content-Type': contentType(ext),
          'Cache-Control': 'public, max-age=86400',
          ...(obj.etag ? { ETag: obj.etag } : {}),
        },
      });
    }
  }

  // Fall back to external imageUrl for items with a URL-based image
  const item = await getUniqueItem(bucket, id);
  if (item?.imageUrl && item.imageUrl.startsWith('http')) {
    return Response.redirect(item.imageUrl, 302);
  }

  return new Response('Not found', { status: 404 });
};

export const POST: APIRoute = async ({ params, request, locals }) => {
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

  const id = params.id;
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 503 });
  }

  const item = await getUniqueItem(bucket, id);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 });
  }

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

  const key = `unique-items/${id}/main.${ext}`;
  const buffer = await file.arrayBuffer();
  await bucket.put(key, buffer, { httpMetadata: { contentType: file.type } });

  // Point the item's imageUrl at the API route so it always serves from R2
  await updateUniqueItem(bucket, id, { imageUrl: `/api/unique/photo/${id}` });

  return new Response(JSON.stringify({ ok: true, key }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
