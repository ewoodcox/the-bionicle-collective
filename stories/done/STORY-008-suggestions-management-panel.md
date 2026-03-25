# STORY-008 Suggestions management panel

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 1

---

## User story

**As a** collector (admin)
**I want** a consolidated view of all community suggestions with inline moderation controls
**So that** I can reply, pin, hide, and delete suggestions without navigating one-by-one

---

## Acceptance criteria

- [ ] On `edit.bioniclecollective.com`, the `/community/` page shows all suggestions including hidden ones (hidden are visually flagged)
- [ ] Each suggestion card on the edit subdomain includes:
  - A "Hide / Unhide" toggle (updates `hidden` flag in R2)
  - A "Delete" button with confirmation prompt
  - An inline reply form (pre-filled if a reply exists)
  - A "Pin reply" toggle on existing replies
- [ ] Actions use the existing suggestion API endpoints (`/api/suggestions/[id]`, `/api/suggestions/[id]/reply`)
- [ ] After any action the card updates in-place (no full page reload)
- [ ] A count of total suggestions and count of hidden is shown at the top of the panel
- [ ] On `bioniclecollective.com` the moderation controls are not rendered

---

## Notes

- All needed API endpoints already exist — this is purely a UI layer
- `GET /api/suggestions/index` already returns hidden suggestions when an auth cookie is present
- The hide/unhide toggle is not yet implemented in the API — need to add a `PATCH /api/suggestions/[id]` handler that can update `hidden`
- Pin reply: `POST /api/suggestions/[id]/reply` already returns a reply ID; need a `PATCH /api/suggestions/[id]/reply/[replyId]` to set `pinned: true/false`, or repurpose existing endpoint
- No new pages needed — all changes are conditional rendering in `/community/index.astro` gated by the edit-subdomain check
