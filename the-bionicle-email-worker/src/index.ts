/// <reference types="@cloudflare/workers-types" />

/**
 * The Bionicle Collective — Email Worker
 *
 * Accepts POST { from, to, raw } from the Pages site and sends via
 * Cloudflare Email Routing's send_email binding.
 *
 * Required env vars (set in Cloudflare dashboard → Workers → Settings):
 *   EMAIL_WORKER_SECRET  — must match the Pages site's EMAIL_WORKER_SECRET
 */

import { EmailMessage } from 'cloudflare:email';

interface Env {
  SEND_EMAIL: { send: (message: EmailMessage) => Promise<void> };
  EMAIL_WORKER_SECRET?: string;
}

interface EmailPayload {
  from?: string;
  to?: string;
  raw?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Validate secret if configured
    const secret = env.EMAIL_WORKER_SECRET?.trim();
    if (secret) {
      const provided = request.headers.get('X-Email-Worker-Secret')?.trim();
      if (provided !== secret) {
        return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    let payload: EmailPayload;
    try {
      payload = (await request.json()) as EmailPayload;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { from, to, raw } = payload;
    if (!from || !to || !raw) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing from, to, or raw fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      const message = new EmailMessage(from, to, raw);
      await env.SEND_EMAIL.send(message);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Email send failed:', msg);
      return new Response(JSON.stringify({ ok: false, error: msg }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
