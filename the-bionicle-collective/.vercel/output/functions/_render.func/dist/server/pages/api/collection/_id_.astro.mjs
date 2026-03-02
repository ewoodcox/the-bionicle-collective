import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
export { renderers } from '../../../renderers.mjs';

function getEnv(name) {
  return typeof process !== "undefined" ? process.env[name] : void 0;
}
function getR2ObjectKey() {
  return getEnv("R2_COLLECTION_STORE_KEY") ?? "collection.json";
}
function getR2Client() {
  const accountId = getEnv("R2_ACCOUNT_ID");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY");
  const endpoint = getEnv("R2_ENDPOINT");
  if (!accountId || !accessKeyId || !secretAccessKey || !endpoint) return null;
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}
async function readFromR2() {
  const client = getR2Client();
  const bucket = getEnv("R2_BUCKET_NAME");
  if (!client || !bucket) return null;
  try {
    const res = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: getR2ObjectKey()
      })
    );
    const body = res.Body;
    if (!body) return {};
    const raw = await body.transformToString();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (err) {
    if (err && typeof err === "object" && "name" in err && err.name === "NoSuchKey") {
      return {};
    }
    throw err;
  }
  return {};
}
async function writeToR2(store) {
  const client = getR2Client();
  const bucket = getEnv("R2_BUCKET_NAME");
  if (!client || !bucket) {
    throw new Error("R2 credentials not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, R2_BUCKET_NAME in .env (see .env.example).");
  }
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: getR2ObjectKey(),
      Body: JSON.stringify(store, null, 2),
      ContentType: "application/json"
    })
  );
}
async function readFromFile() {
  const { readFile } = await import('fs/promises');
  const { existsSync } = await import('fs');
  const { dirname, join } = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const STORE_PATH = join(__dirname, "..", "data", "collection-store.json");
  if (!existsSync(STORE_PATH)) return {};
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function writeToFile(store) {
  const { writeFile } = await import('fs/promises');
  const { dirname, join } = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const STORE_PATH = join(__dirname, "..", "data", "collection-store.json");
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}
async function readStore() {
  const fromR2 = await readFromR2();
  if (fromR2 !== null) return fromR2;
  return readFromFile();
}
async function writeStore(store) {
  const client = getR2Client();
  const bucket = getEnv("R2_BUCKET_NAME");
  if (client && bucket) {
    await writeToR2(store);
  } else {
    await writeToFile(store);
  }
}
async function getCollectionEntry(setId) {
  const store = await readStore();
  return store[setId] ?? null;
}
async function upsertCollectionEntry(setId, data) {
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

const prerender = false;
const GET = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  }
  const entry = await getCollectionEntry(id);
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
const PUT = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }
  const saved = await upsertCollectionEntry(id, {
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
