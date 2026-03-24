# STORY-003 Expand media catalog and overhaul community page

**Status:** Done
**Sprint:** Sprint 1
**Created:** 2026-03-24
**Completed:** 2026-03-24

---

## User story

**As a** BIONICLE fan visiting the site
**I want** a complete media catalog (books, CDs, games, card games) and a well-organized community page
**So that** I can discover the full range of BIONICLE media and connect with the community in one place

---

## Acceptance criteria

- [x] 27 BIONICLE mini CD-ROM entries added to media catalog (2001–2007), replacing placeholders
- [x] 16 games entries added (retail video games + board games, 2001–2016), replacing placeholders
- [x] 6 physical card game entries added (Upper Deck, McDonald's, regional variants)
- [x] 32 book covers fetched from BS01 and uploaded to R2
- [x] Community page restructured with Forum / Email tab switcher; Suggestions section moved to the top
- [x] Forum tab links to the configured `forumUrl` from site config
- [x] Home page hero "Themes" stat replaced with live Kanohi count fetched from R2
- [x] Edit subdomain gate fixed: shows home page when session is valid (instead of a logged-in panel)
- [x] Contact tab styles added to global.css

---

## Notes

- `forumUrl` added to `src/config/site.ts` so the forum link is easy to update without touching the page
- Kanohi count on the home page is live (SSR fetch from R2) rather than a hardcoded number
- Book cover images stored in R2; fetch script at `scripts/fetch-book-covers.mjs`, upload script at `scripts/upload-local-covers-to-r2.mjs`

## Commits

- `5205b205` — Add book covers: fetch from BS01, upload all 32 to R2, update media.json
- `2e13170a` — Housekeeping: gitignore build artifacts, add R2 upload script
- `55c72a7d` — Community page, media catalog, home page fixes
