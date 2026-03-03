/**
 * Admin auth: one-time secret key grants a signed cookie for 2 hours.
 * Used on edit.bioniclecollective.com so the key is entered on the home page only.
 */

const COOKIE_NAME = 'admin_auth';
const MAX_AGE_SEC = 2 * 60 * 60; // 2 hours

function getSecret(env: Record<string, unknown> | undefined): string | undefined {
  return (env?.ADMIN_SECRET as string) ?? (env?.COLLECTION_EDIT_SECRET as string);
}

/** Build cookie value: base64(expiry) + '.' + hex(signature). Signature = HMAC-SHA256(expiry, secret). */
export async function buildAuthCookie(env: Record<string, unknown> | undefined): Promise<string | null> {
  const secret = getSecret(env);
  if (!secret) return null;
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = String(expiry);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const payloadB64 = btoa(payload);
  return `${COOKIE_NAME}=${payloadB64}.${sigHex}; Path=/; Max-Age=${MAX_AGE_SEC}; HttpOnly; SameSite=Lax`;
}

/** Verify cookie from request; returns true if valid. */
export async function isAuthenticated(
  request: Request,
  env: Record<string, unknown> | undefined
): Promise<boolean> {
  const secret = getSecret(env);
  if (!secret) return false;
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  if (!value) return false;
  const [payloadB64, sigHex] = value.split('.');
  if (!payloadB64 || !sigHex) return false;
  let payload: string;
  try {
    payload = atob(payloadB64);
  } catch {
    return false;
  }
  const expiry = parseInt(payload, 10);
  if (Number.isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return sigHex === expectedHex;
}

export function isAuthConfigured(env: Record<string, unknown> | undefined): boolean {
  return !!getSecret(env);
}

export { COOKIE_NAME };
