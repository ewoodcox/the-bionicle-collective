# Deploy with Wrangler (`wrangler.jsonc`)

Your **`wrangler.jsonc`** in the repo is the **source of truth** for bindings: **KV**, **R2**, **`send_email`**, etc. Cloudflare applies it when you deploy—you can use **Git-connected Pages** and/or **`npm run deploy`** (`wrangler pages deploy`). See **`docs/EMAIL-CLOUDFLARE-ROUTING.md`** for contact email (Cloudflare Email Routing only; no MailChannels required).

---

## Email Routing + `SEND_EMAIL` — settings checklist

Do these in order (same Cloudflare account as your zone and Pages project).

### A. Domain: Email Routing

1. In the dashboard, select your zone **`bioniclecollective.com`** (or the domain you use).
2. Go to **Email** → **Email Routing**.
3. **Enable** Email Routing if it isn’t already.
4. **Destination addresses**: add your real inbox (e.g. Gmail) and complete the **verification** email Cloudflare sends.
5. **Routing rules** → **Create address** (or rule):
   - Create an address like **`contact@bioniclecollective.com`** (or the address you want mail *delivered* to for inbound routing).
   - Set action to forward to your **verified** destination.
6. Ensure **DNS** shows the required **MX** (and any other) records Email Routing asks for—use **automatic** DNS on Cloudflare when possible.

You need at least one **[verified destination](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#destination-addresses)** so outbound send from Workers is allowed to that mailbox (or use **`OWNER_EMAIL`** to match a verified address).

### B. Repo: `wrangler.jsonc`

This repo already includes:

```jsonc
"send_email": [{ "name": "SEND_EMAIL" }]
```

Optional tightening (same file): add `destination_address` or `allowed_destination_addresses` per [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/) if you want to restrict recipients.

### C. Pages project (Workers & Pages)

1. **Workers & Pages** → your **Pages** project → **Settings**.
2. **Build**:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** path to this app if the repo is a monorepo (e.g. `the-bionicle-collective`); otherwise `/`.
3. **Environment variables** (Production / Preview as needed):
   - **`OWNER_EMAIL`** (optional) — recipient for the contact form. Use a **verified** Email Routing destination if sends are rejected. Defaults to `contact@bioniclecollective.com` in code.
4. **Functions / Wrangler configuration**
   - Turn on **Use Wrangler configuration file** from the repository ([docs](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#source-of-truth)).
   - Point to **`wrangler.jsonc`** at the project root (adjust if your app lives in a subdirectory).
5. **Node** (if builds fail): add **`NODE_VERSION`** = `20` or `22` under Environment variables.

### D. Deploy

- **From Git:** push to the branch connected to **Production**. Cloudflare runs `npm run build` and applies `wrangler.jsonc`.
- **From your machine (Wrangler):** in the project directory, after `npm install`:

  ```bash
  npx wrangler login
  npm run deploy
  ```

  (`deploy` = `astro build && wrangler pages deploy` — uses the same `wrangler.jsonc`.)

### E. If Git build fails on `send_email`

Some **Pages** builds still validate the config and show:

`Configuration file for Pages projects does not support "send_email"`

**Workarounds:**

1. **Dashboard binding only:** Remove the `"send_email"` block from the **committed** `wrangler.jsonc`, push so the build passes, then in **Workers & Pages** → project → **Settings** → **Bindings** → **Add**, add **Send email** (if your UI shows it) with variable name **`SEND_EMAIL`**. Redeploy.
2. **CLI-only deploys:** Use **`npm run deploy`** after `astro build` so Wrangler applies bindings without relying on that validator path (keep `send_email` in `wrangler.jsonc` locally).
3. Watch Cloudflare’s [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) docs for updates.

---

## Other resources (once)

| Resource | Where |
|----------|--------|
| **KV** (`SESSION`) | **Workers & Pages** → **KV** → create namespace → copy **ID** into `wrangler.jsonc` → `kv_namespaces[0].id`. |
| **R2** `bionicle-collection` | **R2** → create bucket; name must match `r2_buckets[0].bucket_name` in `wrangler.jsonc`. |

---

## Ongoing

1. Edit **`wrangler.jsonc`** when bindings change (KV id, R2 name, `send_email` options).
2. **Commit and push** (or run **`npm run deploy`**).

---

## Checklist

- [ ] Email Routing **enabled**; at least one **verified** destination.
- [ ] Routing rule for **`contact@…`** (or your chosen address).
- [ ] **`send_email`** with **`SEND_EMAIL`** in `wrangler.jsonc` (this repo).
- [ ] Pages **build** = `npm run build`, output = `dist`, correct **root directory**.
- [ ] **Wrangler file from repo** enabled (or deploy via **`npm run deploy`**).
- [ ] Optional: **`OWNER_EMAIL`** set to a verified address if needed.
- [ ] Contact form tested on **Community** page.

---

## References

- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
