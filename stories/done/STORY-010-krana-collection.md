# STORY-010 Krana collection

**Status:** Done
**Sprint:** Sprint 3
**Created:** 2026-03-25
**Completed:** 2026-03-25

---

## User story

**As a** collector (admin)
**I want** to track which Krana I own, organized by type and color variant
**So that** I can see my Krana collection progress at a glance and toggle ownership from the edit site

---

## Acceptance criteria

- [ ] A dedicated `/krana/` page displays all 144 Krana organized into three sections: **Krana (Active)**, **Krana (Dormant)**, **Krana-Kal**
- [ ] Within each section, the layout is a grid: **columns = type** (Xa, Za, Vu, Ca, Yo, Ja, Su, Bo), **rows = color** (per section below)
  - Active color row order: Red, Medium Blue, Orange, Blue, Green, Lime
  - Dormant color row order: Dark Gray, White, Purple, Yellow, Tan, Black
  - Krana-Kal color row order: Metallic Green, Pearl Very Light Gray, Pearl Sand Blue, Flat Dark Gold, Pearl Dark Gray, Reddish Gold
- [ ] Each Krana card shows its BrickLink part image (proxied), type name, and color label
- [ ] Owned Krana are visually distinct from unowned (same owned/missing treatment as Kanohi cards)
- [ ] On `edit.bioniclecollective.com`, toggle buttons allow marking individual Krana as owned/not owned with optimistic UI update
- [ ] On `bioniclecollective.com`, toggle buttons are **not rendered**
- [ ] Owned state is persisted in R2 (`krana-collection.json`) and falls back to a local file store in dev
- [ ] Each section heading shows an owned/total tally; the page heading shows a global tally
- [ ] The home page stat block includes a Krana owned/total count
- [ ] The admin dashboard (`/admin`) includes Krana owned/total alongside the Kanohi stat
- [ ] A "Krana" entry appears in the **Other** tab of the collection page (`/collection/`) linking to `/krana/`

---

## Notes

- Follow the Kanohi implementation as the reference pattern:
  - `src/data/krana.json` — static catalog (144 entries with BrickLink part IDs and color IDs)
  - `src/data/krana.ts` — data loader, `Krana` type, sort helpers
  - `src/data/krana-collection.json` — static fallback (empty array `[]`)
  - `src/utils/kranaStoreR2.ts` — R2 store (R2 key: `krana-collection.json`)
  - `src/utils/kranaStore.ts` — local file-based fallback for dev
  - `src/pages/krana/index.astro` — dedicated Krana page (SSR, `prerender = false`)
  - `src/pages/api/krana/collection.ts` — GET/PUT owned IDs (same shape as `/api/kanohi/collection`)
- BrickLink image proxy: reuse the `/api/kanohi/image/` proxy route — Krana are standard LEGO parts with PN image paths
- `krana.json` needs to be populated with BrickLink part IDs and color IDs for all 144 items before the page is useful; source from BrickLink catalog (part search by type + color)
- Krana IDs should be slugs like `krana-xa-red`, `krana-kal-xa-metallic-green` for readability
- The grid layout (type as columns, color as rows) differs from Kanohi's per-type card rows — use a CSS grid with `grid-template-columns: repeat(8, 1fr)` and label the rows with color names on the left
- Krana-Kal are metallic/pearl variants released with the Bohrok-Kal sets (2003)
- Dependencies: none (can be built independently of other sprint 3 stories)
