import type { APIRoute } from 'astro';
import { getCollectionEntry, upsertCollectionEntry } from '../../../utils/collectionStore';
import * as storeR2 from '../../../utils/collectionStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

// Dynamic API route: don't prerender at build, run only on request.
export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: (id: string) => storeR2.getCollectionEntry(bucket, id),
      put: (id: string, data: storeR2.CollectionEntry) =>
        storeR2.upsertCollectionEntry(bucket, id, data),
    };
  }
  return {
    get: (id: string) => getCollectionEntry(id),
    put: (id: string, data: { acquiredDate?: string; acquiredFrom?: string; status?: string; notes?: string }) =>
      upsertCollectionEntry(id, data),
  };
}

export const GET: APIRoute = async ({ params, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  const store = getStore(locals);
  const entry = await store.get(id);
  const payload = {
    acquiredDate: entry?.acquiredDate ?? '',
    acquiredFrom: entry?.acquiredFrom ?? '',
    status: entry?.status ?? '',
    notes: entry?.notes ?? '',
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const store = getStore(locals);
  const saved = await store.put(id, {
    acquiredDate: typeof body.acquiredDate === 'string' ? body.acquiredDate : '',
    acquiredFrom: typeof body.acquiredFrom === 'string' ? body.acquiredFrom : '',
    status: typeof body.status === 'string' ? body.status : '',
    notes: typeof body.notes === 'string' ? body.notes : '',
  });

  return new Response(JSON.stringify(saved), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

