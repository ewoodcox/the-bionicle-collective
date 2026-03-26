import type { APIRoute } from 'astro';
import { COOKIE_NAME, deleteSession } from '../../../utils/adminAuth';

export const prerender = false;

/** Deletes the KV session and clears the cookie. Safe to call when not logged in. */
export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Record<string, unknown> } }).runtime?.env;
  await deleteSession(request, env);
  const url = new URL(request.url);
  const clearCookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.protocol}//${url.host}/`,
      'Set-Cookie': clearCookie,
    },
  });
};
