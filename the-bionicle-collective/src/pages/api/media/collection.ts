import * as mediaStore from '../../../utils/mediaStore';
import * as mediaStoreR2 from '../../../utils/mediaStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: any; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

function getStore(locals: any) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: () => mediaStoreR2.getMediaOwnedIds(bucket as any),
      set: (ids: string[]) => mediaStoreR2.setMediaOwnedIds(bucket as any, ids),
    };
  }

  return {
    get: () => mediaStore.getMediaOwnedIds(),
    set: (ids: string[]) => mediaStore.setMediaOwnedIds(ids),
  };
}

export const GET = async ({ locals }: any) => {
  const store = getStore(locals);
  try {
    const ownedIds = await store.get();
    return new Response(JSON.stringify({ ownedIds }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Failed to load media ownership',
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const PUT = async ({ request, locals }: any) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Log in at the edit site home page.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let body: { mediaId?: string; owned?: boolean; ownedIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const store = getStore(locals);
  let ownedIds: string[];

  if (Array.isArray(body.ownedIds)) {
    ownedIds = body.ownedIds.filter((id): id is string => typeof id === 'string' && id.trim() !== '');
  } else {
    const mediaId = typeof body.mediaId === 'string' ? body.mediaId.trim() : '';
    const owned = body.owned === true;
    if (!mediaId) {
      return new Response(JSON.stringify({ error: 'Missing mediaId' }), { status: 400 });
    }

    ownedIds = await store.get();
    if (owned) {
      if (!ownedIds.includes(mediaId)) ownedIds = [...ownedIds, mediaId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== mediaId);
    }
  }

  try {
    await store.set(ownedIds);
  } catch (err) {
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

