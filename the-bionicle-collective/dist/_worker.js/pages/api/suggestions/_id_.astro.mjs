globalThis.process ??= {}; globalThis.process.env ??= {};
import { i as isAuthenticated } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
import { d as deleteSuggestion, c as addAdminReply, u as unhideSuggestion, h as hideSuggestion, e as deleteSuggestion$1, f as addAdminReply$1, i as unhideSuggestion$1, j as hideSuggestion$1 } from '../../../chunks/suggestionsStore_kPF1oB8s.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      hide: (id) => hideSuggestion(bucket, id),
      unhide: (id) => unhideSuggestion(bucket, id),
      addReply: (id, text) => addAdminReply(bucket, id, text),
      delete: (id) => deleteSuggestion(bucket, id)
    };
  }
  return {
    hide: (id) => hideSuggestion$1(id),
    unhide: (id) => unhideSuggestion$1(id),
    addReply: (id, text) => addAdminReply$1(id, text),
    delete: (id) => deleteSuggestion$1(id)
  };
}
const PATCH = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing suggestion id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const env = locals.runtime?.env;
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
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
  const action = body?.action;
  const store = getStore(locals);
  if (action === "hide") {
    const s = await store.hide(id);
    if (!s) {
      return new Response(JSON.stringify({ error: "Suggestion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (action === "unhide") {
    const s = await store.unhide(id);
    if (!s) {
      return new Response(JSON.stringify({ error: "Suggestion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (action === "reply") {
    const replyText = String(body?.replyText ?? "").trim();
    if (!replyText) {
      return new Response(JSON.stringify({ error: "replyText is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const s = await store.addReply(id, replyText);
    if (!s) {
      return new Response(JSON.stringify({ error: "Suggestion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(
    JSON.stringify({ error: 'action must be "hide", "unhide", or "reply"' }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
};
const DELETE = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing suggestion id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const env = locals.runtime?.env;
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const store = getStore(locals);
  const deleted = await store.delete(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: "Suggestion not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
