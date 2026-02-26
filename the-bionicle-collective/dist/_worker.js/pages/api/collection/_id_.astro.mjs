globalThis.process ??= {}; globalThis.process.env ??= {};
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
export { renderers } from '../../../renderers.mjs';

const __dirname$1 = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = join(__dirname$1, "..", "data", "collection-store.json");
async function readStore() {
  if (!existsSync(STORE_PATH)) return {};
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function writeStore(store) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
async function getCollectionEntry$1(setId) {
  const store = await readStore();
  return store[setId] ?? null;
}
async function upsertCollectionEntry$1(setId, data) {
  const store = await readStore();
  const existing = store[setId] ?? {};
  const merged = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? "",
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? "",
    status: data.status ?? existing.status ?? "",
    notes: data.notes ?? existing.notes ?? ""
  };
  store[setId] = merged;
  await writeStore(store);
  return merged;
}

const KV_KEY = "collection-store";
function parseStore(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function getCollectionEntry(kv, setId) {
  const raw = await kv.get(KV_KEY);
  const store = parseStore(raw);
  return store[setId] ?? null;
}
async function upsertCollectionEntry(kv, setId, data) {
  const raw = await kv.get(KV_KEY);
  const store = parseStore(raw);
  const existing = store[setId] ?? {};
  const merged = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? "",
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? "",
    status: data.status ?? existing.status ?? "",
    notes: data.notes ?? existing.notes ?? ""
  };
  store[setId] = merged;
  await kv.put(KV_KEY, JSON.stringify(store));
  return merged;
}

const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const kv = env?.COLLECTION_STORE;
  if (kv) {
    return {
      get: (id) => getCollectionEntry(kv, id),
      put: (id, data) => upsertCollectionEntry(kv, id, data)
    };
  }
  return {
    get: (id) => getCollectionEntry$1(id),
    put: (id, data) => upsertCollectionEntry$1(id, data)
  };
}
const GET = async ({ params, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  }
  const store = getStore(locals);
  const entry = await store.get(id);
  const payload = {
    acquiredDate: entry?.acquiredDate ?? "",
    acquiredFrom: entry?.acquiredFrom ?? "",
    status: entry?.status ?? "",
    notes: entry?.notes ?? ""
  };
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  }
  const env = locals.runtime?.env;
  const secret = env?.COLLECTION_EDIT_SECRET;
  if (secret) {
    const provided = request.headers.get("X-Edit-Key");
    if (provided !== secret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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
  const saved = await store.put(id, {
    acquiredDate: typeof body.acquiredDate === "string" ? body.acquiredDate : "",
    acquiredFrom: typeof body.acquiredFrom === "string" ? body.acquiredFrom : "",
    status: typeof body.status === "string" ? body.status : "",
    notes: typeof body.notes === "string" ? body.notes : ""
  });
  return new Response(JSON.stringify(saved), {
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
