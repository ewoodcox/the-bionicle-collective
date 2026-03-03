import type { APIRoute } from 'astro';
import { isAuthConfigured } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

/**
 * Returns whether admin auth is configured (secret is set).
 * Use this to verify ADMIN_SECRET is available: hit /api/admin/status on edit.bioniclecollective.com.
 * Does not reveal the secret.
 */
export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const configured = isAuthConfigured(env);
  return new Response(
    JSON.stringify({
      authConfigured: configured,
      hint: configured
        ? 'Login should work. If it still fails, the key you enter may not match ADMIN_SECRET.'
        : 'Set ADMIN_SECRET in Cloudflare Pages: Project → Settings → Environment variables (Production), then redeploy.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
