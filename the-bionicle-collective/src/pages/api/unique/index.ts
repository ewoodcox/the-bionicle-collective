import type { APIContext } from 'astro';
import { getUniqueItems, createUniqueItem, type UniqueItem } from '../../../utils/uniqueStoreR2';
import { isAuthenticated, isAuthConfigured } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: any; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET({ locals }: APIContext) {
  const bucket = (locals as any).runtime?.env?.BIONICLE_COLLECTION;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const items = await getUniqueItems(bucket);
    return new Response(JSON.stringify(items), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST({ request, locals }: APIContext) {
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

  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Partial<UniqueItem>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.name || !body.kind) {
    return new Response(JSON.stringify({ error: 'name and kind are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = body.id?.trim() || slugify(body.name) + '-unique';

  const item: UniqueItem = {
    id,
    name: body.name,
    kind: body.kind,
    ...(body.year !== undefined && { year: body.year }),
    ...(body.imageUrl && { imageUrl: body.imageUrl }),
    ...(body.description && { description: body.description }),
    ...(body.acquiredDate && { acquiredDate: body.acquiredDate }),
    ...(body.acquiredFrom && { acquiredFrom: body.acquiredFrom }),
    ...(body.notes && { notes: body.notes }),
    ...(body.builder && { builder: body.builder }),
    ...(body.mediaRef && { mediaRef: body.mediaRef }),
    ...(body.signedBy && { signedBy: body.signedBy }),
  };

  try {
    const created = await createUniqueItem(bucket, item);
    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
