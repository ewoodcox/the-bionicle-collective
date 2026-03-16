globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as addReply, b as addReply$1 } from '../../../../chunks/suggestionsStore_C3-96La5.mjs';
import { a as checkRateLimitReplies } from '../../../../chunks/rateLimitR2_B0zxt9YQ.mjs';
import { i as isAuthenticated } from '../../../../chunks/adminAuth_CE1MGqB7.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      addReply: (id, data) => addReply(bucket, id, data)
    };
  }
  return {
    addReply: (id, data) => addReply$1(id, data)
  };
}
const POST = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing suggestion id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  const rateOk = await checkRateLimitReplies(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: "Too many replies. Please try again in an hour." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const text = String(body?.text ?? "").trim();
  if (!text || text.length < 1) {
    return new Response(JSON.stringify({ error: "Reply text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const envForAuth = locals.runtime?.env;
  const isAdmin = await isAuthenticated(request, envForAuth);
  const authorName = isAdmin ? "Admin" : body?.authorName != null ? String(body.authorName).trim() : void 0;
  const store = getStore(locals);
  const suggestion = await store.addReply(id, { text, authorName });
  if (!suggestion) {
    return new Response(JSON.stringify({ error: "Suggestion not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify(suggestion), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
