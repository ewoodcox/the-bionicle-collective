import type { APIRoute } from 'astro';
import { getSessionInfo } from '../../../../utils/adminAuth';
import { deleteUser, changePassword, setRole, countSuperAdmins, listUsers } from '../../../../utils/adminUsersR2';
import type { UserRole } from '../../../../utils/adminUsersR2';

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
  const session = await getSessionInfo(request, env);
  if (!session) return json({ error: 'Unauthorized' }, 401);
  if (session.role !== 'superadmin') return json({ error: 'Forbidden' }, 403);

  const target = params.username;
  if (!target) return json({ error: 'Missing username' }, 400);
  if (session.username === target) return json({ error: 'Cannot delete your own account' }, 400);

  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);

  // Superadmins are protected — cannot be deleted
  const users = await listUsers(bucket);
  const targetUser = users.find((u) => u.username === target);
  if (!targetUser) return json({ error: 'User not found' }, 404);
  if (targetUser.role === 'superadmin') {
    return json({ error: 'Superadmin accounts cannot be deleted' }, 403);
  }

  await deleteUser(bucket, target);
  return json({ ok: true });
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const session = await getSessionInfo(request, env);
  if (!session) return json({ error: 'Unauthorized' }, 401);

  const target = params.username;
  if (!target) return json({ error: 'Missing username' }, 400);

  // Admins can only change their own password; superadmins can change any non-superadmin's
  const isSelf = session.username === target;
  if (!isSelf && session.role !== 'superadmin') return json({ error: 'Forbidden' }, 403);

  const bucket = env?.BIONICLE_COLLECTION;
  if (!bucket) return json({ error: 'Storage not configured' }, 503);

  let body: { password?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }

  // Role change — superadmin only
  if (body.role !== undefined) {
    if (session.role !== 'superadmin') return json({ error: 'Forbidden' }, 403);
    const newRole = body.role as UserRole;
    if (newRole !== 'superadmin' && newRole !== 'admin') {
      return json({ error: 'Invalid role' }, 400);
    }
    // Prevent demoting the last superadmin
    if (newRole === 'admin') {
      const count = await countSuperAdmins(bucket);
      if (count <= 1) return json({ error: 'Cannot demote the last superadmin' }, 400);
    }
    const changed = await setRole(bucket, target, newRole);
    if (!changed) return json({ error: 'User not found' }, 404);
    return json({ ok: true, role: newRole });
  }

  // Password change
  if (body.password !== undefined) {
    // Superadmins cannot change another superadmin's password (including their own via this endpoint — use profile page)
    if (!isSelf && session.role === 'superadmin') {
      const users = await listUsers(bucket);
      const targetUser = users.find((u) => u.username === target);
      if (targetUser?.role === 'superadmin') {
        return json({ error: 'Cannot change another superadmin\'s password' }, 403);
      }
    }
    const password = (body.password ?? '').trim();
    if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
    const changed = await changePassword(bucket, target, password);
    if (!changed) return json({ error: 'User not found' }, 404);
    return json({ ok: true });
  }

  return json({ error: 'No changes provided' }, 400);
};
