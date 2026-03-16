# Migrate contact form to Cloudflare-managed email (MailChannels)

**Status:** Todo  
**Sprint:** _TBD_  
**Created:** 2025-03-15

---

## User story

**As an** average user visiting the Community page  
**I want** to send a message that gets forwarded to contact@bioniclecollective.com  
**So that** I can reach the site owner without relying on third-party email services like Resend

---

## Acceptance criteria

- [ ] Contact form on Community page successfully delivers messages to contact@bioniclecollective.com
- [ ] Email sending uses **MailChannels** (Cloudflare ecosystem), not Resend
- [ ] All email forwarding configuration is managed in **Cloudflare** (DNS, domain verification, Workers)
- [ ] Rate limiting (5/hour per IP) remains in place via existing `rateLimitR2`
- [ ] Reply-To header set to the sender's email so the owner can reply directly
- [ ] Resend dependency and `RESEND_API_KEY` env var removed from the project
- [ ] `.dev.vars` and production secrets updated for MailChannels (or no API key if using Workers + MailChannels free tier)

---

## Technical notes

### Current state
- Contact form POSTs to `/api/contact`
- Uses Resend API (`RESEND_API_KEY`, `OWNER_EMAIL`)
- Sends from `onboarding@resend.dev` (Resend's test domain) to `OWNER_EMAIL`

### Target state
- Replace Resend with **MailChannels** for sending from the Worker
- MailChannels offers free sending when the request originates from a Cloudflare Worker and DNS is configured correctly
- Domain `bioniclecollective.com` is already verified on Cloudflare for email

### Implementation approach
1. Add MailChannels sending logic to the contact API (fetch to MailChannels API or use their Workers integration)
2. Configure DNS: Add the required SPF/TXT records for MailChannels in Cloudflare
3. Use `contact@bioniclecollective.com` as the destination (or `OWNER_EMAIL` if that already points there)
4. Set From to a verified domain address (e.g. `noreply@bioniclecollective.com` or use MailChannels' relay)
5. Remove Resend package, `src/utils/resend.ts`, and `RESEND_API_KEY` from env

### References
- [MailChannels for Cloudflare Workers](https://support.mailchannels.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/) — for inbound forwarding at contact@ if needed
- `docs/DATABASE-MANAGEMENT.md` — documents Cloudflare-first email approach

---

## Dependencies

- Domain verified on Cloudflare for email ✓
- R2 bucket bound for rate limiting ✓
