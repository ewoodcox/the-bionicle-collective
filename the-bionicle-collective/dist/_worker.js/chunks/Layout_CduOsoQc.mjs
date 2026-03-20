globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, h as addAttribute, p as renderHead, o as renderScript, q as renderSlot, r as renderTemplate } from './astro/server_DXfHa-2P.mjs';
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

const $$Astro = createAstro("https://bioniclecollective.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = site.name, description = site.description } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description"${addAttribute(description, "content")}><title>${title}</title><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"><link rel="manifest" href="/site.webmanifest">${renderHead()}</head> <body> <header class="site-header"> <a href="/" class="logo"> <img src="/TBC%20logo%20for%20site.png"${addAttribute(site.name, "alt")} class="logo-image"> </a> <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false"> <span></span> <span></span> <span></span> </button> <nav class="site-nav" id="site-nav"> <a href="/">Home</a> <a href="/collection/">Collection</a> <a href="/community/">Community</a> <a href="/api/admin/logout" class="nav-logout" id="nav-logout" hidden>Log out</a> </nav> </header> ${renderScript($$result, "/Users/ethan/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} <main class="main"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="site-footer"> <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${site.name}</p> <div class="social"> <a${addAttribute(social.youtube, "href")} target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a> <a${addAttribute(social.facebook, "href")} target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a> <a${addAttribute(social.instagram, "href")} target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a> <a${addAttribute(social.bluesky, "href")} target="_blank" rel="noopener noreferrer" aria-label="Bluesky">Bluesky</a> </div> </footer> </body></html>`;
}, "/Users/ethan/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/layouts/Layout.astro", void 0);

export { $$Layout as $, site as s };
