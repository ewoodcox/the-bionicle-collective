import * as storeR2 from '../../../utils/collectionStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

// Dynamic API route: don't prerender at build, run only on request.
export const prerender = false;

type Env = { BIONICLE_COLLECTION?: any; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

async function getStore(locals: any) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: (id: string) => storeR2.getCollectionEntry(bucket, id),
      put: (id: string, data: storeR2.CollectionEntry) =>
        storeR2.upsertCollectionEntry(bucket, id, data),
    };
  }
  // IMPORTANT:
  // Cloudflare Workers cannot use Node's `fs`, so we only allow the file-backed store in dev.
  // Removing the static import prevents Worker startup crashes that lead to empty 500 responses.
  if ((import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
    const storeFs = await import('../../../utils/collectionStore');
    return {
      get: (id: string) => storeFs.getCollectionEntry(id),
      put: (id: string, data: { acquiredDate?: string; acquiredFrom?: string; status?: string; notes?: string }) =>
        storeFs.upsertCollectionEntry(id, data),
    };
  }
  return null;
}

export const GET = async ({ params, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  const store = await getStore(locals);
  if (!store) {
    return new Response(
      JSON.stringify({
        error:
          'Collection storage (R2) is not configured. In Cloudflare Pages → your project → Settings → Functions, add an R2 bucket binding with variable name `BIONICLE_COLLECTION` linked to your R2 bucket.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Failed to load collection entry', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  const store = await getStore(locals);
  if (!store) {
    return new Response(
      JSON.stringify({
        error:
          'Collection storage (R2) is not configured. In Cloudflare Pages → your project → Settings → Functions, add an R2 bucket binding with variable name `BIONICLE_COLLECTION` linked to your R2 bucket.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
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

  let saved: { acquiredDate?: string; acquiredFrom?: string; status?: string; notes?: string };
  try {
    saved = await store.put(id, {
      acquiredDate: typeof body.acquiredDate === 'string' ? body.acquiredDate : '',
      acquiredFrom: typeof body.acquiredFrom === 'string' ? body.acquiredFrom : '',
      status: typeof body.status === 'string' ? body.status : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: 'Failed to save collection entry', details: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify(saved), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
