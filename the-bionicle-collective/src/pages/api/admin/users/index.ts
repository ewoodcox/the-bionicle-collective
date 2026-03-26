import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../../utils/adminAuth';
import { listUsers, createUser } from '../../../../utils/adminUsersR2';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);
  const users = await listUsers(bucket);
  return json({ users });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!(await isAuthenticated(request, env))) return json({ error: 'Unauthorized' }, 401);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const username = (body.username ?? '').trim();
  const password = (body.password ?? '').trim();
  if (!username || !password) return json({ error: 'username and password required' }, 400);
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
    return json({ error: 'Invalid username — letters, numbers, _ and - only, max 32 chars' }, 400);
  }
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  try {
    await createUser(bucket, username, password);
    return json({ ok: true, username });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Failed' }, 409);
  }
};
