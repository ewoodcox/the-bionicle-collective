# Deploy with Wrangler (`wrangler.jsonc`)

The site uses the repo root **`wrangler.jsonc`** for **Pages**: **KV**, **R2**, and **`send_email`** → **`SEND_EMAIL`** (contact form). See **`docs/EMAIL-CLOUDFLARE-ROUTING.md`**.

---

## Email Routing checklist

### A. Domain (zone)

1. **Email** → **Email Routing** — enable, verify **destination addresses**, add **routing rules** for addresses you use (e.g. `contact@…`).
2. DNS (MX, etc.) as prompted.

### B. Repo: `wrangler.jsonc`

Includes **`send_email`** with **`SEND_EMAIL`**. Do not rename the binding without updating **`src/pages/api/contact.ts`**.

### C. Pages project settings

1. **Build:** `npm run build`, output **`dist`**, correct **root directory** if monorepo.
2. **Use Wrangler configuration file** from the repo → **`wrangler.jsonc`**.
3. **Environment variables (optional):** **`OWNER_EMAIL`**, **`NODE_VERSION`** (e.g. `20`).

### D. Deploy

```bash
npm install
npx wrangler login
npm run deploy
```

(`deploy` = `astro build && wrangler pages deploy`.)

If you removed the **`email-worker`** npm workspace, run **`npm install`** again at the repo root so **`package-lock.json`** matches **`package.json`** (regenerate the lockfile if it was deleted).

### E. Git push / Cloudflare “Connect to Git”

If the build fails with **does not support "send_email"**, the **Git-connected** builder is rejecting **`send_email`** in the checked-in file. That is documented on Cloudflare’s side for some Pages setups. Your project is still configured for **Wrangler**; resolve by using a **Wrangler-based deploy** (above), adjusting the Pages project’s build settings when Cloudflare allows it, or following Cloudflare’s current guidance for Email Routing on Pages.

---

## Other resources

| Resource | Where |
|----------|--------|
| **KV** (`SESSION`) | Create namespace → ID in **`wrangler.jsonc`**. |
| **R2** | Bucket name matches **`wrangler.jsonc`**. |

---

## Checklist

- [ ] **`send_email`** / **`SEND_EMAIL`** in **`wrangler.jsonc`**
- [ ] Email Routing + verified destinations on the zone
- [ ] Build **`npm run build`**, output **`dist`**
- [ ] **`npm run deploy`** or your Wrangler CI flow
- [ ] Contact form tested on **Community**

---

## References

- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
