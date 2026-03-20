/**
 * Send mail via Cloudflare Email Routing (Workers send_email binding).
 * Docs: https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/
 */

import { EmailMessage } from 'cloudflare:email';

/** Strip CR/LF to avoid header injection from user-controlled fields. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim();
}

export interface SendContactEmailOptions {
  /** Cloudflare send_email binding (e.g. env.SEND_EMAIL) */
  binding: { send: (message: EmailMessage) => Promise<void> } | undefined | null;
  to: string;
  from: string;
  fromName: string;
  replyTo: string;
  subject: string;
  text: string;
}

/**
 * Build a minimal RFC 5322 message (plain text) with Reply-To.
 */
export function buildPlainTextMime(options: Omit<SendContactEmailOptions, 'binding'>): string {
  const fromName = headerSafe(options.fromName) || 'The Bionicle Collective';
  const from = headerSafe(options.from);
  const to = headerSafe(options.to);
  const replyTo = headerSafe(options.replyTo);
  const subject = headerSafe(options.subject);

  const fromHeader = `"${fromName.replace(/"/g, '')}" <${from}>`;

  const lines = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    options.text,
  ];

  return lines.join('\r\n');
}

export async function sendContactEmailViaCloudflare(
  options: SendContactEmailOptions
): Promise<{ ok: boolean; error?: string }> {
  const { binding, from, to } = options;
  if (!binding) {
    return { ok: false, error: 'Email binding (SEND_EMAIL) is not configured' };
  }

  const raw = buildPlainTextMime(options);

  try {
    const message = new EmailMessage(from, to, raw);
    await binding.send(message);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Cloudflare Email send failed:', msg);
    return { ok: false, error: msg };
  }
}
