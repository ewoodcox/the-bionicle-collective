# Contact form email (Wrangler + Cloudflare Email Routing)

The Community page sends mail only through **`cloudflare:email`** and the **`SEND_EMAIL`** binding. Configure it in **`wrangler.jsonc`** with **`send_email`** — see [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/).

## Flow in code

1. **`src/pages/api/contact.ts`** uses **`env.SEND_EMAIL`** (from Wrangler’s `send_email` binding at deploy time).
2. **`src/utils/cloudflareEmail.ts`** builds the MIME message and calls **`binding.send()`**.

## Wrangler: `send_email`

This repo declares:

```jsonc
"send_email": [{ "name": "SEND_EMAIL" }]
```

Optional fields (same docs): `destination_address`, `allowed_destination_addresses`, etc.

## Zone: Email Routing

1. **Email** → **Email Routing** on your domain — enable it.
2. **Destination addresses** — verify your inbox.
3. **Routing rules** — e.g. `contact@…` → your inbox.
4. **DNS** — MX / records as Email Routing requires.

**From** in code: `noreply@…` on that zone. **To**: `OWNER_EMAIL` or `contact@bioniclecollective.com` (verified destinations).

## “Service binding” is not email

**Service binding** calls another **Worker**. It does not send mail via Email Routing.

## Git-based Pages vs Wrangler

Some **Cloudflare Pages** pipelines validate **`wrangler.jsonc`** and error with:

`Configuration file for Pages projects does not support "send_email"`

That is a **Pages + Git** limitation on their side. Options that stay on **Wrangler**:

- Deploy with **`npm run deploy`** (`astro build && wrangler pages deploy`) so your local Wrangler uploads the project with the same **`wrangler.jsonc`** (behavior depends on current Wrangler/Cloudflare).
- Or run **`wrangler pages deploy`** from CI with your API token, still using this repo’s **`wrangler.jsonc`**.

If the hosted Git integration keeps rejecting the file, open a ticket with Cloudflare or use a deploy path that applies **`send_email`** without that validator.

## References

- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
