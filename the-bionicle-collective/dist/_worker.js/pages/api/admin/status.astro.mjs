globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as isAuthConfigured } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ locals }) => {
  const env = locals.runtime?.env;
  const configured = isAuthConfigured(env);
  return new Response(
    JSON.stringify({
      authConfigured: configured,
      hint: configured ? "Login should work. If it still fails, the key you enter may not match ADMIN_SECRET." : "Set ADMIN_SECRET in Cloudflare Pages: Project → Settings → Environment variables (Production), then redeploy."
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
