import type { APIRoute } from 'astro';
import * as kranaStore from '../../../utils/kranaStore';
import * as kranaStoreR2 from '../../../utils/kranaStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: () => kranaStoreR2.getKranaOwnedIds(bucket),
      set: (ids: string[]) => kranaStoreR2.setKranaOwnedIds(bucket, ids),
    };
  }
  return {
    get: () => kranaStore.getKranaOwnedIds(),
    set: async (ids: string[]) => {
      await kranaStore.setKranaOwnedIds(ids);
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

  let body: { kranaId?: string; owned?: boolean; ownedIds?: unknown };
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
    const kranaId = typeof body.kranaId === 'string' ? body.kranaId.trim() : '';
    const owned = body.owned === true;
    if (!kranaId) {
      return new Response(JSON.stringify({ error: 'Missing kranaId' }), { status: 400 });
    }
    ownedIds = await store.get();
    if (owned) {
      if (!ownedIds.includes(kranaId)) ownedIds = [...ownedIds, kranaId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== kranaId);
    }
  }

  try {
    await store.set(ownedIds);
  } catch (err) {
    console.error('Krana store set failed:', err);
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
