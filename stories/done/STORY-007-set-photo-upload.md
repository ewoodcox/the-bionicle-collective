# STORY-007 In-browser set photo upload

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 2

---

## User story

**As a** collector (admin)
**I want** to upload or replace a set's photo directly from the set detail page
**So that** I can update set photos without running a terminal maintenance script

---

## Acceptance criteria

- [ ] On `edit.bioniclecollective.com`, the set detail page (`/collection/[id]/`) shows an "Upload photo" button below the set image
- [ ] Clicking the button opens a file picker (accepts jpg/png/webp)
- [ ] Selected image is validated client-side (max 5 MB, must be an accepted type)
- [ ] Image is uploaded via an authenticated `POST /api/sets/photo/[id]` endpoint and stored in R2 under the same key used by `GET /api/sets/photo/[id]`
- [ ] On success, the displayed set image refreshes to show the new photo without a full page reload
- [ ] An error message is shown if the upload fails
- [ ] On `bioniclecollective.com` the upload button is not rendered

---

## Notes

- Existing `GET /api/sets/photo/[id].ts` serves photos from R2 with watermark; extend or add a `POST` handler alongside it
- R2 key format for set photos: check `src/pages/api/sets/photo/[id].ts` for exact key naming
- Upload via `multipart/form-data` — Cloudflare Workers support reading `request.formData()` and piping to R2 `.put()`
- Auth: POST endpoint must validate admin session cookie
- This upload pattern is reused in STORY-005 (media covers) — establish it here first as the reference implementation
- Watermark is applied client-side (canvas) so raw image can be stored in R2 without modification
