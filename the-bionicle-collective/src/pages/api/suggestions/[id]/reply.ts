/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import * as storeR2 from '../../../../utils/suggestionsStoreR2';
import * as storeMem from '../../../../utils/suggestionsStore';
import { checkRateLimitReplies } from '../../../../utils/rateLimitR2';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      addReply: (id: string, data: { text: string; authorName?: string }) =>
        storeR2.addReply(bucket, id, data),
    };
  }
  return {
    addReply: (id: string, data: { text: string; authorName?: string }) =>
      storeMem.addReply(id, data),
  };
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing suggestion id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
  const rateOk = await checkRateLimitReplies(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: 'Too many replies. Please try again in an hour.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { text?: string; authorName?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const text = String(body?.text ?? '').trim();
  if (!text || text.length < 1) {
    return new Response(JSON.stringify({ error: 'Reply text is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authorName = body?.authorName != null ? String(body.authorName).trim() : undefined;
  const store = getStore(locals);
  const suggestion = await store.addReply(id, { text, authorName });

  if (!suggestion) {
    return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(suggestion), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
