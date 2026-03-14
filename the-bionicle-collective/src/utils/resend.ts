import { Resend } from 'resend';

/**
 * Create a Resend client for sending emails.
 * Pass the API key from your environment (e.g. RESEND_API_KEY from .dev.vars or wrangler secret).
 *
 * Replace `re_xxxxxxxxx` with your real API key in .dev.vars for local dev,
 * and use `wrangler secret put RESEND_API_KEY` for production.
 */
export function createResendClient(apiKey: string) {
  return new Resend(apiKey);
}
