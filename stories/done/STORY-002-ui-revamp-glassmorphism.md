# STORY-002 UI revamp: glassmorphism, Space Grotesk, sticky header, hero, 404

**Status:** Done
**Sprint:** Sprint 1
**Created:** 2026-03-23
**Completed:** 2026-03-23

---

## User story

**As a** visitor to the site
**I want** a visually polished, immersive UI that feels cohesive with the BIONICLE aesthetic
**So that** browsing the collection feels like an experience rather than a spreadsheet

---

## Acceptance criteria

- [x] Space Grotesk used as heading font; tighter tracking on h1/h2; wider uppercase labels
- [x] Deeper backgrounds with gradient accent (brown → teal → brown) and glow bloom on header/footer/dividers/buttons
- [x] Cards, bio blocks, suggestion cards, login panel, and bulk-edit bar use frosted glass (backdrop-filter)
- [x] Page fade-in on load; card shimmer sweep on hover; carousel edge fade masks; unified easing tokens
- [x] Sticky header: frosted glass, stays pinned with gradient bar; mobile dropdown has matching glass styling
- [x] Active nav link rendered with server-side `aria-current`, solid copper underline with glow
- [x] Home hero: full-viewport centering, atmospheric glow ring, stats pill (sets · years · themes)
- [x] Detail pages: glass image frame, hero h1, refined meta labels, glow arrow nav buttons
- [x] Custom 404 page with branded glowing display numeral and nav links

---

## Notes

- All CSS changes live in `src/styles/global.css`; layout adjustments in `src/layouts/Layout.astro` and `src/pages/index.astro`
- Easing tokens and carousel fade masks added to support smooth motion across the site

## Commits

- `53b782fc` — UI revamp: glassmorphism, glow, Space Grotesk, sticky header, hero, 404
