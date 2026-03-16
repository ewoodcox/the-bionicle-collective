# Contact Form Email via MailChannels (Cloudflare)

The Community page contact form sends messages to **contact@bioniclecollective.com** using MailChannels, which integrates with Cloudflare. No Resend or other third-party API keys are required.

## Requirements

- Domain verified on Cloudflare for email
- MailChannels Domain Lockdown DNS record (see below)

## DNS: Domain Lockdown

MailChannels requires a DNS TXT record to authorize your Worker/Pages project to send from your domain.

1. **Create a TXT record** in Cloudflare DNS:
   - **Name:** `_mailchannels.bioniclecollective.com`
   - **Content:** `v=mc1 cfid=your-pages-subdomain.pages.dev`
   
   Replace `your-pages-subdomain.pages.dev` with your Cloudflare Pages project URL (e.g. `the-bionicle-collective.pages.dev`). You can find this in: Workers & Pages → your project → Overview → "Your subdomain".

2. **Note:** MailChannels deprecated free Workers sending in 2024. If Domain Lockdown with `cfid` no longer works, you may need to sign up for [MailChannels Email API](https://www.mailchannels.com/email-api/) (free tier: 100 emails/day) and use their `auth` identifier in the TXT record instead.

## Environment Variables

- **`OWNER_EMAIL`** (optional): Override the destination. Defaults to `contact@bioniclecollective.com`.
- No API key needed for Domain Lockdown approach.

For local dev, add to `.dev.vars`:
```
OWNER_EMAIL=contact@bioniclecollective.com
```

## How It Works

1. User submits the contact form on the Community page.
2. Request hits `/api/contact` (rate-limited: 5/hour per IP).
3. API calls MailChannels `https://api.mailchannels.net/tx/v1/send`.
4. Email is delivered to contact@bioniclecollective.com.
5. Reply-To header is set to the sender's email so you can reply directly.
6. Cloudflare Email Routing can forward contact@ to your real inbox if desired.

## From Address

Emails are sent from **noreply@bioniclecollective.com** (The Bionicle Collective). This address must be authorized by the Domain Lockdown record.
