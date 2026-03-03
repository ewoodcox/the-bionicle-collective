globalThis.process ??= {}; globalThis.process.env ??= {};
import { a as isAuthConfigured, i as isAuthenticated } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
export { renderers } from '../../../renderers.mjs';

const memoryStore = [];
function parseIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => typeof x === "string");
}
async function readStore() {
  try {
    const { readFile } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const { dirname, join } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const STORE_PATH = join(__dirname, "..", "data", "kanohi-store.json");
    if (!existsSync(STORE_PATH)) return [...memoryStore];
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return parseIds(parsed);
  } catch {
    return [...memoryStore];
  }
}
async function writeStore(ids) {
  memoryStore.length = 0;
  memoryStore.push(...ids);
  try {
    const { writeFile } = await import('fs/promises');
    const { dirname, join } = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const STORE_PATH = join(__dirname, "..", "data", "kanohi-store.json");
    await writeFile(STORE_PATH, JSON.stringify(ids, null, 2), "utf8");
  } catch {
  }
}
async function getKanohiOwnedIds$1() {
  return readStore();
}
async function setKanohiOwnedIds$1(ids) {
  const deduped = [...new Set(ids)].filter(Boolean);
  await writeStore(deduped);
  return deduped;
}

const R2_KEY = "kanohi-collection.json";
function parseStore(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string");
  } catch {
  }
  return [];
}
async function getKanohiOwnedIds(bucket) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  return parseStore(raw);
}
async function setKanohiOwnedIds(bucket, ids) {
  const deduped = [...new Set(ids)].filter(Boolean);
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
      get: () => getKanohiOwnedIds(bucket),
      set: (ids) => setKanohiOwnedIds(bucket, ids)
    };
  }
  return {
    get: () => getKanohiOwnedIds$1(),
    set: async (ids) => {
      await setKanohiOwnedIds$1(ids);
      return ids;
    }
  };
}
const GET = async ({ locals }) => {
  const store = getStore(locals);
  const ownedIds = await store.get();
  return new Response(JSON.stringify({ ownedIds }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  if (isAuthConfigured(env)) {
    const ok = await isAuthenticated(request, env);
    if (!ok) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Log in at the edit site home page." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
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
    ownedIds = body.ownedIds.filter((id) => typeof id === "string").filter(Boolean);
  } else {
    const maskId = typeof body.maskId === "string" ? body.maskId.trim() : "";
    const owned = body.owned === true;
    if (!maskId) {
      return new Response(JSON.stringify({ error: "Missing maskId" }), { status: 400 });
    }
    ownedIds = await store.get();
    if (owned) {
      if (!ownedIds.includes(maskId)) ownedIds = [...ownedIds, maskId];
    } else {
      ownedIds = ownedIds.filter((id) => id !== maskId);
    }
  }
  try {
    await store.set(ownedIds);
  } catch (err) {
    console.error("Kanohi store set failed:", err);
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
