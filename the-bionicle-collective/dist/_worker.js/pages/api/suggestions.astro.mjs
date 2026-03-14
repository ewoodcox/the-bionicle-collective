globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as addSuggestion, d as getSuggestions, e as addSuggestion$1, l as listSuggestions } from '../../chunks/suggestionsStore_DK1cpA_m.mjs';
import { a as checkRateLimitSuggestions } from '../../chunks/rateLimitR2_BHQfaWfr.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      list: () => getSuggestions(bucket),
      add: (data) => addSuggestion(bucket, data)
    };
  }
  return {
    list: () => listSuggestions(),
    add: (data) => addSuggestion$1(data)
  };
}
const GET = async ({ locals }) => {
  const store = getStore(locals);
  const suggestions = await store.list();
  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30"
    }
  });
};
const POST = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  const rateOk = await checkRateLimitSuggestions(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: "Too many suggestions. Please try again tomorrow." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const submitterName = body?.submitterName != null ? String(body.submitterName).trim() : void 0;
  if (!title || title.length < 3) {
    return new Response(
      JSON.stringify({ error: "Title must be at least 3 characters" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const store = getStore(locals);
  const suggestion = await store.add({ title, description, submitterName });
  return new Response(JSON.stringify(suggestion), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
