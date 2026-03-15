# The Bionicle Collective

A website for your Bionicle collection: collection list by year (2001–2010, 2015–2016, Other) and individual set pages ready for bios (when/where you got each set).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Your setup checklist

### 1. Colors and social links

Edit **`src/config/site.ts`**:

- Replace each `#______` in `colors` with your hex codes.
- Set `social.youtube`, `social.facebook`, `social.instagram`, and `social.bluesky` to your real URLs.

To use the colors in the site, add CSS variables in **`src/styles/global.css`** that reference your `site.ts` values, or paste the hex codes into the existing `:root` variables there.

### 2. Collection data

Edit **`src/data/collection.json`** directly:

- **`SetRecord`** is the schema. Each set has: `id`, `name`, `setNumber`, `year`, `theme`, `imageUrl`, and optional `acquiredDate`, `acquiredFrom`, `notes` for bios.
- Replace the sample `sets` array with your own data. One entry per set.
- Use **BionicleSector01** for placeholder images: open the set’s wiki page (e.g. [8534 Tahu](https://biosector01.com/wiki/8534_Tahu)), find the main set image, right‑click → “Copy image address.” Paste that as `imageUrl`. When you have your own photos, swap the URL or host images in the repo and point `imageUrl` there.

**Year grouping:** Sets are grouped automatically: 2001–2010, 2015–2016, and Other (see `src/config/constants.ts`). Ensure each set has the correct `year`.

### 3. Adding a bio to a set

On any set in `src/data/collection.json`, set:

- **`acquiredDate`** – e.g. `"2020"` or `"2022-06-15"`
- **`acquiredFrom`** – e.g. `"eBay"`, `"local toy store"`
- **`notes`** – any short story or note; you can expand this into a full bio later.

The set detail page shows an “In my collection” block when any of these are present.

## Build and deploy

```bash
npm run build
```

Output is in `dist/`. This project is set up for **Cloudflare Pages** (server mode with KV for “In my collection” data). See **`../previous commits/CLOUDFLARE-DEPLOY.md`** for deployment steps, custom domain, KV bindings, and restricting edits to you only.

## Project structure

- **`src/config/site.ts`** – Site name, colors (hex), social links.
- **`src/config/constants.ts`** – Year groups (2001–2010, 2015–2016, Other).
- **`src/data/sets.ts`** – Types and loader; **`src/data/collection.json`** – collection data (edit directly).
- **`src/pages/index.astro`** – Home.
- **`src/pages/collection/index.astro`** – Collection list by year.
- **`src/pages/collection/[id].astro`** – One page per set (for bios).
- **`src/layouts/Layout.astro`** – Header, footer, nav.
- **`src/styles/global.css`** – Global styles (wire to your hex codes here or in Layout).
