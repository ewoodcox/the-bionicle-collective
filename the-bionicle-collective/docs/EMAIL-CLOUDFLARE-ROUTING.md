# Contact form email (Cloudflare Email Routing)

The Community page can send mail through **Cloudflare Email Routing’s “Send emails from Workers”** API (`cloudflare:email` + `send_email` binding). Optional **`MAILCHANNELS_API_KEY`** is a fallback.

## What you need

1. **Email Routing** enabled on `bioniclecollective.com` with at least one [verified destination address](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#destination-addresses).
2. A **routing rule** so the address you send **to** (default: `contact@bioniclecollective.com`) forwards to your inbox.
3. A **`send_email` binding** named **`SEND_EMAIL`** — configured in **Wrangler**, not via the “Add binding” UI (see below).

## Important: there is no “Send email” dashboard binding (Email Routing)

Cloudflare’s **[Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)** list KV, R2, D1, Queues, etc. — **they do not include `send_email`**.

For **Email Routing** outbound send, the official flow is: **declare the binding in your Wrangler file**. See **[Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)** (Wrangler examples only).

The separate **Cloudflare Email Service** (beta / new product) may appear under **Build** with different setup — that is **not** the same as the Email Routing `send_email` + `EmailMessage` flow used in this repo.

## How to set up `SEND_EMAIL`

`wrangler.jsonc` includes:

```jsonc
"send_email": [{ "name": "SEND_EMAIL" }]
```

This repo uses **`pages_build_output_dir`** for **Cloudflare Pages** (Git deploys apply the file automatically). You do **not** have to run Wrangler locally—see **`docs/DEPLOY-CLOUDFLARE-GIT.md`**.

Optional manual deploy: `npm run deploy` → `astro build && wrangler pages deploy`.

### Optional tightening

If Cloudflare rejects recipients, add restrictions in Wrangler per [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/) — e.g. `destination_address` or `allowed_destination_addresses`.

## Environment variables

- **`OWNER_EMAIL`** (optional): Recipient. Defaults to `contact@bioniclecollective.com`. If send fails, try a **verified** Gmail address.

## From / To addresses

- **From:** `noreply@bioniclecollective.com` (on the zone where Email Routing is active).
- **Reply-To:** visitor’s email (in the MIME body).
- **To:** `OWNER_EMAIL` or `contact@bioniclecollective.com`.

## Troubleshooting (502 / “Failed to send”)

1. **Binding never deployed** — Confirm **Git → Pages** uses `wrangler.jsonc` as [source of truth](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) and that `send_email` is in that file.
2. **Recipient not allowed** — Set **`OWNER_EMAIL`** to a verified destination.
3. **Fallback** — Set **`MAILCHANNELS_API_KEY`** in the project environment.

## References

- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- [Pages Functions Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/) (note: no `send_email` in the dashboard list)
