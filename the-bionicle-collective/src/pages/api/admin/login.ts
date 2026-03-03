import type { APIRoute } from 'astro';
import { buildAuthCookie, isAuthConfigured } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!isAuthConfigured(env)) {
    return new Response(JSON.stringify({ error: 'Admin login not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const secret = (env?.ADMIN_SECRET ?? env?.COLLECTION_EDIT_SECRET) as string;
  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    const contentType = request.headers.get('Content-Type') ?? '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = { key: params.get('key') ?? undefined };
    } else {
      return new Response(JSON.stringify({ error: 'Invalid body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  const key = (body.key ?? '').trim();
  if (key !== secret) {
    return new Response(JSON.stringify({ error: 'Invalid key' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const cookieHeader = await buildAuthCookie(env);
  if (!cookieHeader) {
    return new Response(JSON.stringify({ error: 'Could not set session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/collection/';
  const redirectUrl = next.startsWith('/') ? new URL(next, url.origin).toString() : `${url.origin}/collection/`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': cookieHeader,
    },
  });
};
