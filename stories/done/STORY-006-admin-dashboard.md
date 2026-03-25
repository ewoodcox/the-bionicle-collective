# STORY-006 Admin dashboard landing page

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 3

---

## User story

**As a** collector (admin)
**I want** a dedicated home page on `edit.bioniclecollective.com` after logging in
**So that** I have a clear starting point for all editing tasks and can quickly see what needs attention

---

## Acceptance criteria

- [ ] After login, the admin is redirected to `/admin` instead of the site root
- [ ] `/admin` is only accessible on `edit.bioniclecollective.com` (middleware enforces this)
- [ ] The dashboard displays summary stats:
  - Total sets in catalog vs. sets with "In my collection" bio data filled in
  - Number of Kanohi masks owned / total
  - Number of media items owned / total
  - Count of unread/unanswered community suggestions
- [ ] The dashboard has quick-action links: Edit Collection, Manage Kanohi, Manage Media, Suggestions, Unique Items
- [ ] A "what needs attention" section lists sets missing acquired date or status (up to 10, with links)
- [ ] The page is SSR (no static prerender) and reads live data from R2

---

## Notes

- New page at `src/pages/admin/index.astro` (SSR, `export const prerender = false`)
- Middleware (`src/middleware.ts`) should redirect from `/` to `/admin` on the edit subdomain post-login
- Stats are aggregated server-side at render time by reading each R2 store — no separate API calls needed
- "Needs attention" query: iterate `collection-store.json`, find entries where `acquiredDate` or `status` is missing
- Dependencies: STORY-004 and STORY-005 should be done first so the Kanohi/media ownership counts are meaningful
