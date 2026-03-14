/**
 * Suggestions store backed by Cloudflare R2.
 * Reads/writes suggestions.json in the bound R2 bucket.
 */

/// <reference types="@cloudflare/workers-types" />

const R2_KEY = 'suggestions.json';
const VOTES_R2_KEY = 'suggestion-votes.json';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  submitterName?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

type StoreShape = { suggestions: Suggestion[] };

function parseStore(raw: string | null): Suggestion[] {
  if (!raw) return [];
  try {
    const parsed: StoreShape = JSON.parse(raw);
    if (parsed?.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions.filter(
        (s): s is Suggestion =>
          s &&
          typeof s.id === 'string' &&
          typeof s.title === 'string' &&
          typeof s.description === 'string' &&
          typeof s.upvotes === 'number' &&
          typeof s.downvotes === 'number' &&
          typeof s.createdAt === 'string'
      );
    }
  } catch {
    // ignore
  }
  return [];
}

export async function getSuggestions(bucket: R2Bucket): Promise<Suggestion[]> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  return suggestions.sort((a, b) => {
    const scoreA = a.upvotes - a.downvotes;
    const scoreB = b.upvotes - b.downvotes;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function addSuggestion(
  bucket: R2Bucket,
  data: { title: string; description: string; submitterName?: string }
): Promise<Suggestion> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const id = crypto.randomUUID();
  const suggestion: Suggestion = {
    id,
    title: data.title.slice(0, 100),
    description: data.description.slice(0, 500),
    submitterName: data.submitterName?.slice(0, 100),
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  };
  suggestions.push(suggestion);
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return suggestion;
}

type VotesStore = { [visitorId: string]: { [suggestionId: string]: 'up' | 'down' } };

function parseVotesStore(raw: string | null): VotesStore {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as VotesStore;
  } catch {
    // ignore
  }
  return {};
}

/** Get previous vote for a suggestion by visitor (from R2). */
export async function getPreviousVote(
  bucket: R2Bucket,
  visitorId: string,
  suggestionId: string
): Promise<'up' | 'down' | null> {
  const object = await bucket.get(VOTES_R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseVotesStore(raw);
  const dir = store[visitorId]?.[suggestionId];
  return dir === 'up' || dir === 'down' ? dir : null;
}

/** Record vote in R2 for visitor tracking. */
export async function recordVote(
  bucket: R2Bucket,
  visitorId: string,
  suggestionId: string,
  direction: 'up' | 'down'
): Promise<void> {
  const object = await bucket.get(VOTES_R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseVotesStore(raw);
  if (!store[visitorId]) store[visitorId] = {};
  store[visitorId][suggestionId] = direction;
  await bucket.put(VOTES_R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: 'application/json' },
  });
}

export async function applyVote(
  bucket: R2Bucket,
  suggestionId: string,
  direction: 'up' | 'down',
  previousDirection: 'up' | 'down' | null
): Promise<Suggestion | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  const s = suggestions[idx];
  if (previousDirection === 'up') s.upvotes = Math.max(0, s.upvotes - 1);
  if (previousDirection === 'down') s.downvotes = Math.max(0, s.downvotes - 1);
  if (direction === 'up') s.upvotes += 1;
  else s.downvotes += 1;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return s;
}
