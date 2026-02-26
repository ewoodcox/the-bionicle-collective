# Deploying The Bionicle Collective to Cloudflare

This guide covers hosting the site on Cloudflare Pages with your domain, KV-backed collection data, and edit-only access for you.

## 1. Connect the repo to Cloudflare Pages

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select the repository that contains this project.
3. **Build configuration:**
   - **Framework preset:** Astro (or None).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** Leave blank if the repo root is this project; otherwise set it to the project folder (e.g. `the-bionicle-collective`).
4. Deploy. You’ll get a `*.pages.dev` URL.

## 2. Set your domain in the project

In **`astro.config.mjs`**, set `site` to your real domain (e.g. `https://yourdomain.com`). It’s already set to `https://thebioniclecollective.com`; change it if you use a different domain.

## 3. KV namespaces and bindings

The collection “In my collection” data is stored in Cloudflare KV when the app runs on Cloudflare. You need two KV namespaces:

1. **SESSION** – Used by the Astro Cloudflare adapter for sessions. Create one and note its ID.
2. **COLLECTION_STORE** – Used for “In my collection” (date acquired, notes, etc.). Create one and note its ID.

**Create namespaces (Wrangler CLI):**

```bash
npx wrangler kv namespace create "SESSION"
npx wrangler kv namespace create "COLLECTION_STORE"
```

Each command prints an **id**. Put those IDs in **`wrangler.jsonc`**:

- Replace `REPLACE_WITH_SESSION_KV_ID` with the SESSION namespace id.
- Replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID` with the COLLECTION_STORE namespace id.

**Bind them to your Pages project:**

1. In the dashboard: **Workers & Pages** → your project → **Settings** → **Functions**.
2. Under **KV namespace bindings**, add:
   - **Variable name:** `SESSION` → select the SESSION namespace.
   - **Variable name:** `COLLECTION_STORE` → select the COLLECTION_STORE namespace.

If you deploy via **Wrangler** (`npx wrangler pages deploy dist`) instead of Git, the bindings in `wrangler.jsonc` are used as long as the project is linked.

## 4. Restrict editing to you only

Only you should be able to save “In my collection” changes. Two options:

### Option A – Cloudflare Access (recommended)

1. In the dashboard: **Zero Trust** → **Access** → **Applications** → **Add an application**.
2. Protect the path used for saving, e.g. **PUT** requests to `/api/collection/*`, or the whole site if you prefer.
3. Add a **policy** that allows only your email (or a group you’re in). When someone (including you) hits the edit API, Cloudflare will challenge for login; only allowed users can proceed.

No code changes needed; the Edit button and API stay as they are.

### Option B – Secret edit key

1. Generate a long random secret (e.g. `openssl rand -hex 32`).
2. In your Pages project: **Settings** → **Functions** → **Environment variables** → **Add** → **Encrypted** (secret). Name: `COLLECTION_EDIT_SECRET`, value: your secret.
3. When you want to edit on the live site, click **“Unlock editing”** on a set page, enter that secret, then use **Edit** and **Save**. The site sends the secret in a header; the API only accepts PUTs when the header matches.

If `COLLECTION_EDIT_SECRET` is not set, the API does not require the key (useful for local dev or if you rely only on Access).

## 5. Custom domain

1. In **Workers & Pages** → your project → **Custom domains** → **Set up a custom domain**.
2. Enter your domain (e.g. `yourdomain.com` or `www.yourdomain.com`). Cloudflare will show the required DNS record (usually a CNAME to the Pages hostname).
3. If the domain is already on Cloudflare, the record is often added for you. Otherwise add the CNAME in your DNS provider.
4. After the record propagates, the site (and API) will be served on your domain over HTTPS.

## 6. Optional: Pre-fill KV with existing data

If you have a local **`src/data/collection-store.json`** and want the same “In my collection” data on Cloudflare:

1. Create the COLLECTION_STORE KV namespace and bind it (step 3).
2. From the project root, run:

   ```bash
   npm run upload:kv -- <YOUR_COLLECTION_STORE_NAMESPACE_ID>
   ```

   Or: `node scripts/upload-collection-store-to-kv.mjs <YOUR_COLLECTION_STORE_NAMESPACE_ID>`. The script uploads `src/data/collection-store.json` to the KV key `collection-store`. Use the production namespace id if you have a separate one.

You can also use the Wrangler CLI directly:

```bash
npx wrangler kv key put "collection-store" --path=src/data/collection-store.json --namespace-id=YOUR_COLLECTION_STORE_ID
```

## Summary

| Step | Action |
|------|--------|
| 1 | Connect repo to Cloudflare Pages; set build command and output directory. |
| 2 | Set `site` in `astro.config.mjs` to your domain. |
| 3 | Create SESSION and COLLECTION_STORE KV namespaces; put IDs in `wrangler.jsonc`; add KV bindings in the Pages project. |
| 4 | Restrict edits: use Cloudflare Access and/or set `COLLECTION_EDIT_SECRET` and use “Unlock editing” on the site. |
| 5 | Add custom domain in Pages and configure DNS. |
| 6 | (Optional) Run the upload script to seed KV from `collection-store.json`. |

After this, the site is hosted on Cloudflare at your domain, collection data persists in KV, and only you can change “In my collection” (via Access and/or the secret key).
