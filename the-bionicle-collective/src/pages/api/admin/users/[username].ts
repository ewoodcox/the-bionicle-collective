import type { APIRoute } from 'astro';
import { isAuthenticated, getSessionUser } from '../../../../utils/adminAuth';
import { deleteUser, changePassword } from '../../../../utils/adminUsersR2';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const DELETE: APIRoute = async ({ request, params, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);
  const target = params.username;
  if (!target) return json({ error: 'Missing username' }, 400);
  // Prevent deleting your own account
  const self = await getSessionUser(request, env);
  if (self === target) return json({ error: 'Cannot delete your own account' }, 400);
  const deleted = await deleteUser(bucket, target);
  if (!deleted) return json({ error: 'User not found' }, 404);
  return json({ ok: true });
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);
  const target = params.username;
  if (!target) return json({ error: 'Missing username' }, 400);
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }
  const password = (body.password ?? '').trim();
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
  const changed = await changePassword(bucket, target, password);
  if (!changed) return json({ error: 'User not found' }, 404);
  return json({ ok: true });
};
