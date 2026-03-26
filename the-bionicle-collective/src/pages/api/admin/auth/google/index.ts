import type { APIRoute } from 'astro';

export const prerender = false;

const SCOPE = 'openid email';
const STATE_TTL_SEC = 300; // 5 minutes

type Env = { GOOGLE_CLIENT_ID?: string; SESSION?: KVNamespace };

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const clientId = env?.GOOGLE_CLIENT_ID;
  const kv = env?.SESSION as KVNamespace | undefined;

  if (!clientId || !kv) {
    return new Response('Google OAuth not configured', { status: 503 });
  }

  const url = new URL(request.url);
  const next = url.searchParams.get('next') || '/collection/';
  const redirectUri = new URL('/api/admin/auth/google/callback', url.origin).toString();

  // Generate CSRF state token
  const stateBytes = crypto.getRandomValues(new Uint8Array(16));
  const state = Array.from(stateBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await kv.put(`oauth_state:${state}`, JSON.stringify({ next }), {
    expirationTtl: STATE_TTL_SEC,
  });

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', redirectUri);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', SCOPE);
  googleUrl.searchParams.set('state', state);
  googleUrl.searchParams.set('access_type', 'online');

  return Response.redirect(googleUrl.toString(), 302);
};
