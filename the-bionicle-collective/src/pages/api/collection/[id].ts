import type { APIRoute } from 'astro';
import { getCollectionEntry, upsertCollectionEntry } from '../../../utils/collectionStore';
import * as storeKV from '../../../utils/collectionStoreKV';

// Dynamic API route: don't prerender at build, run only on request.
export const prerender = false;

type Env = { COLLECTION_STORE?: KVNamespace; COLLECTION_EDIT_SECRET?: string };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const kv = env?.COLLECTION_STORE;
  if (kv) {
    return {
      get: (id: string) => storeKV.getCollectionEntry(kv, id),
      put: (id: string, data: storeKV.CollectionEntry) =>
        storeKV.upsertCollectionEntry(kv, id, data),
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
  const secret = env?.COLLECTION_EDIT_SECRET;
  if (secret) {
    const provided = request.headers.get('X-Edit-Key');
    if (provided !== secret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
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

