/**
 * In-memory fallback for suggestions when R2 is not bound (e.g. local dev).
 * Data is lost on restart; use R2 in production.
 */

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
  adminReply?: { text: string; repliedAt: string };
  replies?: Reply[];
}

let inMemorySuggestions: Suggestion[] = [];

function ensureReplies(s: Suggestion): Suggestion {
  let replies = s.replies ?? [];
  if (s.adminReply && !replies.some((r) => r.text === s.adminReply!.text)) {
    replies = [
      { id: crypto.randomUUID(), text: s.adminReply.text, authorName: 'Admin', createdAt: s.adminReply.repliedAt, pinned: true },
      ...replies,
    ];
    s.replies = replies;
    delete s.adminReply;
  }
  return s;
}

export async function listSuggestions(includeHidden = false): Promise<Suggestion[]> {
  let list = inMemorySuggestions.map(ensureReplies);
  if (!includeHidden) list = list.filter((s) => !s.hidden);
  return list.sort((a, b) => {
    const scoreA = a.upvotes - a.downvotes;
    const scoreB = b.upvotes - b.downvotes;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function addSuggestion(data: {
  title: string;
  description: string;
  submitterName?: string;
}): Promise<Suggestion> {
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
  inMemorySuggestions.push(suggestion);
  return suggestion;
}

export async function applyVote(
  id: string,
  direction: 'up' | 'down',
  previousDirection: 'up' | 'down' | null
): Promise<Suggestion | null> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const s = inMemorySuggestions[idx];
  if (previousDirection === 'up') s.upvotes = Math.max(0, s.upvotes - 1);
  if (previousDirection === 'down') s.downvotes = Math.max(0, s.downvotes - 1);
  if (direction === 'up') s.upvotes += 1;
  else s.downvotes += 1;
  return s;
}

export async function hideSuggestion(id: string): Promise<Suggestion | null> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  inMemorySuggestions[idx].hidden = true;
  return inMemorySuggestions[idx];
}

export async function unhideSuggestion(id: string): Promise<Suggestion | null> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  inMemorySuggestions[idx].hidden = false;
  return inMemorySuggestions[idx];
}

/** Add a reply to a suggestion (any user). */
export async function addReply(
  id: string,
  data: { text: string; authorName?: string }
): Promise<Suggestion | null> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const s = ensureReplies(inMemorySuggestions[idx]);
  const replies = s.replies ?? [];
  replies.push({
    id: crypto.randomUUID(),
    text: data.text.slice(0, 1000),
    authorName: data.authorName?.slice(0, 100),
    createdAt: new Date().toISOString(),
  });
  s.replies = replies;
  return s;
}

/** Pin a reply as the top reply (admin only). */
export async function pinReply(id: string, replyId: string): Promise<Suggestion | null> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const s = ensureReplies(inMemorySuggestions[idx]);
  const replies = s.replies ?? [];
  for (const r of replies) r.pinned = r.id === replyId;
  s.replies = replies;
  return s;
}

export async function deleteSuggestion(id: string): Promise<boolean> {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  inMemorySuggestions.splice(idx, 1);
  return true;
}
