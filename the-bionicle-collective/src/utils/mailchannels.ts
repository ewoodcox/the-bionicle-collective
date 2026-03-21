/**
 * Optional fallback: MailChannels HTTP API (when Cloudflare SEND_EMAIL is unavailable).
 * Set MAILCHANNELS_API_KEY in the dashboard, or use Domain Lockdown without a key (see MailChannels docs).
 */

const MAILCHANNELS_API = 'https://api.mailchannels.net/tx/v1/send';

export interface SendEmailOptions {
  to: string;
  from: string;
  fromName: string;
  replyTo: string;
  subject: string;
  text: string;
  apiKey?: string;
}

export async function sendEmailViaMailChannels(options: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const { to, from, fromName, replyTo, subject, text, apiKey } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey && apiKey.trim() !== '') {
    headers['X-Api-Key'] = apiKey.trim();
  }

  const res = await fetch(MAILCHANNELS_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          headers: { 'Reply-To': replyTo },
        },
      ],
      from: { email: from, name: fromName },
      mailfrom: { email: from, name: fromName },
      subject,
      content: [{ type: 'text/plain', value: text }],
    }),
  });

  if (res.ok) {
    return { ok: true };
  }
  const errText = await res.text();
  console.error('MailChannels API error:', res.status, errText);
  return { ok: false, error: errText };
}
