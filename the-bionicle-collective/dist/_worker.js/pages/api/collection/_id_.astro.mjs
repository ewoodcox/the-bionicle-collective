globalThis.process ??= {}; globalThis.process.env ??= {};
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { a as isAuthConfigured, i as isAuthenticated } from '../../../chunks/adminAuth_CE1MGqB7.mjs';
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

const R2_KEY = "collection-store.json";
const LEGACY_KEY = "collection.json";
function parseStore(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function getStoreRaw(bucket) {
  let object = await bucket.get(R2_KEY);
  let raw = object ? await object.text() : null;
  if (!raw) {
    object = await bucket.get(LEGACY_KEY);
    raw = object ? await object.text() : null;
    if (raw) {
      await bucket.put(R2_KEY, raw, { httpMetadata: { contentType: "application/json" } });
    }
  }
  return raw;
}
async function getCollectionEntry(bucket, setId) {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  return store[setId] ?? null;
}
async function upsertCollectionEntry(bucket, setId, data) {
  const raw = await getStoreRaw(bucket);
  const store = parseStore(raw);
  const existing = store[setId] ?? {};
  const merged = {
    acquiredDate: data.acquiredDate ?? existing.acquiredDate ?? "",
    acquiredFrom: data.acquiredFrom ?? existing.acquiredFrom ?? "",
    status: data.status ?? existing.status ?? "",
    notes: data.notes ?? existing.notes ?? ""
  };
  store[setId] = merged;
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" }
  });
  return merged;
}

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://bioniclecollective.com", "SSR": true};
const prerender = false;
function getStore(locals) {
  const env = locals.runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      get: (id) => getCollectionEntry(bucket, id),
      put: (id, data) => upsertCollectionEntry(bucket, id, data)
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
  const bucket = env?.BIONICLE_COLLECTION;
  const isProduction = !Object.assign(__vite_import_meta_env__, {})?.DEV;
  if (isProduction && !bucket) {
    return new Response(
      JSON.stringify({
        error: "Collection storage (R2) is not configured. In Cloudflare Pages → your project → Settings → Functions, add an R2 bucket binding with variable name BIONICLE_COLLECTION linked to your R2 bucket."
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
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
  let saved;
  try {
    saved = await store.put(id, {
      acquiredDate: typeof body.acquiredDate === "string" ? body.acquiredDate : "",
      acquiredFrom: typeof body.acquiredFrom === "string" ? body.acquiredFrom : "",
      status: typeof body.status === "string" ? body.status : "",
      notes: typeof body.notes === "string" ? body.notes : ""
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Failed to save collection entry", details: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
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
