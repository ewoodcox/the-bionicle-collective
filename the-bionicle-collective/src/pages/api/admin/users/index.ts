import type { APIRoute } from 'astro';
import { getSessionInfo } from '../../../../utils/adminAuth';
import { listUsers, createUser } from '../../../../utils/adminUsersR2';
import type { UserRole } from '../../../../utils/adminUsersR2';

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
  const session = await getSessionInfo(request, env);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  if (session.role !== 'superadmin') return json({ error: 'Forbidden' }, 403);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);
  const users = await listUsers(bucket);
  return json({ users });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const session = await getSessionInfo(request, env);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  if (session.role !== 'superadmin') return json({ error: 'Forbidden' }, 403);
  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);

  let body: { username?: string; password?: string; role?: string; googleEmail?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  const username = (body.username ?? '').trim();
  const password = (body.password ?? '').trim();
  const role: UserRole = body.role === 'superadmin' ? 'superadmin' : 'admin';
  const googleEmail = body.googleEmail?.trim().toLowerCase() || undefined;

  if (!username || !password) return json({ error: 'username and password required' }, 400);
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
    return json({ error: 'Invalid username — letters, numbers, _ and - only, max 32 chars' }, 400);
  }
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
  if (googleEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(googleEmail)) {
    return json({ error: 'Invalid Google email address' }, 400);
  }

  try {
    await createUser(bucket, username, password, role, googleEmail);
    return json({ ok: true, username, role, ...(googleEmail ? { googleEmail } : {}) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Failed' }, 409);
  }
};
