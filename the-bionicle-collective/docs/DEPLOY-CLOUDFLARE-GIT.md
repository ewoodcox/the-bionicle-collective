# Deploy with Wrangler config (Git only — no CLI on your machine)

Your `wrangler.jsonc` in the repo is the **source of truth** for bindings (`SEND_EMAIL`, R2, KV, etc.). Cloudflare applies it when the project builds from Git—you do **not** need to run `wrangler` locally.

## What you do once (dashboard)

### 1. Cloudflare resources that need to exist

| Resource | Where to create |
|----------|------------------|
| **KV namespace** for Astro sessions (`SESSION`) | **Workers & Pages → KV** → Create namespace. Copy the **ID** into `wrangler.jsonc` → `kv_namespaces[0].id` (replace `REPLACE_WITH_SESSION_KV_ID`). |
| **R2 bucket** `bionicle-collection` | **R2** → Create bucket (name must match `wrangler.jsonc` `bucket_name` unless you change the file). |
| **Email Routing** | **Email** → Email Routing on `bioniclecollective.com`, verified destination + rules for `contact@` (or whatever you use). |

### 2. Connect the Git repository (Cloudflare Pages)

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select your Git provider and the repo.
3. Configure the build:

   | Setting | Value |
   |---------|--------|
   | **Framework preset** | Astro (or “None”) |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `/` (or your monorepo subpath if applicable) |

4. **Environment variables** (project → **Settings** → **Environment variables**), at least for **Production**:

   - `OWNER_EMAIL` — optional; defaults to `contact@bioniclecollective.com` in code.
   - `MAILCHANNELS_API_KEY` — only if you use the MailChannels fallback (optional).

5. **Use the Wrangler file from the repo**

   - In **Settings**, find **Functions** / **Bindings** / **Wrangler configuration** (labels vary).
   - Enable using the **Wrangler configuration file** from the repository as the [source of truth](https://developers.cloudflare.com/pages/functions/wrangler-configuration/#source-of-truth).
   - Ensure the file path is **`wrangler.jsonc`** at the project root (or set the path Cloudflare asks for).

   After this, **dashboard bindings for the same resources are overridden** by the file—don’t duplicate them in the UI.

6. **Node version** (if builds fail): **Settings** → **Environment variables** → add `NODE_VERSION` = `20` or `22` (match what you use locally).

7. **Save** and **Deploy** (or push a commit to `main` / your production branch).

### 3. Custom domain

**Workers & Pages** → your project → **Custom domains** → add `bioniclecollective.com` and follow DNS.

---

## What you do ongoing (no Wrangler CLI)

1. Edit **`wrangler.jsonc`** when bindings change (e.g. new KV id, `send_email` tweaks).
2. **Commit and push** to the branch Cloudflare builds for production.
3. Cloudflare runs `npm run build` and applies **`wrangler.jsonc`** to the deployment.

You do **not** need to run `npx wrangler deploy` or `wrangler pages deploy` on your laptop unless you want to.

---

## `wrangler.jsonc` shape for Pages (Git)

This repo uses **`pages_build_output_dir`** so Cloudflare **Pages** can read the same file Astro builds into (`dist/` with `_worker.js`).

If you previously deployed with **`main` + `assets`** (`wrangler deploy` only), that was the **Workers + Assets** flow. **Git-based Pages** should use the Pages-oriented file in the repo.

---

## Checklist

- [ ] `KV` SESSION id in `wrangler.jsonc` is real (not `REPLACE_WITH_SESSION_KV_ID`).
- [ ] R2 bucket `bionicle-collection` exists (or names in file match your bucket).
- [ ] `send_email` with `"name": "SEND_EMAIL"` is present.
- [ ] Pages project **build** = `npm run build`, output = `dist`.
- [ ] Wrangler file from repo is **enabled** as source of truth.
- [ ] Push → deployment succeeds; test **Community** contact form.

---

## References

- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
