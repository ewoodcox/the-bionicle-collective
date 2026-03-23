# STORY-001 Bulk edit "In my collection" fields across multiple sets

**Status:** Todo
**Sprint:** _(if applicable)_
**Created:** 2026-03-23

---

## User story

**As a** collector
**I want** to select multiple owned sets and apply shared collection details to all of them at once
**So that** I can quickly record a batch of sets I acquired at the same time without editing each one individually

---

## Acceptance criteria

- [ ] A "Bulk edit" button is visible on the collection page on `edit.bioniclecollective.com` only
- [ ] Activating bulk edit mode shows checkboxes on owned cards in the current filtered view; unowned cards are dimmed and not selectable
- [ ] Clicking an owned card in bulk edit mode toggles its selection checkbox
- [ ] A sticky bottom bar appears showing: selected count, field toggles (date acquired, purchased from, status), and "Apply to X sets" / "Cancel" buttons
- [ ] Each field in the bottom bar has an enable/disable toggle; only enabled fields are written on apply
- [ ] "Apply" button is disabled until at least one set and at least one field is selected
- [ ] On apply, each selected set is PATCHed via the existing `/api/collection/[id]` endpoint; unchecked fields are left untouched
- [ ] After all requests complete successfully, the page reloads
- [ ] "Cancel" exits bulk edit mode without making any changes
- [ ] Bulk edit mode is scoped to the current filtered view (active year/category filters apply)

---

## Notes

- Reuse the existing `/api/collection/[id]` PUT endpoint — send only the fields that are toggled on
- The owned-card checkbox mechanic already exists for toggling ownership; bulk edit selection is a separate layer on top
- Fields available for bulk edit: Date acquired (month + year), Purchased from, Status — Notes is intentionally excluded as it's too set-specific
- No new API endpoints needed
