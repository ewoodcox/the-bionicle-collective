# Contact form email (Pages + separate Email Worker)

**Cloudflare Pages** (Git) **cannot** put **`send_email`** in the site’s **`wrangler.jsonc`** — the build fails validation.

This repo keeps **`send_email` out** of the site config. The **contact API** sends mail by **HTTP POST** to a **separate Worker** (e.g. **`the-bionicle-email-worker`**) that declares **`send_email`** in **its own** Wrangler file.

## Flow in code

1. **`src/pages/api/contact.ts`** — if **`env.SEND_EMAIL`** exists (rare on Pages), uses **`cloudflare:email`** directly; otherwise **`EMAIL_WORKER_URL`**.
2. **`src/utils/cloudflareEmail.ts`** — **`sendContactEmailViaWorkerHttp`** POSTs `{ from, to, raw }` to the Worker; optional header **`X-Email-Worker-Secret`**.

## Pages — required env vars

| Variable | Purpose |
|----------|---------|
| **`EMAIL_WORKER_URL`** | e.g. `https://the-bionicle-email-worker.<subdomain>.workers.dev` |
| **`EMAIL_WORKER_SECRET`** | Optional; same value as on the email Worker if you lock it down |

Set under **Workers & Pages** → project → **Settings** → **Environment variables**.

## Email Worker — Wrangler

In the **email Worker** project (not this site):

```jsonc
"name": "the-bionicle-email-worker",
"send_email": [{ "name": "SEND_EMAIL" }]
```

Deploy that Worker; its `fetch` handler should accept POST JSON **`{ from, to, raw }`** (see **`sendContactEmailViaWorkerHttp`**).

## Zone: Email Routing

Enable **Email Routing**, verify **destination addresses**, configure **routing rules** and **DNS** as usual.

## References

- [Send emails from Workers](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- [Pages Functions — Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
