import { checkRateLimitContact } from '../../utils/rateLimitR2';
import { sendContactEmailViaCloudflare } from '../../utils/cloudflareEmail';
import { sendEmailViaMailChannels } from '../../utils/mailchannels';

export const prerender = false;

const CONTACT_EMAIL = 'contact@bioniclecollective.com';
const FROM_EMAIL = 'noreply@bioniclecollective.com';

type Env = {
  OWNER_EMAIL?: string;
  /** Cloudflare send_email binding — from wrangler.jsonc `send_email` or dashboard */
  SEND_EMAIL?: { send: (message: unknown) => Promise<void> };
  /** Optional fallback if SEND_EMAIL is missing or rejects the message */
  MAILCHANNELS_API_KEY?: string;
  BIONICLE_COLLECTION?: any;
};

function getEnv(locals: any): Env {
  return (locals as { runtime?: { env?: Env } }).runtime?.env ?? {};
}

export const POST = async ({ request, locals }: any) => {
  const env = getEnv(locals);
  const ownerEmail = env.OWNER_EMAIL ?? CONTACT_EMAIL;
  const sendEmailBinding = env.SEND_EMAIL;
  const mailchannelsKey = env.MAILCHANNELS_API_KEY?.trim();

  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
  const bucket = env.BIONICLE_COLLECTION;
  const rateOk = await checkRateLimitContact(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const subject = String(body?.subject ?? 'Contact from The Bionicle Collective').trim();
  const message = String(body?.message ?? '').trim();

  if (!email || !message) {
    return new Response(
      JSON.stringify({ error: 'Email and message are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid email address' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const fromName = name || 'Anonymous';
  const emailBody = `You received a message from the Community page:\n\nFrom: ${fromName} <${email}>\nSubject: ${subject}\n\n---\n\n${message}`;

  const payload = {
    to: ownerEmail,
    from: FROM_EMAIL,
    fromName: 'The Bionicle Collective',
    replyTo: email,
    subject: `[Community] ${subject}`,
    text: emailBody,
  };

  if (sendEmailBinding) {
    const cf = await sendContactEmailViaCloudflare({ binding: sendEmailBinding, ...payload });
    if (cf.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Message sent successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Cloudflare email send failed:', cf.error);
  }

  if (mailchannelsKey) {
    const mc = await sendEmailViaMailChannels({ ...payload, apiKey: mailchannelsKey });
    if (mc.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Message sent successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('MailChannels fallback failed:', mc.error);
  }

  if (!sendEmailBinding && !mailchannelsKey) {
    return new Response(
      JSON.stringify({
        error:
          'Email is not configured: add send_email named SEND_EMAIL in wrangler.jsonc (see docs/DEPLOY-CLOUDFLARE-GIT.md), or set MAILCHANNELS_API_KEY as optional fallback.',
        code: 'EMAIL_NOT_CONFIGURED',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      error: 'Failed to send message. Please try again later.',
      code: 'EMAIL_SEND_FAILED',
      hint:
        'Check Workers logs and wrangler.jsonc send_email. Set OWNER_EMAIL to a verified Email Routing destination if sends are rejected.',
    }),
    { status: 502, headers: { 'Content-Type': 'application/json' } }
  );

};
