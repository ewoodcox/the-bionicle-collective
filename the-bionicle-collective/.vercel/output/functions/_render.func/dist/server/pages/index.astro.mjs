import { f as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BvAlusQI.mjs';
import 'piccolore';
import { $ as $$Layout, s as site } from '../chunks/Layout_DOM7oFkn.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": site.name, "description": site.description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="home-page"> <h1 class="site-title">${site.name}</h1> <h2 class="home-about-heading">About</h2> <hr class="home-about-divider"> <p class="home-description">${site.description}</p> <p class="home-cta"> <a href="/collection/" class="button-primary">View the collection</a> </p> </div> ` })}`;
}, "/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/index.astro", void 0);

const $$file = "/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
