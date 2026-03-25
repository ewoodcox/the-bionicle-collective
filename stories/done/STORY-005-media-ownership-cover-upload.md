# STORY-005 Media ownership toggle and cover image upload

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 1

---

## User story

**As a** collector (admin)
**I want** to toggle media items I own and upload cover images from the browser
**So that** I can manage my media collection without running scripts or manually editing R2

---

## Acceptance criteria

- [ ] On `edit.bioniclecollective.com`, each media card on `/collection/?gen=media` displays an ownership toggle
- [ ] Toggling ownership fires an authenticated API call to update `media-collection.json` in R2
- [ ] On the media detail page (`/media/[id]/`), an "Upload cover" button is visible on the edit subdomain
- [ ] Clicking "Upload cover" opens a file picker (accepts jpg/png/webp)
- [ ] Selected image is uploaded via an authenticated `POST /api/media/cover/[id]` endpoint and stored in R2
- [ ] The page refreshes or updates the displayed cover image on successful upload
- [ ] File size is validated client-side (max 2 MB) before upload
- [ ] On `bioniclecollective.com` neither the toggle nor the upload button are rendered

---

## Notes

- Ownership store: `src/utils/mediaStoreR2.ts` (R2 key: `media-collection.json`, format: `string[]`)
- Existing `GET /api/media/cover/[id]` serves covers from R2; need a `POST` variant to write them
- Upload should use `multipart/form-data` or base64 body — keep it simple (no presigned URLs needed, Worker can stream directly to R2)
- Auth: upload endpoint must validate admin session cookie
- Dependencies: STORY-007 (set photo upload) will establish the same upload pattern first; share the approach
