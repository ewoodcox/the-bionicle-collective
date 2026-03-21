# Deploy with Wrangler (`wrangler.jsonc`)

The site’s **`wrangler.jsonc`** configures **Pages**: **KV** and **R2** only.

**Do not** add **`send_email`** to this file — **Git-connected Pages** fails with *Configuration file for Pages projects does not support "send_email"*.

Outbound mail uses a **separate Worker** (e.g. **`the-bionicle-email-worker`**) that **does** declare **`send_email`** in **its** Wrangler file. The Pages project calls it via **`EMAIL_WORKER_URL`**. See **`docs/EMAIL-CLOUDFLARE-ROUTING.md`**.

---

## Email Routing checklist

### A. Domain (zone)

1. **Email** → **Email Routing** — enable, verify **destination addresses**, **routing rules** (e.g. `contact@…`).
2. DNS (MX, etc.) as prompted.

### B. Email Worker (separate deploy)

Deploy **`the-bionicle-email-worker`** (or your Worker) with **`send_email`** → **`SEND_EMAIL`** in **that** Worker’s Wrangler config. Copy its public URL (e.g. `https://the-bionicle-email-worker.<account>.workers.dev`).

### C. Pages project — environment variables

**Workers & Pages** → your **Pages** project → **Settings** → **Environment variables** (Production):

| Variable | Required | Purpose |
|----------|----------|---------|
| **`EMAIL_WORKER_URL`** | **Yes** (for contact form) | Full URL of the email Worker (no trailing slash required). |
| **`EMAIL_WORKER_SECRET`** | Optional | Must match the Worker’s secret if you use `wrangler secret put EMAIL_WORKER_SECRET` on the email Worker. |
| **`OWNER_EMAIL`** | Optional | Recipient override (default in code: `contact@…`). |
| **`NODE_VERSION`** | If builds fail | e.g. `20` or `22`. **Never leave blank** (can cause `npm error Invalid Version:`). |

### D. Pages project — build & Wrangler file

1. **Build:** `npm run build`, output **`dist`**, correct **root directory** if monorepo.
2. **Use Wrangler configuration file** from the repo → **`wrangler.jsonc`** (KV + R2 only).

### E. Deploy

```bash
npm install
npx wrangler login
npm run deploy
```

(`deploy` = `astro build && wrangler pages deploy`.)

---

## Other resources

| Resource | Where |
|----------|--------|
| **KV** (`SESSION`) | ID in **`wrangler.jsonc`**. |
| **R2** | Bucket name in **`wrangler.jsonc`**. |

---

## Checklist

- [ ] Email Worker deployed with **`send_email`**; **`EMAIL_WORKER_URL`** set on Pages
- [ ] Email Routing + verified destinations on the zone
- [ ] Build **`npm run build`**, output **`dist`**
- [ ] Git push succeeds (**no** `send_email` in site **`wrangler.jsonc`**)
- [ ] Contact form tested on **Community**

---

## Troubleshooting

### `npm error Invalid Version:` (empty version) during install

Cloudflare runs **`npm clean-install`** (same as **`npm ci`**). That error means npm hit a **semver it can’t parse** — often an **empty string** — usually from:

- A **corrupt or hand-edited** `package-lock.json`
- A **bad merge** that left the lockfile out of sync with `package.json`
- **Environment variables** in the Pages project (e.g. **`NODE_VERSION`** or **`NPM_VERSION`**) set to a **blank** value (treat as “invalid version”)

**Fix locally (then commit `package-lock.json`):**

```bash
cd the-bionicle-collective
rm -rf node_modules
rm package-lock.json
npm install
npm ci   # must succeed before pushing
npm run build
```

Also check **Workers & Pages** → **Settings** → **Environment variables**: remove or set **`NODE_VERSION`** (e.g. `22`) — **do not leave it empty**.

---

## References

- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
