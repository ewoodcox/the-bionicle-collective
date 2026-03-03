globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as isAuthConfigured, b as buildAuthCookie } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const POST = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env;
    if (!isAuthConfigured(env)) {
      return jsonResponse(
        { error: "Admin login not configured. Set ADMIN_SECRET in Cloudflare Pages → Settings → Environment variables (Production), then redeploy. Check /api/admin/status to verify." },
        503
      );
    }
    const secret = env?.ADMIN_SECRET ?? env?.COLLECTION_EDIT_SECRET;
    let body;
    try {
      body = await request.json();
    } catch {
      const contentType = request.headers.get("Content-Type") ?? "";
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        body = { key: params.get("key") ?? void 0 };
      } else {
        return jsonResponse({ error: "Invalid body" }, 400);
      }
    }
    const key = (body.key ?? "").trim();
    if (key !== secret) {
      return jsonResponse({ error: "Invalid key" }, 401);
    }
    const cookieHeader = await buildAuthCookie(env);
    if (!cookieHeader) {
      return jsonResponse({ error: "Could not set session" }, 500);
    }
    const url = new URL(request.url);
    const next = url.searchParams.get("next") || "/collection/";
    const redirectUrl = next.startsWith("/") ? new URL(next, url.origin).toString() : `${url.origin}/collection/`;
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        "Set-Cookie": cookieHeader
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: `Login failed: ${message}` }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
