# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**The Bionicle Collective** — a personal Bionicle collection showcase site. The app lives in `the-bionicle-collective/`. The `stories/` directory is a Scrum-style backlog (Markdown files, not code).

## Commands

Run from `the-bionicle-collective/`:

```bash
npm run dev        # Local dev server at http://localhost:4321
npm run build      # Production build → dist/
npm run deploy     # Build + deploy to Cloudflare Pages (requires wrangler auth)
npm run preview    # Preview the production build locally
```

Maintenance scripts (also from `the-bionicle-collective/`):

```bash
npm run verify:r2             # Validate R2 collection format
npm run sync:media-covers-r2  # Sync local media covers to Cloudflare R2
npm run fetch:kanohi          # Import Kanohi mask data from BrickLink
npm run warm:kanohi-images    # Warm Kanohi image cache
```

## Architecture

**Stack:** Astro 5 (SSR mode) + Cloudflare Pages adapter, TypeScript, deployed to Cloudflare Pages/Workers.

**Two deployment hosts:**
- `bioniclecollective.com` — public-facing site (read-only for visitors)
- `edit.bioniclecollective.com` — admin interface; protected by middleware (`src/middleware.ts`) that redirects unauthenticated HTML requests to the login form

**Cloudflare bindings** (defined in `wrangler.jsonc`):
- `BIONICLE_COLLECTION` — R2 bucket (`bionicle-collection`); stores all mutable JSON data files
- `SESSION` — KV namespace; stores admin session tokens

**Data storage pattern:** Each data domain has a pair of files — a store utility and an R2-backed store:
- `src/utils/collectionStoreR2.ts` — "In my collection" bios (R2 key: `collection-store.json`)
- `src/utils/kanohiStoreR2.ts` — Kanohi mask data
- `src/utils/mediaStoreR2.ts` — Media (comics, books) metadata
- `src/utils/suggestionsStoreR2.ts` — Community suggestions + votes
- `src/utils/rateLimitR2.ts` — Rate limiting via R2

R2 is authoritative in production. The static `src/data/collection.json` is the base set catalog (set names, years, image URLs); mutable bio data lives in R2 only.

**Auth flow:** `src/utils/adminAuth.ts` handles session validation via KV. `src/middleware.ts` enforces auth on `edit.bioniclecollective.com`. Admin API endpoints are at `src/pages/api/admin/`.

**API routes** (all SSR, run as Cloudflare Workers):
- `src/pages/api/collection/[id].ts` — CRUD for individual set bios
- `src/pages/api/suggestions/` — Community suggestions + voting + admin replies
- `src/pages/api/kanohi/` — Kanohi mask data + image proxy
- `src/pages/api/media/` — Media collection + cover image storage

**Key config files:**
- `src/config/site.ts` — Site name, hex colors, social links
- `src/config/constants.ts` — Year group definitions (2001–2010, 2015–2016, Other)
- `src/data/sets.ts` — `SetRecord` type + loader for `collection.json`

## Local dev notes

- `npm run dev` uses Astro's dev server; Cloudflare bindings (R2, KV) are not available locally by default — use `wrangler dev` if you need to test binding-dependent API routes locally.
- Environment variables for local R2 scripts (sync, fetch, warm) are set via `.env` — see `.env.example`.
- Email sending is handled by a separate Cloudflare Worker (`the-bionicle-email-worker`), not this app, because `send_email` is unsupported in Pages `wrangler.jsonc`.
