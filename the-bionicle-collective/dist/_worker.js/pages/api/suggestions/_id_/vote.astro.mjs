globalThis.process ??= {}; globalThis.process.env ??= {};
import { r as recordVote, g as getPreviousVote, a as applyVote, b as applyVote$1 } from '../../../../chunks/suggestionsStore_kPF1oB8s.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const VOTE_COOKIE = "suggestion_votes";
function getVisitorId(request) {
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "";
  const ua = request.headers.get("User-Agent") ?? "";
  const input = `${ip}|${ua}`;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h = (h << 5) - h + c;
    h = h & h;
  }
  return `v${Math.abs(h).toString(36)}`;
}
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      applyVote: (id, direction, previousDirection) => applyVote(bucket, id, direction, previousDirection),
      getPreviousVote: (visitorId, suggestionId) => getPreviousVote(bucket, visitorId, suggestionId),
      recordVote: (visitorId, suggestionId, direction) => recordVote(bucket, visitorId, suggestionId, direction),
      useR2: true
    };
  }
  return {
    applyVote: (id, direction, previousDirection) => applyVote$1(id, direction, previousDirection),
    getPreviousVote: async () => null,
    recordVote: async () => {
    },
    useR2: false
  };
}
function parseVoteCookie(cookieHeader) {
  if (!cookieHeader) return {};
  const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${VOTE_COOKIE}=([^;]*)`));
  if (!match) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
const POST = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing suggestion id" }), {
      status: 400,
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
  const dir = body?.direction;
  if (dir !== "up" && dir !== "down") {
    return new Response(
      JSON.stringify({ error: 'direction must be "up" or "down"' }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const store = getStore(locals);
  let previousDirection;
  if (store.useR2) {
    const visitorId = getVisitorId(request);
    previousDirection = await store.getPreviousVote(visitorId, id);
    const updated2 = await store.applyVote(id, dir, previousDirection);
    if (!updated2) {
      return new Response(JSON.stringify({ error: "Suggestion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await store.recordVote(visitorId, id, dir);
    return new Response(JSON.stringify({ ...updated2, currentVote: dir }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const votes = parseVoteCookie(request.headers.get("Cookie"));
  previousDirection = votes[id] || null;
  const updated = await store.applyVote(id, dir, previousDirection);
  if (!updated) {
    return new Response(JSON.stringify({ error: "Suggestion not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  const newVotes = { ...votes, [id]: dir };
  const cookieValue = encodeURIComponent(JSON.stringify(newVotes));
  return new Response(JSON.stringify({ ...updated, currentVote: dir }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${VOTE_COOKIE}=${cookieValue}; Path=/; Max-Age=31536000; SameSite=Lax`
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
