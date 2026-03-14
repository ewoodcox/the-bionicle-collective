/**
 * In-memory fallback for suggestions when R2 is not bound (e.g. local dev).
 * Data is lost on restart; use R2 in production.
 */

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  submitterName?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

let inMemorySuggestions: Suggestion[] = [];

export async function listSuggestions(): Promise<Suggestion[]> {
  return [...inMemorySuggestions].sort((a, b) => {
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
