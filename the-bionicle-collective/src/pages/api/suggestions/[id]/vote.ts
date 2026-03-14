/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import * as storeR2 from '../../../../utils/suggestionsStoreR2';
import * as storeMem from '../../../../utils/suggestionsStore';

export const prerender = false;

const VOTE_COOKIE = 'suggestion_votes';

type Env = { BIONICLE_COLLECTION?: R2Bucket };

function getVisitorId(request: Request): string {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? '';
  const ua = request.headers.get('User-Agent') ?? '';
  const input = `${ip}|${ua}`;
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return `v${Math.abs(h).toString(36)}`;
}

function getStore(locals: App.Locals) {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  const bucket = env?.BIONICLE_COLLECTION;
  if (bucket) {
    return {
      applyVote: (
        id: string,
        direction: 'up' | 'down',
        previousDirection: 'up' | 'down' | null
      ) => storeR2.applyVote(bucket, id, direction, previousDirection),
      getPreviousVote: (visitorId: string, suggestionId: string) =>
        storeR2.getPreviousVote(bucket, visitorId, suggestionId),
      recordVote: (visitorId: string, suggestionId: string, direction: 'up' | 'down') =>
        storeR2.recordVote(bucket, visitorId, suggestionId, direction),
      useR2: true,
    };
  }
  return {
    applyVote: (
      id: string,
      direction: 'up' | 'down',
      previousDirection: 'up' | 'down' | null
    ) => storeMem.applyVote(id, direction, previousDirection),
    getPreviousVote: async () => null as 'up' | 'down' | null,
    recordVote: async () => {},
    useR2: false,
  };
}

function parseVoteCookie(cookieHeader: string | null): Record<string, 'up' | 'down'> {
  if (!cookieHeader) return {};
  const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${VOTE_COOKIE}=([^;]*)`));
  if (!match) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1]));
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // ignore
  }
  return {};
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing suggestion id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { direction?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dir = body?.direction;
  if (dir !== 'up' && dir !== 'down') {
    return new Response(
      JSON.stringify({ error: 'direction must be "up" or "down"' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const store = getStore(locals);
  let previousDirection: 'up' | 'down' | null;

  if (store.useR2) {
    const visitorId = getVisitorId(request);
    previousDirection = await store.getPreviousVote(visitorId, id);
    const updated = await store.applyVote(id, dir, previousDirection);
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await store.recordVote(visitorId, id, dir);
    return new Response(JSON.stringify({ ...updated, currentVote: dir }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const votes = parseVoteCookie(request.headers.get('Cookie'));
  previousDirection = (votes[id] as 'up' | 'down') || null;
  const updated = await store.applyVote(id, dir, previousDirection);

  if (!updated) {
    return new Response(JSON.stringify({ error: 'Suggestion not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const newVotes = { ...votes, [id]: dir };
  const cookieValue = encodeURIComponent(JSON.stringify(newVotes));

  return new Response(JSON.stringify({ ...updated, currentVote: dir }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${VOTE_COOKIE}=${cookieValue}; Path=/; Max-Age=31536000; SameSite=Lax`,
    },
  });
};
