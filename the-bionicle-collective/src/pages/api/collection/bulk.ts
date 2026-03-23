import { bulkPatchCollectionEntries } from '../../../utils/collectionStoreR2';
import { isAuthConfigured, isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: any; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

export const POST = async ({ request, locals }: any) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;

  if (!bucket) {
    return new Response(JSON.stringify({ error: 'Collection storage (R2) is not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
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

  const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((id: any) => typeof id === 'string') : [];
  if (ids.length === 0) {
    return new Response(JSON.stringify({ error: 'No ids provided' }), { status: 400 });
  }

  const fields: Record<string, string> = {};
  if (typeof body?.acquiredDate === 'string') fields.acquiredDate = body.acquiredDate;
  if (typeof body?.acquiredFrom === 'string') fields.acquiredFrom = body.acquiredFrom;
  if (typeof body?.status === 'string') fields.status = body.status;

  if (Object.keys(fields).length === 0) {
    return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
  }

  try {
    await bulkPatchCollectionEntries(bucket, ids, fields);
    return new Response(JSON.stringify({ ok: true, updated: ids.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Failed to save', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
