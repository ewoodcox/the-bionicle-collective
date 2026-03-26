import type { APIRoute } from 'astro';
import { getCatalogOwnedKeys, setCatalogOwnedKeys } from '../../../utils/catalogOwnedR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  const ownedKeys = bucket ? await getCatalogOwnedKeys(bucket) : [];
  return new Response(JSON.stringify({ ownedKeys }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Log in at the edit site home page.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  let body: { ownedKeys?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  if (!Array.isArray(body.ownedKeys)) {
    return new Response(JSON.stringify({ error: 'ownedKeys must be an array' }), { status: 400 });
  }

  const ownedKeys = body.ownedKeys
    .filter((k): k is string => typeof k === 'string')
    .filter(Boolean);

  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not available' }), { status: 503 });
  }

  try {
    await setCatalogOwnedKeys(bucket, ownedKeys);
  } catch (err) {
    console.error('Catalog-owned save failed:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to save.',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ ownedKeys }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
