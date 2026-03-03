import type { APIRoute } from 'astro';
import { buildAuthCookie, isAuthConfigured } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

function jsonResponse(body: { error: string }, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
    if (!isAuthConfigured(env)) {
      return jsonResponse(
        { error: 'Admin login not configured. Set ADMIN_SECRET (or COLLECTION_EDIT_SECRET) in Cloudflare Pages env or in .dev.vars for local dev.' },
        503
      );
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
        return jsonResponse({ error: 'Invalid body' }, 400);
      }
    }
    const key = (body.key ?? '').trim();
    if (key !== secret) {
      return jsonResponse({ error: 'Invalid key' }, 401);
    }
    const cookieHeader = await buildAuthCookie(env);
    if (!cookieHeader) {
      return jsonResponse({ error: 'Could not set session' }, 500);
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ error: `Login failed: ${message}` }, 500);
  }
};
