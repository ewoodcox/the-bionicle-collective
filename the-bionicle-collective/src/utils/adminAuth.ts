/**
 * Admin auth: session tokens stored in Cloudflare KV (SESSION binding).
 * Login validates credentials via adminUsersR2 or the legacy ADMIN_SECRET bypass.
 * Each session token is a 48-char hex string stored under `session:{token}` in KV.
 * The user's role is embedded in the session so every request knows it without an R2 read.
 */

import type { UserRole } from './adminUsersR2';

export type { UserRole };

export interface SessionInfo {
  username: string;
  role: UserRole;
}

const COOKIE_NAME = 'admin_auth';
const SESSION_PREFIX = 'session:';
const MAX_AGE_SEC = 2 * 60 * 60; // 2 hours

type Env = Record<string, unknown> | undefined;

function getKV(env: Env): KVNamespace | undefined {
  return env?.SESSION as KVNamespace | undefined;
}

function getSessionToken(request: Request): string | null {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([A-Za-z0-9]+)`));
  return match?.[1] ?? null;
}

/** Generate a session token, store it in KV with the user's role, and return the Set-Cookie header. */
export async function createSession(
  env: Env,
  username: string,
  role: UserRole
): Promise<string | null> {
  const kv = getKV(env);
  if (!kv) return null;
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  await kv.put(SESSION_PREFIX + token, JSON.stringify({ username, role, expiresAt }), {
    expirationTtl: MAX_AGE_SEC,
  });
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${MAX_AGE_SEC}; HttpOnly; SameSite=Lax`;
}

/** Verify session cookie against KV; returns true if valid and not expired. */
export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  return (await getSessionInfo(request, env)) !== null;
}

/**
 * Get full session info (username + role) from the cookie, or null if invalid/expired.
 * Use this instead of separate username/role lookups.
 */
export async function getSessionInfo(request: Request, env: Env): Promise<SessionInfo | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const kv = getKV(env);
  if (!kv) return null;
  const raw = await kv.get(SESSION_PREFIX + token);
  if (!raw) return null;
  try {
    const { username, role, expiresAt } = JSON.parse(raw) as {
      username: string;
      role: UserRole;
      expiresAt: number;
    };
    if (expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return { username, role: role ?? 'admin' }; // default for sessions created before roles
  } catch {
    return null;
  }
}

/**
 * @deprecated Use getSessionInfo instead — returns both username and role in one call.
 * Kept for compatibility with existing callers.
 */
export async function getSessionUser(request: Request, env: Env): Promise<string | null> {
  return (await getSessionInfo(request, env))?.username ?? null;
}

/** Delete the session from KV (used on logout). */
export async function deleteSession(request: Request, env: Env): Promise<void> {
  const token = getSessionToken(request);
  if (!token) return;
  const kv = getKV(env);
  if (!kv) return;
  await kv.delete(SESSION_PREFIX + token);
}

/** Returns true if auth is configured (KV available or legacy secret set). */
export function isAuthConfigured(env: Env): boolean {
  return !!(getKV(env) || (env?.ADMIN_SECRET as string) || (env?.COLLECTION_EDIT_SECRET as string));
}

/** Returns the legacy ADMIN_SECRET bypass key, if set. */
export function getLegacySecret(env: Env): string | undefined {
  return (env?.ADMIN_SECRET as string) ?? (env?.COLLECTION_EDIT_SECRET as string);
}

export { COOKIE_NAME };
