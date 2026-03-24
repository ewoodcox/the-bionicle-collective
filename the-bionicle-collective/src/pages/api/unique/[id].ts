import type { APIContext } from 'astro';
import { getUniqueItem, updateUniqueItem, deleteUniqueItem } from '../../../utils/uniqueStoreR2';
import { isAuthenticated, isAuthConfigured } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: any; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

export async function GET({ params, locals }: APIContext) {
  const bucket = (locals as any).runtime?.env?.BIONICLE_COLLECTION;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Storage not available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const item = await getUniqueItem(bucket, params.id!);
  if (!item) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify(item), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT({ params, request, locals }: APIContext) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const updated = await updateUniqueItem(bucket, params.id!, body);
    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes('not found') ? 404 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE({ params, request, locals }: APIContext) {
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

  try {
    await deleteUniqueItem(bucket, params.id!);
    return new Response(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes('not found') ? 404 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
