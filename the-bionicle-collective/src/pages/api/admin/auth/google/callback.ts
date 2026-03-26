import type { APIRoute } from 'astro';
import { createSession } from '../../../../../utils/adminAuth';
import { findUserByGoogleEmail } from '../../../../../utils/adminUsersR2';

export const prerender = false;

type Env = {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION?: KVNamespace;
  BIONICLE_COLLECTION?: R2Bucket;
};

function errorPage(message: string): Response {
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Sign-in failed</title>
<style>body{font-family:sans-serif;max-width:480px;margin:4rem auto;padding:0 1rem;color:#ccc;background:#111}
h2{color:#e07070}a{color:#c4893c}</style>
</head>
<body>
<h2>Sign-in failed</h2>
<p>${message}</p>
<p><a href="/">Back to sign-in</a></p>
</body></html>`;
  return new Response(html, { status: 401, headers: { 'Content-Type': 'text/html' } });
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const clientId = env?.GOOGLE_CLIENT_ID;
  const clientSecret = env?.GOOGLE_CLIENT_SECRET;
  const kv = env?.SESSION as KVNamespace | undefined;
  const bucket = env?.BIONICLE_COLLECTION;

  if (!clientId || !clientSecret || !kv || !bucket) {
    return errorPage('Google OAuth is not configured on this server.');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return errorPage(`Google returned an error: ${errorParam}`);
  }

  if (!code || !state) {
    return errorPage('Missing required OAuth parameters.');
  }

  // Verify and consume the CSRF state token
  const stateKey = `oauth_state:${state}`;
  const stateRaw = await kv.get(stateKey);
  if (!stateRaw) {
    return errorPage('Invalid or expired sign-in attempt. Please try again.');
  }
  await kv.delete(stateKey);

  let next = '/collection/';
  try {
    const stateData = JSON.parse(stateRaw) as { next?: string };
    if (stateData.next?.startsWith('/')) next = stateData.next;
  } catch { /* use default */ }

  // Exchange authorization code for tokens
  const redirectUri = new URL('/api/admin/auth/google/callback', url.origin).toString();
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return errorPage('Failed to exchange authorization code with Google.');
  }

  const tokens = await tokenRes.json() as { access_token?: string };
  if (!tokens.access_token) {
    return errorPage('No access token returned by Google.');
  }

  // Fetch verified email from Google
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    return errorPage('Failed to retrieve your Google account info.');
  }

  const userInfo = await userInfoRes.json() as { email?: string; email_verified?: boolean };
  if (!userInfo.email || !userInfo.email_verified) {
    return errorPage('Your Google email address could not be verified.');
  }

  // Look up which admin user this email is linked to
  const user = await findUserByGoogleEmail(bucket, userInfo.email);
  if (!user) {
    return errorPage(
      `No admin account is linked to <strong>${userInfo.email}</strong>. ` +
      `Ask your super admin to link this Google address to your account.`
    );
  }

  // Create a session exactly as the password login does
  const cookieHeader = await createSession(env, user.username, user.role);
  if (!cookieHeader) {
    return errorPage('Could not create a session. Please try again.');
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(next, url.origin).toString(),
      'Set-Cookie': cookieHeader,
    },
  });
};
