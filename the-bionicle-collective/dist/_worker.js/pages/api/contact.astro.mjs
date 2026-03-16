globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as checkRateLimitContact } from '../../chunks/rateLimitR2_B0zxt9YQ.mjs';
export { renderers } from '../../renderers.mjs';

const MAILCHANNELS_API = "https://api.mailchannels.net/tx/v1/send";
async function sendEmailViaMailChannels(options) {
  const { to, from, fromName, replyTo, subject, text } = options;
  const res = await fetch(MAILCHANNELS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          headers: { "Reply-To": replyTo }
        }
      ],
      from: { email: from, name: fromName },
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
  const { ok, error } = await sendEmailViaMailChannels({
    to: ownerEmail,
    from: FROM_EMAIL,
    fromName: "The Bionicle Collective",
    replyTo: email,
    subject: `[Community] ${subject}`,
    text: emailBody
  });
  if (!ok) {
    console.error("MailChannels send failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message. Please try again later." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
  return new Response(
    JSON.stringify({ ok: true, message: "Message sent successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
