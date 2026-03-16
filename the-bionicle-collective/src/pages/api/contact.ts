/// <reference types="@cloudflare/workers-types" />
import type { APIRoute } from 'astro';
import { checkRateLimitContact } from '../../utils/rateLimitR2';
import { sendEmailViaMailChannels } from '../../utils/mailchannels';

export const prerender = false;

const CONTACT_EMAIL = 'contact@bioniclecollective.com';
const FROM_EMAIL = 'noreply@bioniclecollective.com';

type Env = { OWNER_EMAIL?: string; BIONICLE_COLLECTION?: R2Bucket };

function getEnv(locals: App.Locals): Env {
  return (locals as { runtime?: { env?: Env } }).runtime?.env ?? {};
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv(locals);
  const ownerEmail = env.OWNER_EMAIL ?? CONTACT_EMAIL;

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

  const { ok, error } = await sendEmailViaMailChannels({
    to: ownerEmail,
    from: FROM_EMAIL,
    fromName: 'The Bionicle Collective',
    replyTo: email,
    subject: `[Community] ${subject}`,
    text: emailBody,
  });

  if (!ok) {
    console.error('MailChannels send failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message. Please try again later.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, message: 'Message sent successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
