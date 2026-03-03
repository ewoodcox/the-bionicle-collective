# Server logs and admin login

## Where are the server logs?

- **Cloudflare (production):** In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → your project (e.g. the one for `edit.bioniclecollective.com`) → **Logs** or **Real-time Logs**. There you can see requests, errors, and `console.log` output from your API routes and middleware.
- **Local development:** Logs appear in the **terminal** where you ran `npm run dev` (or `astro dev`). Any errors or `console.log` from the server show there.

## Log out from edit.bioniclecollective.com

Use the **Log out** link in the header (on any page on the edit subdomain) or on the home page when you’re logged in. That clears the admin cookie and sends you back to the login form.

## Where to set ADMIN_SECRET (checklist)

The app reads `ADMIN_SECRET` (or `COLLECTION_EDIT_SECRET`) from the **Cloudflare Worker/Pages environment** only. It does **not** read from `.env` in production. Use this checklist:

### Production (edit.bioniclecollective.com)

1. **Cloudflare dashboard**  
   - Go to **Workers & Pages** → open the **Pages project** that serves **edit.bioniclecollective.com** (the one whose custom domain is the edit subdomain).  
   - **Settings** → **Environment variables** (or **Variables and Secrets**).  
   - **Add** → name: `ADMIN_SECRET`, value: your secret.  
   - Choose **Production** (and **Preview** if you use preview deployments).  
   - Save.

2. **Redeploy**  
   - Env vars apply only to **new** deployments. After adding or changing `ADMIN_SECRET`, trigger a new deploy (e.g. **Deployments** → **Create deployment**, or push a commit if you use Git).

3. **If you have two Pages projects** (e.g. one for main site, one for edit), set `ADMIN_SECRET` on the **edit** project (the one with custom domain `edit.bioniclecollective.com`), then redeploy that project.

### Local development

4. **`.dev.vars`** (recommended for local)  
   - In the **project root** (same folder as `wrangler.jsonc`), create or edit **`.dev.vars`**.  
   - Add: `ADMIN_SECRET=your_secret_here`  
   - Restart the dev server (`npm run dev`).

5. **Optional: `.env`**  
   - You can put `ADMIN_SECRET=...` in **`.env`** for reference; some Wrangler setups load `.env` in local dev. If login works with `.dev.vars` but not with only `.env`, rely on **`.dev.vars`** for local.

### Verify

6. Open **https://edit.bioniclecollective.com/api/admin/status** in your browser. If it shows `authConfigured: true`, the secret is available. Then the value you type in the login form must **match exactly** (no extra spaces, same casing).
