# STORY-001 Bulk edit "In my collection" fields across multiple sets

**Status:** Done
**Sprint:** Sprint 1
**Created:** 2026-03-23
**Completed:** 2026-03-23

---

## User story

**As a** collector
**I want** to select multiple owned sets and apply shared collection details to all of them at once
**So that** I can quickly record a batch of sets I acquired at the same time without editing each one individually

---

## Acceptance criteria

- [x] A "Bulk edit" button is visible on the collection page on `edit.bioniclecollective.com` only
- [x] Activating bulk edit mode shows checkboxes on owned cards in the current filtered view; unowned cards are dimmed and not selectable
- [x] Clicking an owned card in bulk edit mode toggles its selection checkbox
- [x] A sticky bottom bar appears showing: selected count, field toggles (date acquired, purchased from, status), and "Apply to X sets" / "Cancel" buttons
- [x] Each field in the bottom bar has an enable/disable toggle; only enabled fields are written on apply
- [x] "Apply" button is disabled until at least one set and at least one field is selected
- [x] On apply, selected sets are updated via a single bulk API endpoint; unchecked fields are left untouched
- [x] After all requests complete successfully, the page reloads
- [x] "Cancel" exits bulk edit mode without making any changes
- [x] Bulk edit mode is scoped to the current filtered view (active year/category filters apply)

---

## Notes

- Implemented via a dedicated bulk API endpoint (`/api/collection/bulk`) to avoid race conditions from parallel individual PATCHes
- Fields available for bulk edit: Date acquired (month + year), Purchased from, Status — Notes intentionally excluded as it's too set-specific

## Commits

- `fbf99a45` — Add bulk edit for collection details; alternate cover on media detail page
- `638058ce` — Fix bulk edit race condition by using a single bulk API endpoint
