# Remaining Steps: Auth, Deployment, and Edge Cases

Process for completing the "In my Collection" R2 + Cloudflare Pages setup.

---

## 1. Add auth to the write API

**Goal:** Only you can edit "In my Collection." The PUT `/api/collection/[id]` endpoint is currently public.

**Option A: Secret token (implemented)**

Uses a login page + signed cookie. The secret is never sent to the client.

1. Generate a secret: `openssl rand -hex 32`
2. Add to `.env`: `ADMIN_SECRET=your_secret_here`
3. Add to Cloudflare Pages env vars: `ADMIN_SECRET` (mark as secret)
4. Visit `/login`, enter your secret, submit. A cookie is set.
5. Edit on set pages; the cookie is sent automatically. If not logged in, you're redirected to `/login`.

**Option B: Platform password (no code)**

1. In Cloudflare Pages: Settings → Functions → Add a rule to require Cloudflare Access for `/api/collection/*`.
2. Or use Cloudflare Zero Trust to protect the API path.
3. No code changes; only you (authenticated) can reach the API.

**Option C: Auth provider (Clerk, Auth0, Supabase)**

1. Add an auth provider; restrict the admin/edit UI to your identity.
2. The Edit button on set pages only appears (or works) when you're logged in.
3. The API validates the session/JWT before allowing writes.

**Recommendation:** Use Option B (Cloudflare Access) if you already have Zero Trust, or Option A with a secret stored in a cookie set by a separate login page (so the secret isn't in the page source).

---

## 2. Deploy to Cloudflare Pages

**Goal:** Get the site live on Cloudflare Pages with R2-backed collection.

**Steps:**

1. **Create a Pages project**
   - Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
   - Select your repo and branch (e.g. `main`)

2. **Configure build**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (or the project root if in a monorepo)

3. **Add environment variables**
   - Cloudflare Pages project → Settings → Environment variables
   - Add each (Production and Preview if you use previews):
     - `R2_ACCOUNT_ID`
     - `R2_ACCESS_KEY_ID`
     - `R2_SECRET_ACCESS_KEY`
     - `R2_BUCKET_NAME`
     - `R2_ENDPOINT`

4. **Optional: `ADMIN_SECRET`**
   - If you use Option A for auth, add `ADMIN_SECRET` as an env var (and mark it as secret/encrypted).

5. **Deploy**
   - Push to the connected branch; Cloudflare will build and deploy automatically.
   - Or use `npx wrangler pages deploy dist` for manual deploy.

**Verify:** After deploy, open a set page, click Edit, change a field, Save. Confirm the change persists and appears on refresh.

---

## 3. File fallback graceful failure (optional)

**Goal:** If R2 env vars are missing in production, the app should fail gracefully instead of crashing.

**Current behavior:** On Cloudflare Workers, `fs` doesn't exist. If R2 isn't configured, `readFromFile` / `writeToFile` will throw when importing `fs`.

**Fix:** In `src/utils/collectionStore.ts`:

- Wrap `readFromFile` in try/catch: on error, return `{}`.
- Wrap `writeToFile` in try/catch: on error, throw a clear message: "R2 not configured. Set R2_* env vars in Cloudflare Pages."

- Or: only attempt file fallback when `typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'` (or similar) so we never run file code on Workers.

---

## 4. wrangler.toml if SESSION error appears

**Goal:** If deploy fails with "Invalid binding `SESSION`", add the binding.

**Steps:**

1. Create a KV namespace:
   ```bash
   npx wrangler kv namespace create SESSION
   ```
2. Note the `id` from the output.
3. Create `wrangler.toml` in the project root:
   ```toml
   name = "the-bionicle-collective"
   compatibility_date = "2024-01-01"

   [[kv_namespaces]]
   binding = "SESSION"
   id = "<your-kv-namespace-id>"
   ```
4. Redeploy.

**Note:** If you don't use Astro sessions, you can try disabling the adapter's session feature (if supported) instead of adding KV.

---

## Checklist

- [ ] Auth on write API (choose Option A, B, or C)
- [ ] Cloudflare Pages project created and connected
- [ ] Build config set (command, output dir)
- [ ] R2 env vars added in Pages project
- [ ] Deploy and verify Edit works
- [ ] (Optional) File fallback graceful failure
- [ ] (If needed) wrangler.toml with SESSION KV
