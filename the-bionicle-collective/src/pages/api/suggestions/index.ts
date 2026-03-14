/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import * as storeR2 from '../../../utils/suggestionsStoreR2';
import * as storeMem from '../../../utils/suggestionsStore';
import { checkRateLimitSuggestions } from '../../../utils/rateLimitR2';
import { isAuthenticated } from '../../../utils/adminAuth';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      list: (includeHidden: boolean) => storeR2.getSuggestions(bucket, includeHidden),
      add: (data: { title: string; description: string; submitterName?: string }) =>
        storeR2.addSuggestion(bucket, data),
    };
  }
  return {
    list: (includeHidden: boolean) => storeMem.listSuggestions(includeHidden),
    add: (data: { title: string; description: string; submitterName?: string }) =>
      storeMem.addSuggestion(data),
  };
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const includeHidden = await isAuthenticated(request, env);
  const store = getStore(locals);
  const suggestions = await store.list(includeHidden);
  return new Response(JSON.stringify({ suggestions }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
  const rateOk = await checkRateLimitSuggestions(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: 'Too many suggestions. Please try again tomorrow.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { title?: string; description?: string; submitterName?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const title = String(body?.title ?? '').trim();
  const description = String(body?.description ?? '').trim();
  const submitterName = body?.submitterName != null ? String(body.submitterName).trim() : undefined;

  if (!title || title.length < 3) {
    return new Response(
      JSON.stringify({ error: 'Title must be at least 3 characters' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const store = getStore(locals);
  const suggestion = await store.add({ title, description, submitterName });

  return new Response(JSON.stringify(suggestion), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
