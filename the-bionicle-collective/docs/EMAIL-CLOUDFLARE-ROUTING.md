# Contact form email (Cloudflare Email Routing)

The Community page contact form sends mail through **Cloudflare Email Routing’s “Send emails from Workers”** feature — no MailChannels, no third-party API keys.

## What you need

1. **Email Routing** enabled on `bioniclecollective.com` with at least one [verified destination address](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/#destination-addresses).
2. A **routing rule** so the address you send **to** (default: `contact@bioniclecollective.com`) forwards to your inbox.
3. A **`send_email` binding** named **`SEND_EMAIL`** on the Worker/Pages project (see below).

## Binding name: `SEND_EMAIL`

The API route reads `env.SEND_EMAIL` and calls `.send()` with an `EmailMessage` from `cloudflare:email`.

### If you deploy with Wrangler (`wrangler deploy`)

`wrangler.jsonc` in this repo includes:

```jsonc
"send_email": [{ "name": "SEND_EMAIL" }]
```

Adjust or add `destination_address` / `allowed_destination_addresses` if Cloudflare requires a stricter binding for your account.

### If you use Cloudflare Pages (Git or dashboard builds)

**Workers & Pages → your project → Settings → Functions** (or **Build** → **Email** / **Email Service**, depending on UI):

- Add a **Send email** binding.
- **Variable name:** `SEND_EMAIL` (must match the code).

Redeploy after adding or changing bindings.

## Environment variables

- **`OWNER_EMAIL`** (optional): Recipient for contact messages. Defaults to `contact@bioniclecollective.com`.

For local dev with `wrangler pages dev`, use `.dev.vars` if needed:

```
OWNER_EMAIL=contact@bioniclecollective.com
```

## From / To addresses

- **From:** `noreply@bioniclecollective.com` (must be on the zone where Email Routing is active).
- **Reply-To:** the visitor’s email (set in the raw MIME), so you can reply from your client.
- **To:** `OWNER_EMAIL` or `contact@bioniclecollective.com`.

## References

- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
