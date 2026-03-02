globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as isAuthConfigured, b as buildAuthCookieHeader } from '../../../chunks/adminAuth_DFo97i-D.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  if (!isAuthConfigured()) {
    return new Response(
      JSON.stringify({ error: "Admin auth not configured. Set ADMIN_SECRET in env." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const secret = typeof body.secret === "string" ? body.secret.trim() : "";
  const expected = process.env.ADMIN_SECRET;
  if (secret !== expected) {
    return new Response(JSON.stringify({ error: "Invalid secret" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const cookieHeader = await buildAuthCookieHeader();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieHeader
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
