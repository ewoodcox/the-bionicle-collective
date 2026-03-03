import type { APIRoute } from 'astro';
import * as kanohiStore from '../../../utils/kanohiStore';
import * as kanohiStoreR2 from '../../../utils/kanohiStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: () => kanohiStoreR2.getKanohiOwnedIds(bucket),
      set: (ids: string[]) => kanohiStoreR2.setKanohiOwnedIds(bucket, ids),
    };
  }
  return {
    get: () => kanohiStore.getKanohiOwnedIds(),
    set: async (ids: string[]) => {
      await kanohiStore.setKanohiOwnedIds(ids);
      return ids;
    },
  };
}

export const GET: APIRoute = async ({ locals }) => {
  const store = getStore(locals);
  const ownedIds = await store.get();
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

  let body: { maskId?: string; owned?: boolean; ownedIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const store = getStore(locals);
  let ownedIds: string[];

  if (Array.isArray(body.ownedIds)) {
    ownedIds = body.ownedIds.filter((id): id is string => typeof id === 'string').filter(Boolean);
  } else {
    const maskId = typeof body.maskId === 'string' ? body.maskId.trim() : '';
    const owned = body.owned === true;
    if (!maskId) {
      return new Response(JSON.stringify({ error: 'Missing maskId' }), { status: 400 });
    }
    ownedIds = await store.get();
    if (owned) {
      if (!ownedIds.includes(maskId)) ownedIds = [...ownedIds, maskId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== maskId);
    }
  }

  try {
    await store.set(ownedIds);
  } catch (err) {
    console.error('Kanohi store set failed:', err);
    return new Response(
      JSON.stringify({
        error: 'Failed to save. Check that R2 bucket is bound and accessible.',
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
