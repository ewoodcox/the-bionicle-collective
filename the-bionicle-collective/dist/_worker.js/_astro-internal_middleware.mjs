globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/index_CDlYhCgd.mjs';
import { i as isAuthenticated } from './chunks/adminAuth_CE1MGqB7.mjs';
import './chunks/astro-designed-error-pages_DA0flnre.mjs';
import './chunks/astro/server_DPDpufRN.mjs';

const EDIT_HOST = "edit.bioniclecollective.com";
const onRequest$2 = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get("Host") ?? "";
  if (host !== EDIT_HOST) {
    return next();
  }
  const url = new URL(context.request.url);
  const path = url.pathname;
  if (path === "/" || path.startsWith("/api/admin/")) {
    return next();
  }
  const accept = context.request.headers.get("Accept") ?? "";
  if (!accept.includes("text/html")) {
    return next();
  }
  const env = context.locals.runtime?.env;
  const ok = await isAuthenticated(context.request, env);
  if (ok) {
    return next();
  }
  const redirectUrl = new URL(context.request.url);
  redirectUrl.pathname = "/";
  return context.redirect(redirectUrl.toString());
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2
	
);

export { onRequest };
