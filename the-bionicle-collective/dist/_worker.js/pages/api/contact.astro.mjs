globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as checkRateLimitContact } from '../../chunks/rateLimitR2_BHQfaWfr.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const RESEND_API = "https://api.resend.com/emails";
function getEnv(locals) {
  return locals.runtime?.env ?? {};
}
const POST = async ({ request, locals }) => {
  const env = getEnv(locals);
  const apiKey = env.RESEND_API_KEY;
  const ownerEmail = env.OWNER_EMAIL;
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";
  const bucket = env.BIONICLE_COLLECTION;
  const rateOk = await checkRateLimitContact(bucket, ip);
  if (!rateOk) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!apiKey || !ownerEmail) {
    return new Response(
      JSON.stringify({ error: "Contact form is not configured. Please try again later." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
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
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "The Bionicle Collective <onboarding@resend.dev>",
      to: [ownerEmail],
      reply_to: email,
      subject: `[Community] ${subject}`,
      text: emailBody
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend API error:", res.status, err);
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
