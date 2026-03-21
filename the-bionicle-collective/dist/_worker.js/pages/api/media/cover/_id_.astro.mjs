globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getMediaById } from '../../../../chunks/media_DceDyRGo.mjs';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const R2_BUCKET_SEGMENT = "bionicle-collection";
function getBucket(locals) {
  return locals.runtime?.env?.BIONICLE_COLLECTION ?? null;
}
function objectKeyFromStoredUrl(imageUrl) {
  try {
    const u = new URL(imageUrl);
    if (!u.hostname.includes("r2.cloudflarestorage.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] !== R2_BUCKET_SEGMENT) return null;
    return parts.slice(1).join("/");
  } catch {
    return null;
  }
}
function contentTypeForKey(key) {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}
const GET = async ({ params, url, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response("Not found", { status: 404 });
  }
  const media = getMediaById(id);
  if (!media) {
    return new Response("Not found", { status: 404 });
  }
  const variant = url.searchParams.get("variant") === "alt" ? "alt" : "main";
  const chosenUrl = variant === "alt" && media.imageUrlAlt && media.imageUrlAlt.trim() !== "" ? media.imageUrlAlt : media.imageUrl;
  if (!chosenUrl || chosenUrl.trim() === "") {
    return new Response("Not found", { status: 404 });
  }
  if (!chosenUrl.includes("r2.cloudflarestorage.com")) {
    return Response.redirect(chosenUrl, 302);
  }
  const key = objectKeyFromStoredUrl(chosenUrl);
  if (!key) {
    return new Response("Invalid media image URL", { status: 400 });
  }
  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response("Storage not configured", { status: 503 });
  }
  const obj = await bucket.get(key);
  if (!obj) {
    return new Response("Not found", { status: 404 });
  }
  const contentType = obj.httpMetadata?.contentType || contentTypeForKey(key);
  return new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      ...obj.etag ? { ETag: obj.etag } : {}
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
