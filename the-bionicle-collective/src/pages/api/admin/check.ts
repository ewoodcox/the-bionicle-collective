import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const ok = await isAuthenticated(request, env);
  return new Response(JSON.stringify({ ok }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
