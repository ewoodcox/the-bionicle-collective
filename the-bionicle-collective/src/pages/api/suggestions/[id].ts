/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../utils/adminAuth';
import * as storeR2 from '../../../utils/suggestionsStoreR2';
import * as storeMem from '../../../utils/suggestionsStore';

export const prerender = false;

type Env = { BIONICLE_COLLECTION?: R2Bucket; ADMIN_SECRET?: string; COLLECTION_EDIT_SECRET?: string };

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      hide: (id: string) => storeR2.hideSuggestion(bucket, id),
      unhide: (id: string) => storeR2.unhideSuggestion(bucket, id),
      pinReply: (id: string, replyId: string) => storeR2.pinReply(bucket, id, replyId),
      delete: (id: string) => storeR2.deleteSuggestion(bucket, id),
    };
  }
  return {
    hide: (id: string) => storeMem.hideSuggestion(id),
    unhide: (id: string) => storeMem.unhideSuggestion(id),
    pinReply: (id: string, replyId: string) => storeMem.pinReply(id, replyId),
    delete: (id: string) => storeMem.deleteSuggestion(id),
  };
}

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing suggestion id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { action?: string; replyId?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const action = body?.action;
  const store = getStore(locals);

  if (action === 'hide') {
    const s = await store.hide(id);
    if (!s) {
      return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'unhide') {
    const s = await store.unhide(id);
    if (!s) {
      return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'pin_reply') {
    const replyId = String(body?.replyId ?? '').trim();
    if (!replyId) {
      return new Response(JSON.stringify({ error: 'replyId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const s = await store.pinReply(id, replyId);
    if (!s) {
      return new Response(JSON.stringify({ error: 'Suggestion or reply not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(s), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ error: 'action must be "hide", "unhide", or "pin_reply"' }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing suggestion id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const ok = await isAuthenticated(request, env);
  if (!ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const store = getStore(locals);
  const deleted = await store.delete(id);
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
