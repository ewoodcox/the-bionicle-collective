# STORY-009 Audit log and change history

**Status:** Done
**Sprint:** Sprint 2
**Created:** 2026-03-24
**Completed:** 2026-03-24
**Phase:** 3

---

## User story

**As a** collector (admin)
**I want** a lightweight change log that records what was edited and when
**So that** I can review recent changes and recover from accidental overwrites without permanent data loss

---

## Acceptance criteria

- [ ] Every write operation (collection bio update, bulk update, kanohi ownership change, media ownership change, photo upload, suggestion action, unique item change) appends an entry to a change log in R2
- [ ] Each log entry contains: timestamp, action type, entity ID, before-value (snapshot), after-value
- [ ] A log viewer is accessible at `/admin/log` on the edit subdomain (most recent 50 entries, newest first)
- [ ] Log entries show: when, what changed, old vs. new values in a readable diff format
- [ ] A "Restore" button is available on collection bio entries — clicking it re-applies the before-value via the existing API
- [ ] The log file is capped: entries older than 30 days are pruned on each write to keep R2 storage bounded
- [ ] `/admin/log` is SSR, auth-gated, and not accessible on the public subdomain

---

## Notes

- R2 key: `change-log.json` — format: `{ entries: ChangeEntry[] }` sorted newest-first
- `ChangeEntry` type: `{ id: string, timestamp: string, action: string, entityId: string, before: unknown, after: unknown }`
- Write-before-overwrite pattern: in each store utility (`collectionStoreR2.ts`, etc.), read current value → append log entry → write new value — all within the same request handler
- "Restore" is only safe for collection bio data (structured, reversible); photo/image uploads are excluded from restore
- Log viewer page depends on STORY-006 (admin dashboard) being done first for consistent navigation
- Dependencies: STORY-006 should be done first
