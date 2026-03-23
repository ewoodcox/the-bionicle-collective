globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getMediaById } from '../../../../chunks/media_BI7AKjea.mjs';
import { env } from 'cloudflare:workers';
export { renderers } from '../../../../renderers.mjs';

const prerender = false;
const R2_BUCKET_SEGMENT = "bionicle-collection";
function getBucket(locals) {
  const fromLocals = locals?.runtime?.env?.BIONICLE_COLLECTION;
  if (fromLocals) return fromLocals;
  const fromCf = env;
  return fromCf?.BIONICLE_COLLECTION ?? null;
}
function getMediaPublicOrigin(locals) {
  const fromLocals = locals?.runtime?.env?.MEDIA_PUBLIC_ORIGIN;
  const fromCf = env?.MEDIA_PUBLIC_ORIGIN;
  const v = fromLocals ?? fromCf;
  if (typeof v !== "string" || !v.startsWith("http")) return null;
  return v.replace(/\/$/, "");
}
function objectKeyFromStoredUrl(imageUrl) {
  try {
    const u = new URL(imageUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname.includes("r2.cloudflarestorage.com") && parts[0] === R2_BUCKET_SEGMENT) {
      return parts.slice(1).join("/");
    }
    if (parts[0] === "media-covers") {
      return parts.join("/");
    }
    return null;
  } catch {
    return null;
  }
}
function extFromStoredUrl(url) {
  if (!url) return "png";
  const m = url.match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  if (!m) return "png";
  const ext = m[1].toLowerCase();
  return ext === "jpeg" ? "jpg" : ext;
}
function candidateKeysForMedia(media, variant) {
  const primaryUrl = variant === "alt" && media.imageUrlAlt?.trim() ? media.imageUrlAlt : media.imageUrl;
  const keys = [];
  const fromStored = primaryUrl ? objectKeyFromStoredUrl(primaryUrl) : null;
  if (fromStored) keys.push(fromStored);
  const ext = extFromStoredUrl(primaryUrl);
  keys.push(`media-covers/${media.id}/${variant}.${ext}`);
  const exts = ["png", "jpg", "jpeg", "webp", "gif"];
  for (const e of exts) {
    keys.push(`media-covers/${media.id}/${variant}.${e}`);
  }
  return [...new Set(keys)];
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
  const rawId = params.id;
  const id = rawId ? decodeURIComponent(rawId) : "";
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
  const bucket = getBucket(locals);
  if (!bucket) {
    return new Response("Storage not configured", { status: 503 });
  }
  const keys = candidateKeysForMedia(media, variant);
  let obj = null;
  let resolvedKey = null;
  for (const key of keys) {
    const o = await bucket.get(key);
    if (o) {
      obj = o;
      resolvedKey = key;
      break;
    }
  }
  if (!obj || !resolvedKey) {
    const publicOrigin = getMediaPublicOrigin(locals);
    if (publicOrigin && keys.length > 0) {
      return Response.redirect(`${publicOrigin}/${keys[0]}`, 302);
    }
    const body = `Cover not found in R2 for media id "${id}". Keys tried (in order):
${keys.join("\n")}

Upload/sync must use this exact id as the folder name, e.g. media-covers/${id}/main.png in bucket "bionicle-collection".
Or set env MEDIA_PUBLIC_ORIGIN to your public R2/custom domain base (same keys) for redirect fallback.`;
    return new Response(body, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
  const contentType = obj.httpMetadata?.contentType || contentTypeForKey(resolvedKey);
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
