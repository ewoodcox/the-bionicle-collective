globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const BRICKLINK_IMG_BASE = "https://img.bricklink.com/ItemImage";
const R2_PREFIX = "kanohi-images/";
function getBucket(locals) {
  const env = locals.runtime?.env;
  return env?.BIONICLE_COLLECTION ?? null;
}
const GET = async ({ params, locals }) => {
  const pathParam = params.path;
  const path = pathParam == null ? "" : Array.isArray(pathParam) ? pathParam.join("/") : String(pathParam);
  if (!path) {
    return new Response("Not found", { status: 404 });
  }
  if (!path.match(/^PN\/\d+\/\d+\.png$/i)) {
    return new Response("Invalid path", { status: 400 });
  }
  const bucket = getBucket(locals);
  const r2Key = R2_PREFIX + path;
  if (bucket) {
    const cached = await bucket.get(r2Key);
    if (cached) {
      const body = cached.body;
      const etag = cached.etag;
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
          ...etag ? { ETag: etag } : {}
        }
      });
    }
  }
  const bricklinkUrl = `${BRICKLINK_IMG_BASE}/${path}`;
  const fetchRes = await fetch(bricklinkUrl);
  if (!fetchRes.ok) {
    return new Response("Upstream error", { status: fetchRes.status });
  }
  const imageData = await fetchRes.arrayBuffer();
  if (bucket) {
    try {
      await bucket.put(r2Key, imageData, {
        httpMetadata: { contentType: "image/png" }
      });
    } catch {
    }
  }
  return new Response(imageData, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
