globalThis.process ??= {}; globalThis.process.env ??= {};
const R2_KEY = "rate-limit.json";
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 60 * 60 * 1e3;
const SUGGESTIONS_LIMIT = 5;
const SUGGESTIONS_WINDOW_MS = 24 * 60 * 60 * 1e3;
function parseStore(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return {};
}
function pruneTimestamps(timestamps, windowMs) {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff);
}
async function checkRateLimitContact(bucket, ip) {
  if (!bucket) return true;
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  const entry = store[ip] ?? {};
  let contact = pruneTimestamps(entry.contact ?? [], CONTACT_WINDOW_MS);
  if (contact.length >= CONTACT_LIMIT) return false;
  contact.push(Date.now());
  store[ip] = { ...entry, contact };
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" }
  });
  return true;
}
async function checkRateLimitSuggestions(bucket, ip) {
  if (!bucket) return true;
  const object = await bucket.get(R2_KEY);
  const raw = object ? await object.text() : null;
  const store = parseStore(raw);
  const entry = store[ip] ?? {};
  let suggestions = pruneTimestamps(entry.suggestions ?? [], SUGGESTIONS_WINDOW_MS);
  if (suggestions.length >= SUGGESTIONS_LIMIT) return false;
  suggestions.push(Date.now());
  store[ip] = { ...entry, suggestions };
  await bucket.put(R2_KEY, JSON.stringify(store), {
    httpMetadata: { contentType: "application/json" }
  });
  return true;
}

export { checkRateLimitSuggestions as a, checkRateLimitContact as c };
