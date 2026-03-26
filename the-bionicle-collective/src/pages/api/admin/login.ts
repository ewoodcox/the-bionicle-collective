import type { APIRoute } from 'astro';
import { createSession, isAuthConfigured, getLegacySecret } from '../../../utils/adminAuth';
import { verifyUser } from '../../../utils/adminUsersR2';

export const prerender = false;

type Env = {
  ADMIN_SECRET?: string;
  COLLECTION_EDIT_SECRET?: string;
  BIONICLE_COLLECTION?: R2Bucket;
  SESSION?: KVNamespace;
};

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
    if (!isAuthConfigured(env)) {
      return jsonError(
        'Admin login not configured. Set ADMIN_SECRET in Cloudflare Pages → Settings → Environment variables (Production), then redeploy. Check /api/admin/status to verify.',
        503
      );
    }

    let body: { key?: string; username?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      const contentType = request.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const text = await request.text();
        const params = new URLSearchParams(text);
        body = {
          key: params.get('key') ?? undefined,
          username: params.get('username') ?? undefined,
          password: params.get('password') ?? undefined,
        };
      } else {
        return jsonError('Invalid body', 400);
      }
    }

    const legacySecret = getLegacySecret(env);
    let authed = false;
    let username = (body.username ?? '').trim() || 'admin';

    // Legacy path: { key } field, or password matching ADMIN_SECRET
    const submittedKey = (body.key ?? body.password ?? '').trim();
    if (legacySecret && submittedKey === legacySecret) {
      authed = true;
    }

    // R2 user path (only if not already authed via legacy secret)
    if (!authed && body.username && body.password) {
      const bucket = env?.BIONICLE_COLLECTION;
      if (bucket) {
        authed = await verifyUser(bucket, body.username.trim(), body.password);
        if (authed) username = body.username.trim();
      }
    }

    if (!authed) {
      return jsonError('Invalid credentials', 401);
    }

    const cookieHeader = await createSession(env, username);
    if (!cookieHeader) {
      return jsonError('Could not create session — SESSION KV namespace not bound', 500);
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
    return jsonError(`Login failed: ${message}`, 500);
  }
};
