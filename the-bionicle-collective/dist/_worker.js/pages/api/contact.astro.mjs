globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as checkRateLimitContact } from '../../chunks/rateLimitR2_B0zxt9YQ.mjs';
import { EmailMessage } from 'cloudflare:email';
export { renderers } from '../../renderers.mjs';

function headerSafe(value) {
  return value.replace(/[\r\n]/g, " ").trim();
}
function buildPlainTextMime(options) {
  const fromName = headerSafe(options.fromName) || "The Bionicle Collective";
  const from = headerSafe(options.from);
  const to = headerSafe(options.to);
  const replyTo = headerSafe(options.replyTo);
  const subject = headerSafe(options.subject);
  const fromHeader = `"${fromName.replace(/"/g, "")}" <${from}>`;
  const lines = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    options.text
  ];
  return lines.join("\r\n");
}
async function sendContactEmailViaCloudflare(options) {
  const { binding, from, to } = options;
  if (!binding) {
    return { ok: false, error: "Email binding (SEND_EMAIL) is not configured" };
  }
  const raw = buildPlainTextMime(options);
  try {
    const message = new EmailMessage(from, to, raw);
    await binding.send(message);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Cloudflare Email send failed:", msg);
    return { ok: false, error: msg };
  }
}

const MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";
async function sendEmailViaMailChannels(options) {
  const { to, from, fromName, replyTo, subject, text, apiKey } = options;
  const headers = { "Content-Type": "application/json" };
  if (apiKey && apiKey.trim() !== "") {
    headers["X-Api-Key"] = apiKey.trim();
  }
  const res = await fetch(MAILCHANNELS_API, {
    method: "POST",
    headers,
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          headers: { "Reply-To": replyTo }
        }
      ],
      from: { email: from, name: fromName },
      mailfrom: { email: from, name: fromName },
      subject,
      content: [{ type: "text/plain", value: text }]
    })
  });
  if (res.ok) {
    return { ok: true };
  }
  const errText = await res.text();
  console.error("MailChannels API error:", res.status, errText);
  return { ok: false, error: errText };
}

const prerender = false;
const CONTACT_EMAIL = "contact@bioniclecollective.com";
const FROM_EMAIL = "noreply@bioniclecollective.com";
function getEnv(locals) {
  return locals.runtime?.env ?? {};
}
const POST = async ({ request, locals }) => {
  const env = getEnv(locals);
  const ownerEmail = env.OWNER_EMAIL ?? CONTACT_EMAIL;
  const sendEmailBinding = env.SEND_EMAIL;
  const mailchannelsKey = env.MAILCHANNELS_API_KEY?.trim();
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  const bucket = env.BIONICLE_COLLECTION;
  const rateOk = await checkRateLimitContact(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "Contact from The Bionicle Collective").trim();
  const message = String(body?.message ?? "").trim();
  if (!email || !message) {
    return new Response(
      JSON.stringify({ error: "Email and message are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: "Please enter a valid email address" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const fromName = name || "Anonymous";
  const emailBody = `You received a message from the Community page:

From: ${fromName} <${email}>
Subject: ${subject}

---

${message}`;
  const payload = {
    to: ownerEmail,
    from: FROM_EMAIL,
    fromName: "The Bionicle Collective",
    replyTo: email,
    subject: `[Community] ${subject}`,
    text: emailBody
  };
  if (sendEmailBinding) {
    const cf = await sendContactEmailViaCloudflare({ binding: sendEmailBinding, ...payload });
    if (cf.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: "Message sent successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Cloudflare email send failed:", cf.error);
  }
  if (mailchannelsKey) {
    const mc = await sendEmailViaMailChannels({ ...payload, apiKey: mailchannelsKey });
    if (mc.ok) {
      return new Response(
        JSON.stringify({ ok: true, message: "Message sent successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("MailChannels fallback failed:", mc.error);
  }
  if (!sendEmailBinding && !mailchannelsKey) {
    return new Response(
      JSON.stringify({
        error: "Email is not configured: add send_email named SEND_EMAIL in wrangler.jsonc (see docs/DEPLOY-CLOUDFLARE-GIT.md), or set MAILCHANNELS_API_KEY as optional fallback.",
        code: "EMAIL_NOT_CONFIGURED"
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(
    JSON.stringify({
      error: "Failed to send message. Please try again later.",
      code: "EMAIL_SEND_FAILED",
      hint: "Check Workers logs and wrangler.jsonc send_email. Set OWNER_EMAIL to a verified Email Routing destination if sends are rejected."
    }),
    { status: 502, headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
