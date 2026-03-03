# Server logs and admin login

## Where are the server logs?

- **Cloudflare (production):** In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages** → your project (e.g. the one for `edit.bioniclecollective.com`) → **Logs** or **Real-time Logs**. There you can see requests, errors, and `console.log` output from your API routes and middleware.
- **Local development:** Logs appear in the **terminal** where you ran `npm run dev` (or `astro dev`). Any errors or `console.log` from the server show there.

## Log out from edit.bioniclecollective.com

Use the **Log out** link in the header (on any page on the edit subdomain) or on the home page when you’re logged in. That clears the admin cookie and sends you back to the login form.

## ADMIN_SECRET not working

1. **Check that the secret is available:** Open  
   `https://edit.bioniclecollective.com/api/admin/status`  
   in your browser. The JSON will show `authConfigured: true` only if `ADMIN_SECRET` (or `COLLECTION_EDIT_SECRET`) is set in the environment.

2. **Set the variable in Cloudflare:**  
   **Workers & Pages** → your **Pages** project → **Settings** → **Environment variables**. Add **ADMIN_SECRET** for the **Production** environment (and Preview if you use it). Use a strong random value. **Redeploy** after saving; env vars apply to new deployments only.

3. **Local dev:** Create a **`.dev.vars`** file in the project root (same level as `wrangler.jsonc`) with:
   ```bash
   ADMIN_SECRET=your_secret_here
   ```
   Restart the dev server after changing `.dev.vars`.

4. **Exact match:** The value you type in the login form must match `ADMIN_SECRET` exactly (no extra spaces, same casing).
