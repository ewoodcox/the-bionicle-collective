globalThis.process ??= {}; globalThis.process.env ??= {};
const COOKIE_NAME = "admin_auth";
const MAX_AGE_SEC = 2 * 60 * 60;
function getSecret(env) {
  return env?.ADMIN_SECRET ?? env?.COLLECTION_EDIT_SECRET;
}
async function buildAuthCookie(env) {
  const secret = getSecret(env);
  if (!secret) return null;
  const expiry = Math.floor(Date.now() / 1e3) + MAX_AGE_SEC;
  const payload = String(expiry);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const payloadB64 = btoa(payload);
  return `${COOKIE_NAME}=${payloadB64}.${sigHex}; Path=/; Max-Age=${MAX_AGE_SEC}; HttpOnly; SameSite=Lax`;
}
async function isAuthenticated(request, env) {
  const secret = getSecret(env);
  if (!secret) return false;
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1];
  if (!value) return false;
  const [payloadB64, sigHex] = value.split(".");
  if (!payloadB64 || !sigHex) return false;
  let payload;
  try {
    payload = atob(payloadB64);
  } catch {
    return false;
  }
  const expiry = parseInt(payload, 10);
  if (Number.isNaN(expiry) || expiry < Math.floor(Date.now() / 1e3)) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expectedHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return sigHex === expectedHex;
}
function isAuthConfigured(env) {
  return !!getSecret(env);
}

export { COOKIE_NAME as C, isAuthConfigured as a, buildAuthCookie as b, isAuthenticated as i };
