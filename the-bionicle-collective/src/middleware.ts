import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './utils/adminAuth';

const EDIT_HOST = 'edit.bioniclecollective.com';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.request.headers.get('Host') ?? '';
  if (host !== EDIT_HOST) {
    return next();
  }

  const url = new URL(context.request.url);
  const path = url.pathname;

  // Allow home page (login form) and admin API without auth
  if (path === '/' || path.startsWith('/api/admin/')) {
    return next();
  }

  // For HTML requests to other paths, require auth and redirect to home if not logged in
  const accept = context.request.headers.get('Accept') ?? '';
  if (!accept.includes('text/html')) {
    return next();
  }

  const env = (context.locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env;
  const ok = await isAuthenticated(context.request, env);
  if (ok) {
    return next();
  }

  const redirectUrl = new URL(context.request.url);
  redirectUrl.pathname = '/';
  return context.redirect(redirectUrl.toString());
});
