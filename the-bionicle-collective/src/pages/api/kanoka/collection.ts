import type { APIRoute } from 'astro';
import { getKanokaOwnedIds, setKanokaOwnedIds } from '../../../utils/kanokaStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getBucket(locals: App.Locals): R2Bucket | null {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  return env?.BIONICLE_COLLECTION ?? null;
}

export const GET: APIRoute = async ({ locals }) => {
  const bucket = getBucket(locals);
  const ownedIds = bucket ? await getKanokaOwnedIds(bucket) : [];
  return new Response(JSON.stringify({ ownedIds }), {
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

  let body: { kanokaId?: string; owned?: boolean; ownedIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response(JSON.stringify({ error: 'R2 bucket not available' }), { status: 503 });
  }

  let ownedIds: string[];

  if (Array.isArray(body.ownedIds)) {
    ownedIds = body.ownedIds.filter((id): id is string => typeof id === 'string').filter(Boolean);
  } else {
    const kanokaId = typeof body.kanokaId === 'string' ? body.kanokaId.trim() : '';
    const owned = body.owned === true;
    if (!kanokaId) {
      return new Response(JSON.stringify({ error: 'Missing kanokaId' }), { status: 400 });
    }
    ownedIds = await getKanokaOwnedIds(bucket);
    if (owned) {
      if (!ownedIds.includes(kanokaId)) ownedIds = [...ownedIds, kanokaId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== kanokaId);
    }
  }

  try {
    await setKanokaOwnedIds(bucket, ownedIds);
  } catch (err) {
    console.error('Kanoka store set failed:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to save.',
        details: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ ownedIds }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
