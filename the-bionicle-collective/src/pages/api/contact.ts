export const prerender = false;

// Contact email is temporarily disabled while we debug/replace the email flow.
// Keeping the endpoint avoids 404s if anything still POSTs to `/api/contact`.
export const POST = async () => {
  return new Response(
    JSON.stringify({
      error: 'Contact via email is temporarily disabled. Please use the Suggestions form instead.',
      code: 'EMAIL_DISABLED',
    }),
    { status: 410, headers: { 'Content-Type': 'application/json' } }
  );
};
