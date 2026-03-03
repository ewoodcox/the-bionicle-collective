import { e as createAstro, f as createComponent, h as addAttribute, p as renderHead, q as renderSlot, r as renderTemplate } from './astro/server_BvAlusQI.mjs';
import 'piccolore';
import 'clsx';
/* empty css                        */

const site = {
  name: "The Bionicle Collective",
  description: "Welcome to The Bionicle Collective. The site where you can browse through my personal collection of the LEGO theme: BIONICLE. Based in Utah, USA, The Bionicle Collective is one of the largest collections of BIONICLE sets and accessories. I started playing with Bionicle back in 2003, and decided to start a collection in 2010 once Generation 1 ended, and I realized I have over 100 sets already. Today, The Bionicle Collective consists of over 300 sets, collectibles, and custom models."
};
const social = {
  youtube: "https://youtube.com/@bioniclecollective",
  instagram: "https://instagram.com/bioniclecollective",
  bluesky: "https://bsky.app/profile/lumberingstill.bsky.social"
};

const $$Astro = createAstro("https://thebioniclecollective.example.com");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = site.name, description = site.description } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description"${addAttribute(description, "content")}><title>${title}</title>${renderHead()}</head> <body> <header class="site-header"> <a href="/" class="logo">${site.name}</a> <nav> <a href="/">Home</a> <a href="/collection/">Collection</a> </nav> </header> <main class="main"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="site-footer"> <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${site.name}</p> <div class="social"> <a${addAttribute(social.youtube, "href")} target="_blank" rel="noopener noreferrer" aria-label="YouTube">YouTube</a> <a${addAttribute(social.facebook, "href")} target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a> <a${addAttribute(social.instagram, "href")} target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a> <a${addAttribute(social.bluesky, "href")} target="_blank" rel="noopener noreferrer" aria-label="Bluesky">Bluesky</a> </div> </footer> </body></html>`;
}, "/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/layouts/Layout.astro", void 0);

export { $$Layout as $, site as s };
