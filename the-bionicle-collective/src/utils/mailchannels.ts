/**
 * Send email via MailChannels (Cloudflare ecosystem).
 * Requires Domain Lockdown DNS: _mailchannels.bioniclecollective.com TXT
 * See: https://support.mailchannels.com/hc/en-us/articles/16918954360845
 */

const MAILCHANNELS_API = 'https://api.mailchannels.net/tx/v1/send';

export interface SendEmailOptions {
  to: string;
  from: string;
  fromName: string;
  replyTo: string;
  subject: string;
  text: string;
}

export async function sendEmailViaMailChannels(options: SendEmailOptions): Promise<{ ok: boolean; error?: string }> {
  const { to, from, fromName, replyTo, subject, text } = options;

  const res = await fetch(MAILCHANNELS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          headers: { 'Reply-To': replyTo },
        },
      ],
      from: { email: from, name: fromName },
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
