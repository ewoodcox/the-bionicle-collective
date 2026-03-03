import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../../utils/adminAuth';

export const prerender = false;

/** Clears the admin cookie and redirects to home. Safe to call even when not logged in. */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}`;
  const clearCookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: base + '/',
      'Set-Cookie': clearCookie,
    },
  });
};
