import { checkRateLimitContact } from '../../utils/rateLimitR2';
import {
  sendContactEmailViaCloudflare,
  sendContactEmailViaWorkerHttp,
} from '../../utils/cloudflareEmail';

export const prerender = false;

const CONTACT_EMAIL = 'contact@bioniclecollective.com';
const FROM_EMAIL = 'noreply@bioniclecollective.com';

type Env = {
  OWNER_EMAIL?: string;
  /** Present only if `send_email` is bound (not available in Pages Git + wrangler.jsonc) */
  SEND_EMAIL?: { send: (message: unknown) => Promise<void> };
  /** Separate Worker URL (e.g. https://the-bionicle-email-worker.<subdomain>.workers.dev) */
  EMAIL_WORKER_URL?: string;
  /** Optional; must match the email Worker’s `EMAIL_WORKER_SECRET` */
  EMAIL_WORKER_SECRET?: string;
  BIONICLE_COLLECTION?: any;
};

function getEnv(locals: any): Env {
  return (locals as { runtime?: { env?: Env } }).runtime?.env ?? {};
}

export const POST = async ({ request, locals }: any) => {
  const env = getEnv(locals);
  const ownerEmail = env.OWNER_EMAIL ?? CONTACT_EMAIL;
  const sendEmailBinding = env.SEND_EMAIL;
  const emailWorkerUrl = env.EMAIL_WORKER_URL?.trim();

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
    return new Response(
      JSON.stringify({
        error: 'Failed to send message. Please try again later.',
        code: 'EMAIL_SEND_FAILED',
        hint: cf.error,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (emailWorkerUrl) {
    const via = await sendContactEmailViaWorkerHttp({
      workerUrl: emailWorkerUrl,
      secret: env.EMAIL_WORKER_SECRET,
      ...payload,
    });
    if (via.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Message sent successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Email worker HTTP send failed:', via.error);
    return new Response(
      JSON.stringify({
        error: 'Failed to send message. Please try again later.',
        code: 'EMAIL_SEND_FAILED',
        hint: via.error,
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      error:
        'Email is not configured: set EMAIL_WORKER_URL (and optional EMAIL_WORKER_SECRET) to your the-bionicle-email-worker URL in Pages → Settings → Environment variables. Pages cannot use send_email in wrangler.jsonc — see docs/DEPLOY-CLOUDFLARE-GIT.md.',
      code: 'EMAIL_NOT_CONFIGURED',
    }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
};
