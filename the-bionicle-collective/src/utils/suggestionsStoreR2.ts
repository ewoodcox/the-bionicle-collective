/**
 * Suggestions store backed by Cloudflare R2.
 * Reads/writes suggestions.json in the bound R2 bucket.
 */

/// <reference types="@cloudflare/workers-types" />

const R2_KEY = 'suggestions.json';
const VOTES_R2_KEY = 'suggestion-votes.json';

export interface Reply {
  id: string;
  text: string;
  authorName?: string;
  createdAt: string;
  pinned?: boolean;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  submitterName?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  hidden?: boolean;
  /** @deprecated Use replies instead; migrated on read */
  adminReply?: { text: string; repliedAt: string };
  replies?: Reply[];
}

type StoreShape = { suggestions: Suggestion[] };

/** Migrate adminReply to replies and ensure replies array exists. */
function normalizeReplies(s: Suggestion): Suggestion {
  const replies = [...(s.replies ?? [])];
  if (s.adminReply && !replies.some((r) => r.text === s.adminReply!.text)) {
    replies.push({
      id: crypto.randomUUID(),
      text: s.adminReply.text,
      authorName: 'Admin',
      createdAt: s.adminReply.repliedAt,
      pinned: true,
    });
  }
  return { ...s, replies: replies.length ? replies : undefined, adminReply: undefined };
}

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

/** Migrate legacy adminReply to replies array. */
function ensureReplies(s: Suggestion): Suggestion {
  let replies = s.replies ?? [];
  if (s.adminReply && !replies.some((r) => r.text === s.adminReply!.text)) {
    replies = [
      { id: crypto.randomUUID(), text: s.adminReply.text, createdAt: s.adminReply.repliedAt, pinned: true },
      ...replies,
    ];
    s.replies = replies;
    delete s.adminReply;
  }
  return s;
}

export async function getSuggestions(bucket: R2Bucket, includeHidden = false): Promise<Suggestion[]> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  let suggestions = parseStore(raw).map(ensureReplies);
  if (!includeHidden) {
    suggestions = suggestions.filter((s) => !s.hidden);
  }
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

/** Hide a suggestion (admin only). */
export async function hideSuggestion(bucket: R2Bucket, suggestionId: string): Promise<Suggestion | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  suggestions[idx].hidden = true;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return suggestions[idx];
}

/** Unhide a suggestion (admin only). */
export async function unhideSuggestion(bucket: R2Bucket, suggestionId: string): Promise<Suggestion | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  suggestions[idx].hidden = false;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return suggestions[idx];
}

/** Add a reply to a suggestion (any user). */
export async function addReply(
  bucket: R2Bucket,
  suggestionId: string,
  data: { text: string; authorName?: string }
): Promise<Suggestion | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw).map(ensureReplies);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  const s = suggestions[idx];
  const replies = s.replies ?? [];
  const reply: Reply = {
    id: crypto.randomUUID(),
    text: data.text.slice(0, 1000),
    authorName: data.authorName?.slice(0, 100),
    createdAt: new Date().toISOString(),
  };
  replies.push(reply);
  s.replies = replies;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return s;
}

/** Pin a reply as the top reply (admin only). */
export async function pinReply(
  bucket: R2Bucket,
  suggestionId: string,
  replyId: string
): Promise<Suggestion | null> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw).map(ensureReplies);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  const replies = suggestions[idx].replies ?? [];
  for (const r of replies) r.pinned = r.id === replyId;
  suggestions[idx].replies = replies;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return suggestions[idx];
}

/** Delete a suggestion permanently (admin only). */
export async function deleteSuggestion(bucket: R2Bucket, suggestionId: string): Promise<boolean> {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return false;
  suggestions.splice(idx, 1);
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: 'application/json' },
  });
  return true;
}
