/**
 * Serve media cover images from R2 (private bucket). Browser-safe replacement for
 * direct *.r2.cloudflarestorage.com URLs, which require auth and fail as <img src>.
 */
import { getMediaById } from '../../../../data/media';

export const prerender = false;

/** Must match bucket segment in stored URLs (see wrangler.jsonc bucket_name). */
const R2_BUCKET_SEGMENT = 'bionicle-collection';

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getBucket(locals: { runtime?: { env?: Env } }): R2Bucket | null {
  return locals.runtime?.env?.BIONICLE_COLLECTION ?? null;
}

function objectKeyFromStoredUrl(imageUrl: string): string | null {
  try {
    const u = new URL(imageUrl);
    if (!u.hostname.includes('r2.cloudflarestorage.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] !== R2_BUCKET_SEGMENT) return null;
    return parts.slice(1).join('/');
  } catch {
    return null;
  }
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
  const id = params.id;
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

  const key = objectKeyFromStoredUrl(chosenUrl);
  if (!key) {
    return new Response('Invalid media image URL', { status: 400 });
  }

  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response('Storage not configured', { status: 503 });
  }

  const obj = await bucket.get(key);
  if (!obj) {
    return new Response('Not found', { status: 404 });
  }

  const contentType = obj.httpMetadata?.contentType || contentTypeForKey(key);

  return new Response(obj.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      ...(obj.etag ? { ETag: obj.etag } : {}),
    },
  });
};
