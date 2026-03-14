globalThis.process ??= {}; globalThis.process.env ??= {};
const R2_KEY = "suggestions.json";
const VOTES_R2_KEY = "suggestion-votes.json";
function parseStore(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.suggestions && Array.isArray(parsed.suggestions)) {
      return parsed.suggestions.filter(
        (s) => s && typeof s.id === "string" && typeof s.title === "string" && typeof s.description === "string" && typeof s.upvotes === "number" && typeof s.downvotes === "number" && typeof s.createdAt === "string"
      );
    }
  } catch {
  }
  return [];
}
function ensureReplies$1(s) {
  let replies = s.replies ?? [];
  if (s.adminReply && !replies.some((r) => r.text === s.adminReply.text)) {
    replies = [
      { id: crypto.randomUUID(), text: s.adminReply.text, createdAt: s.adminReply.repliedAt, pinned: true },
      ...replies
    ];
    s.replies = replies;
    delete s.adminReply;
  }
  return s;
}
async function getSuggestions(bucket, includeHidden = false) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  let suggestions = parseStore(raw).map(ensureReplies$1);
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
async function addSuggestion$1(bucket, data) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const id = crypto.randomUUID();
  const suggestion = {
    id,
    title: data.title.slice(0, 100),
    description: data.description.slice(0, 500),
    submitterName: data.submitterName?.slice(0, 100),
    upvotes: 0,
    downvotes: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  suggestions.push(suggestion);
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return suggestion;
}
function parseVotesStore(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
async function getPreviousVote(bucket, visitorId, suggestionId) {
  const object = await bucket.get(VOTES_R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseVotesStore(raw);
  const dir = store[visitorId]?.[suggestionId];
  return dir === "up" || dir === "down" ? dir : null;
}
async function recordVote(bucket, visitorId, suggestionId, direction) {
  const object = await bucket.get(VOTES_R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseVotesStore(raw);
  if (!store[visitorId]) store[visitorId] = {};
  store[visitorId][suggestionId] = direction;
  await bucket.put(VOTES_R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" }
  });
}
async function applyVote$1(bucket, suggestionId, direction, previousDirection) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s2) => s2.id === suggestionId);
  if (idx < 0) return null;
  const s = suggestions[idx];
  if (previousDirection === "up") s.upvotes = Math.max(0, s.upvotes - 1);
  if (previousDirection === "down") s.downvotes = Math.max(0, s.downvotes - 1);
  if (direction === "up") s.upvotes += 1;
  else s.downvotes += 1;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return s;
}
async function hideSuggestion$1(bucket, suggestionId) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  suggestions[idx].hidden = true;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return suggestions[idx];
}
async function unhideSuggestion$1(bucket, suggestionId) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  suggestions[idx].hidden = false;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return suggestions[idx];
}
async function addReply$1(bucket, suggestionId, data) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw).map(ensureReplies$1);
  const idx = suggestions.findIndex((s2) => s2.id === suggestionId);
  if (idx < 0) return null;
  const s = suggestions[idx];
  const replies = s.replies ?? [];
  const reply = {
    id: crypto.randomUUID(),
    text: data.text.slice(0, 1e3),
    authorName: data.authorName?.slice(0, 100),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  replies.push(reply);
  s.replies = replies;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return s;
}
async function pinReply$1(bucket, suggestionId, replyId) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw).map(ensureReplies$1);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return null;
  const replies = suggestions[idx].replies ?? [];
  for (const r of replies) r.pinned = r.id === replyId;
  suggestions[idx].replies = replies;
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return suggestions[idx];
}
async function deleteSuggestion$1(bucket, suggestionId) {
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const suggestions = parseStore(raw);
  const idx = suggestions.findIndex((s) => s.id === suggestionId);
  if (idx < 0) return false;
  suggestions.splice(idx, 1);
  await bucket.put(R2_KEY, JSON.stringify({ suggestions }), {
    httpMetadata: { contentType: "application/json" }
  });
  return true;
}

let inMemorySuggestions = [];
function ensureReplies(s) {
  let replies = s.replies ?? [];
  if (s.adminReply && !replies.some((r) => r.text === s.adminReply.text)) {
    replies = [
      { id: crypto.randomUUID(), text: s.adminReply.text, authorName: "Admin", createdAt: s.adminReply.repliedAt, pinned: true },
      ...replies
    ];
    s.replies = replies;
    delete s.adminReply;
  }
  return s;
}
async function listSuggestions(includeHidden = false) {
  let list = inMemorySuggestions.map(ensureReplies);
  if (!includeHidden) list = list.filter((s) => !s.hidden);
  return list.sort((a, b) => {
    const scoreA = a.upvotes - a.downvotes;
    const scoreB = b.upvotes - b.downvotes;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
async function addSuggestion(data) {
  const id = crypto.randomUUID();
  const suggestion = {
    id,
    title: data.title.slice(0, 100),
    description: data.description.slice(0, 500),
    submitterName: data.submitterName?.slice(0, 100),
    upvotes: 0,
    downvotes: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  inMemorySuggestions.push(suggestion);
  return suggestion;
}
async function applyVote(id, direction, previousDirection) {
  const idx = inMemorySuggestions.findIndex((s2) => s2.id === id);
  if (idx < 0) return null;
  const s = inMemorySuggestions[idx];
  if (previousDirection === "up") s.upvotes = Math.max(0, s.upvotes - 1);
  if (previousDirection === "down") s.downvotes = Math.max(0, s.downvotes - 1);
  if (direction === "up") s.upvotes += 1;
  else s.downvotes += 1;
  return s;
}
async function hideSuggestion(id) {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  inMemorySuggestions[idx].hidden = true;
  return inMemorySuggestions[idx];
}
async function unhideSuggestion(id) {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  inMemorySuggestions[idx].hidden = false;
  return inMemorySuggestions[idx];
}
async function addReply(id, data) {
  const idx = inMemorySuggestions.findIndex((s2) => s2.id === id);
  if (idx < 0) return null;
  const s = ensureReplies(inMemorySuggestions[idx]);
  const replies = s.replies ?? [];
  replies.push({
    id: crypto.randomUUID(),
    text: data.text.slice(0, 1e3),
    authorName: data.authorName?.slice(0, 100),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  s.replies = replies;
  return s;
}
async function pinReply(id, replyId) {
  const idx = inMemorySuggestions.findIndex((s2) => s2.id === id);
  if (idx < 0) return null;
  const s = ensureReplies(inMemorySuggestions[idx]);
  const replies = s.replies ?? [];
  for (const r of replies) r.pinned = r.id === replyId;
  s.replies = replies;
  return s;
}
async function deleteSuggestion(id) {
  const idx = inMemorySuggestions.findIndex((s) => s.id === id);
  if (idx < 0) return false;
  inMemorySuggestions.splice(idx, 1);
  return true;
}

export { addReply$1 as a, addReply as b, applyVote$1 as c, applyVote as d, deleteSuggestion$1 as e, deleteSuggestion as f, getPreviousVote as g, hideSuggestion$1 as h, pinReply as i, unhideSuggestion as j, hideSuggestion as k, addSuggestion$1 as l, getSuggestions as m, addSuggestion as n, listSuggestions as o, pinReply$1 as p, recordVote as r, unhideSuggestion$1 as u };
