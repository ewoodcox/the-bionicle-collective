globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as isAuthConfigured, i as isAuthenticated } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
export { renderers } from '../../../renderers.mjs';

const memoryStore = [];
function parseIds$1(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => typeof x === "string" && x.trim() !== "");
}
async function readStore() {
  try {
    const fsPromises = await new Function('return import("fs/promises")')();
    const STORE_URL = new URL("../data/media-store.json", import.meta.url);
    const raw = await fsPromises.readFile(STORE_URL, "utf8");
    return parseIds$1(JSON.parse(raw));
  } catch {
    return [...memoryStore];
  }
}
async function writeStore(ids) {
  memoryStore.length = 0;
  memoryStore.push(...ids);
  try {
    const fsPromises = await new Function('return import("fs/promises")')();
    const STORE_URL = new URL("../data/media-store.json", import.meta.url);
    await fsPromises.writeFile(STORE_URL, JSON.stringify(ids, null, 2), "utf8");
  } catch {
  }
}
async function getMediaOwnedIds$1() {
  return readStore();
}
async function setMediaOwnedIds$1(ids) {
  const deduped = [...new Set(ids)].filter((x) => typeof x === "string" && x.trim() !== "");
  await writeStore(deduped);
  return deduped;
}

const R2_KEY = "media-collection.json";
function parseIds(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string" && x.trim() !== "");
  } catch {
  }
  return [];
}
async function getMediaOwnedIds(bucket) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  return parseIds(raw);
}
async function setMediaOwnedIds(bucket, ids) {
  const deduped = [...new Set(ids)].filter((x) => typeof x === "string" && x.trim() !== "");
  await bucket.put(R2_KEY, JSON.stringify(deduped), {
    httpMetadata: { contentType: "application/json" }
  });
  return deduped;
}

const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: () => getMediaOwnedIds(bucket),
      set: (ids) => setMediaOwnedIds(bucket, ids)
    };
  }
  return {
    get: () => getMediaOwnedIds$1(),
    set: (ids) => setMediaOwnedIds$1(ids)
  };
}
const GET = async ({ locals }) => {
  const store = getStore(locals);
  try {
    const ownedIds = await store.get();
    return new Response(JSON.stringify({ ownedIds }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to load media ownership",
        details: err instanceof Error ? err.message : String(err)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const PUT = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Unauthorized. Log in at the edit site home page." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }
  const store = getStore(locals);
  let ownedIds;
  if (Array.isArray(body.ownedIds)) {
    ownedIds = body.ownedIds.filter((id) => typeof id === "string" && id.trim() !== "");
  } else {
    const mediaId = typeof body.mediaId === "string" ? body.mediaId.trim() : "";
    const owned = body.owned === true;
    if (!mediaId) {
      return new Response(JSON.stringify({ error: "Missing mediaId" }), { status: 400 });
    }
    ownedIds = await store.get();
    if (owned) {
      if (!ownedIds.includes(mediaId)) ownedIds = [...ownedIds, mediaId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== mediaId);
    }
  }
  try {
    await store.set(ownedIds);
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Failed to save. Check that R2 bucket is bound and accessible.",
        details: err instanceof Error ? err.message : String(err)
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(JSON.stringify({ ownedIds }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PUT,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
