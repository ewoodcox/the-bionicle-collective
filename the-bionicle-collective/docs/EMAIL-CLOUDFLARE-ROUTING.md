# Contact form email (Cloudflare Email Routing only)

The Community page sends mail with **`cloudflare:email`** and the **`SEND_EMAIL`** binding declared in **`wrangler.jsonc`**. You do **not** need MailChannels for this path.

## Flow in code

1. **`src/pages/api/contact.ts`** uses **`env.SEND_EMAIL`** (from `send_email` in `wrangler.jsonc` or an equivalent dashboard binding).
2. **`src/utils/cloudflareEmail.ts`** builds a MIME message and calls the binding’s **`send()`** method.

Optional **`MAILCHANNELS_API_KEY`** in the environment is only a **fallback** if Cloudflare send fails or the binding is missing—you can leave it unset.

## 1. Wrangler: `send_email`

In **`wrangler.jsonc`** (this repo):

```jsonc
"send_email": [{ "name": "SEND_EMAIL" }]
```

Per [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/), you can add **`destination_address`** or **`allowed_destination_addresses`** if you want stricter limits.

## 2. Cloudflare dashboard — Email Routing (zone)

1. Select zone **`bioniclecollective.com`** (your domain).
2. **Email** → **Email Routing** → enable if needed.
3. **Destination addresses** → add your real inbox → **verify** the confirmation email.
4. **Routing rules** → create **`contact@bioniclecollective.com`** (or your chosen address) → forward to that verified destination.
5. Fix **DNS** (MX, etc.) as Email Routing prompts.

The **From** address in code is **`noreply@bioniclecollective.com`** (must be on a domain where Email Routing is active). **To** defaults to **`contact@bioniclecollective.com`**; override with **`OWNER_EMAIL`** if you need a different **verified** destination.

## 3. Pages project settings

1. **Workers & Pages** → your **Pages** project.
2. **Settings** → enable **Wrangler configuration** from the repo → **`wrangler.jsonc`** (path = app root in the repo).
3. **Environment variables** (optional):
   - **`OWNER_EMAIL`** — recipient; must be allowed by Email Routing (often a **verified** destination).

## 4. Local development

- **`npx wrangler login`**
- Build and run against Workers/Pages dev as you usually do; bindings come from **`wrangler.jsonc`** and **`.dev.vars`** (secrets), not from MailChannels.

## 5. Deploy

- **Git push** (Cloudflare build applies `wrangler.jsonc`), or  
- **`npm run deploy`** (`astro build && wrangler pages deploy`) from the project folder.

### If the Pages build rejects `send_email` in the file

See **`docs/DEPLOY-CLOUDFLARE-GIT.md`** section **“If Git build fails on send_email”** (dashboard-only binding or CLI deploy).

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| 503 `EMAIL_NOT_CONFIGURED` | Binding missing — check **`wrangler.jsonc`**, redeploy, or add **Send email** → **`SEND_EMAIL`** in **Settings → Bindings** if the UI offers it. |
| Send rejected / invalid recipient | Set **`OWNER_EMAIL`** to a **verified** destination from Email Routing. |
| Inbound works, outbound fails | Confirm **Email Routing** “send from Workers” is available for your zone; re-check [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/). |

## References

- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
