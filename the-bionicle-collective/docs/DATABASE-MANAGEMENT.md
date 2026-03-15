# Database Management — R2 and Cloudflare

This document describes how The Bionicle Collective stores data in Cloudflare R2, which items serve as the master reference, and how email/API are configured through Cloudflare.

---

## 1. R2 Object Storage (Master Reference)

All persistent application data lives in **Cloudflare R2 Object Storage** in the `bionicle-collection` bucket. When the R2 bucket is bound (production on Cloudflare Pages/Workers), these objects are the **master reference** for accuracy. Local files and in-memory stores are fallbacks only for development when R2 is not available.

### R2 Objects

| Purpose | R2 Key | Source File | Notes |
|--------|--------|-------------|-------|
| **Kanohi images** | `kanohi-images/<path>` | `src/pages/api/kanohi/image/[[...path]].ts` | Mask images (e.g. `PN/123/456.png`), cached from BrickLink |
| **Collection store** | `collection-store.json` | `src/utils/collectionStoreR2.ts` | "In my collection" bios: acquiredDate, notes, etc. per set |
| **Kanohi collection** | `kanohi-collection.json` | `src/utils/kanohiStoreR2.ts` | Owned Kanohi mask IDs |
| **Suggestion votes** | `suggestion-votes.json` | `src/utils/suggestionsStoreR2.ts` | Visitor vote history (IP+UA hash → suggestionId → direction) |
| **Suggestions** | `suggestions.json` | `src/utils/suggestionsStoreR2.ts` | Community suggestions, replies, upvotes/downvotes |
| **Rate limit** | `rate-limit.json` | `src/utils/rateLimitR2.ts` | Contact (5/hour), suggestions (5/day), replies (20/hour) per IP |

### Binding

The R2 bucket is bound in `wrangler.jsonc` as `BIONICLE_COLLECTION` and passed to API routes via `locals.runtime.env`. For production, configure the binding in the Cloudflare Pages/Workers dashboard (Workers & Pages → project → Settings → R2 bucket bindings).

### Fallbacks (Development Only)

When `BIONICLE_COLLECTION` is not bound (e.g. local dev):

- **Collection store** → `src/data/collection-store.json` (file)
- **Kanohi collection** → `src/data/kanohi-store.json` or in-memory
- **Suggestions / votes / rate-limit** → in-memory (lost on restart)

These fallbacks are *never* used in production. R2 is the single source of truth there.

---

## 2. Email and API — Cloudflare First

Email and API configuration should be established **through Cloudflare** (dashboard, Workers, Pages), not via wrangler config or third-party services where Cloudflare has native support.

### API Endpoints

- All API routes run on **Cloudflare Workers / Pages** (Astro adapter `@astrojs/cloudflare`).
- Endpoints are defined in `src/pages/api/` and deployed with the site.
- Configuration (env vars, secrets, R2/KV bindings) should be managed in the **Cloudflare Dashboard** where possible:
  - Workers & Pages → your project → Settings → Environment variables
  - Use `wrangler secret put` or Dashboard for secrets; avoid hardcoding.

### Email Forwarding

- **Inbound email**: Use **Cloudflare Email Routing** (Dashboard → Email → Email Routing).
  - Create catch-all or specific addresses (e.g. `contact@bioniclecollective.com`).
  - Forward to your real inbox; no code required.
- **Contact form (outbound)**: Prefer **MailChannels** (Cloudflare ecosystem) for sending from Workers instead of Resend.
  - MailChannels offers free sending from Workers when correctly configured.
  - Configure via Cloudflare dashboard and a Worker that calls MailChannels API.
- If using Resend for the contact form, it should be configured as an env var (`RESEND_API_KEY`) in the Cloudflare project settings, not in wrangler config or `.dev.vars` for production.

---

## 3. Function Reference

### Collection Store (`collectionStoreR2.ts`)

- `getCollectionEntry(bucket, setId)` — Get "in my collection" entry for a set.
- `upsertCollectionEntry(bucket, setId, data)` — Create or update entry.

**R2 key:** `collection-store.json`

### Kanohi Collection (`kanohiStoreR2.ts`)

- `getKanohiOwnedIds(bucket)` — Get owned mask IDs.
- `setKanohiOwnedIds(bucket, ids)` — Replace owned list.

**R2 key:** `kanohi-collection.json`

### Suggestions Store (`suggestionsStoreR2.ts`)

- `getSuggestions(bucket, includeHidden)` — List suggestions.
- `addSuggestion(bucket, data)` — Add a suggestion.
- `addReply(bucket, suggestionId, data)` — Add a reply.
- `applyVote(bucket, id, direction, previousDirection)` — Update vote counts.
- `getPreviousVote` / `recordVote` — Vote tracking.
- `hideSuggestion`, `unhideSuggestion`, `pinReply`, `deleteSuggestion` — Admin actions.

**R2 keys:** `suggestions.json`, `suggestion-votes.json`

### Rate Limit (`rateLimitR2.ts`)

- `checkRateLimitContact(bucket, ip)` — 5 requests per hour.
- `checkRateLimitSuggestions(bucket, ip)` — 5 requests per day.
- `checkRateLimitReplies(bucket, ip)` — 20 requests per hour.

**R2 key:** `rate-limit.json`

### Kanohi Images (`src/pages/api/kanohi/image/[[...path]].ts`)

- Serves images from R2 under `kanohi-images/<path>`.
- On cache miss, fetches from BrickLink, stores in R2, returns image.

**R2 prefix:** `kanohi-images/`

---

## 4. Migration Notes

- **collection.json → collection-store.json**: The R2 key was updated to `collection-store.json` for consistency. The code automatically migrates: on first read, if `collection-store.json` is missing but `collection.json` exists, it copies to `collection-store.json` and uses it going forward.
- **Kanohi images**: Pre-warm cache with `npm run warm:kanohi-images` (uses wrangler R2 put). Images are written lazily on first request if not cached.
