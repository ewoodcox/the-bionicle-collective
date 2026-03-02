globalThis.process ??= {}; globalThis.process.env ??= {};
async function sha256Hex(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const COOKIE_NAME = "admin_auth";
const SALT = "bionicle-collective-admin";
function getAdminSecret() {
  return typeof process !== "undefined" ? process.env.ADMIN_SECRET : void 0;
}
function isAuthConfigured() {
  const secret = getAdminSecret();
  return !!secret && secret.length > 0;
}
async function computeAuthToken() {
  const secret = getAdminSecret();
  if (!secret) throw new Error("ADMIN_SECRET not configured");
  return sha256Hex(secret + SALT);
}
async function isAuthenticated(request) {
  if (!isAuthConfigured()) return false;
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return false;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const cookieValue = match?.[1]?.trim();
  if (!cookieValue) return false;
  const expected = await computeAuthToken();
  return cookieValue === expected;
}
async function buildAuthCookieHeader() {
  const token = await computeAuthToken();
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000`;
}

export { isAuthenticated as a, buildAuthCookieHeader as b, isAuthConfigured as i };
