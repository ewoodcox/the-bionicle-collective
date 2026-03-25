# STORY-004 Kanohi ownership toggle UI

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 1

---

## User story

**As a** collector (admin)
**I want** to toggle which Kanohi masks I own directly from the Kanohi page
**So that** I don't have to manually edit R2 JSON to update my mask collection

---

## Acceptance criteria

- [ ] On `edit.bioniclecollective.com`, each mask card on `/kanohi/` displays a checkbox or toggle indicating ownership
- [ ] Clicking the toggle immediately fires a PATCH/POST to update `kanohi-collection.json` in R2
- [ ] Optimistic UI: the toggle updates instantly; reverts on error
- [ ] On `bioniclecollective.com` the toggles are not rendered (read-only as today)
- [ ] Owned masks are visually distinct (existing owned styling is preserved)
- [ ] A success/error status indicator is shown per toggle action

---

## Notes

- Ownership data lives in `src/utils/kanohiStoreR2.ts` (R2 key: `kanohi-collection.json`, format: `string[]` of owned IDs)
- API route `GET /api/kanohi/collection` exists; need a `POST` or `PATCH` counterpart to write updates
- Auth: PATCH endpoint must validate the admin session cookie (same pattern as `/api/collection/[id]`)
- Toggles should be scoped to the edit subdomain check already used elsewhere (`window.location.hostname === 'edit.bioniclecollective.com'`)

## Implementation

- The `PUT /api/kanohi/collection` endpoint already existed and supported `{ maskId, owned }` toggle — no API changes needed
- Added `data-mask-id` / `data-owned` attributes to each `.kanohi-card` in `src/pages/kanohi/index.astro`
- Added a `<button class="kanohi-toggle">` overlaid on the card image (hidden by default, shown via JS on edit subdomain)
- Script handles optimistic UI updates, section tally refresh, global count refresh, and error revert
- All acceptance criteria met
