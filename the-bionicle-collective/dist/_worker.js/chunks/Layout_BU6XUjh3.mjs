globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, r as renderTemplate, p as renderHead, o as renderScript, q as renderSlot, l as renderComponent } from './astro/server_DXfHa-2P.mjs';
/* empty css                        */

const site = {
  name: "The Bionicle Collective",
  description: `Welcome to The Bionicle Collective — a growing archive dedicated to preserving the legacy of LEGO’s BIONICLE theme.
  
  Based in Utah, USA, this collection began with a simple realization: after starting in 2003 and continuing through the end of Generation 1, I had already accumulated over 100 sets. In 2010, I made the decision to intentionally grow and preserve the collection rather than let it fade into nostalgia.
  
  Today, The Bionicle Collective includes over 300 sets, rare collectibles, sealed products, promotional items, and custom MOCs spanning both Generation 1 and Generation 2.
  
  But this project goes beyond collecting.
  
  Through retrospectives and year-focused deep dives, I explore the history, design evolution, storytelling, and cultural impact of BIONICLE — preserving not just the sets, but the era itself.
  
  Whether you're a longtime collector, a casual fan rediscovering your childhood, or someone exploring BIONICLE for the first time, this site is here to celebrate one of LEGO’s boldest experiments in serialized storytelling.
  
  The legend lives on.
  `
};
const social = {
  youtube: "https://youtube.com/@bioniclecollective",
  facebook: "https://facebook.com/bioniclecollective",
  instagram: "https://instagram.com/bioniclecollective",
  bluesky: "https://bsky.app/profile/lumberingstill.bsky.social"
};

const $$Astro$1 = createAstro("https://bioniclecollective.com");
const $$SocialMediaIcons = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SocialMediaIcons;
  const { variant = "footer" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav${addAttribute(["social-icons", variant === "home" && "social-icons--home"], "class:list")} aria-label="Social media"> <a${addAttribute(social.youtube, "href")} target="_blank" rel="noopener noreferrer" class="social-icons__link" aria-label="YouTube"> <svg class="social-icons__svg" viewBox="0 0 24 24" aria-hidden="true"> <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path> </svg> </a> <a${addAttribute(social.facebook, "href")} target="_blank" rel="noopener noreferrer" class="social-icons__link" aria-label="Facebook"> <svg class="social-icons__svg" viewBox="0 0 24 24" aria-hidden="true"> <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path> </svg> </a> <a${addAttribute(social.instagram, "href")} target="_blank" rel="noopener noreferrer" class="social-icons__link" aria-label="Instagram"> <svg class="social-icons__svg" viewBox="0 0 24 24" aria-hidden="true"> <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path> </svg> </a> <a${addAttribute(social.bluesky, "href")} target="_blank" rel="noopener noreferrer" class="social-icons__link" aria-label="Bluesky"> <svg class="social-icons__svg" viewBox="0 0 24 24" aria-hidden="true"> <path fill="currentColor" d="M12 11.2c-1.2-2.1-3.9-5.4-6.2-7.1-1.9-1.4-3.1-1.1-3.7-.8-.6.3-1.1 1.2-1.1 1.8 0 .7.4 4.9.6 5.6.7 2.4 3.2 3.2 5.5 2.7.7-.15 1.8-.55 2.9-1.2 1.1.65 2.2 1.05 2.9 1.2 2.3.5 4.8-.3 5.5-2.7.2-.7.6-4.9.6-5.6 0-.6-.5-1.5-1.1-1.8-.6-.3-1.8-.6-3.7.8-2.3 1.7-5 5-6.2 7.1z"></path> <path fill="currentColor" d="M12 12.8c1.2 2.1 3.9 5.4 6.2 7.1 1.9 1.4 3.1 1.1 3.7.8.6-.3 1.1-1.2 1.1-1.8 0-.7-.4-4.9-.6-5.6-.7-2.4-3.2-3.2-5.5-2.7-.7.15-1.8.55-2.9 1.2-1.1-.65-2.2-1.05-2.9-1.2-2.3-.5-4.8.3-5.5 2.7-.2.7-.6 4.9-.6 5.6 0 .6.5 1.5 1.1 1.8.6.3 1.8.6 3.7-.8 2.3-1.7 5-5 6.2-7.1z"></path> </svg> </a> </nav>`;
}, "/Users/ethan/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/components/SocialMediaIcons.astro", void 0);

const $$Astro = createAstro("https://bioniclecollective.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = site.name, description = site.description } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description"${addAttribute(description, "content")}><title>${title}</title><link rel="icon" type="image/png" sizes="16x16"${addAttribute(new URL("/favicon-16x16.png", Astro2.url.origin).href, "href")}><link rel="manifest" href="/site.webmanifest">${renderHead()}</head> <body> <header class="site-header"> <a href="/" class="logo"> <img src="/TBC%20logo%20for%20site.png"${addAttribute(site.name, "alt")} class="logo-image"> </a> <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"> <span></span> <span></span> <span></span> </button> <nav class="site-nav" id="site-nav"> <a href="/">Home</a> <a href="/collection/">Collection</a> <a href="/community/">Community</a> <a href="/api/admin/logout" class="nav-logout" id="nav-logout" hidden>Log out</a> </nav> </header> ${renderScript($$result, "/Users/ethan/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} <main class="main"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="site-footer"> <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${site.name}</p> ${renderComponent($$result, "SocialMediaIcons", $$SocialMediaIcons, { "variant": "footer" })} </footer> </body></html>`;
}, "/Users/ethan/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/layouts/Layout.astro", void 0);

export { $$Layout as $, $$SocialMediaIcons as a, site as s };
