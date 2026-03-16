globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, l as renderComponent, o as renderScript, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_DXfHa-2P.mjs';
import { $ as $$Layout, s as site } from '../chunks/Layout_CNDIDl5r.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": site.name, "description": site.description }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="home-page" id="home-main"> <h1 class="site-title">${site.name}</h1> <hr class="home-about-divider"> <p class="home-description">${site.description}</p> <p class="home-cta"> <a href="/collection/" class="button-primary">View the collection</a> </p> </div>  <div class="edit-gate" id="edit-gate" hidden> <div class="edit-gate-inner"> <h1 class="site-title">${site.name}</h1> <p class="edit-gate-subtitle">Enter your key to unlock editing</p> <div id="edit-gate-status" class="edit-gate-status">Checking…</div> <form id="edit-gate-form" class="edit-gate-form" hidden> <input type="password" id="edit-gate-key" class="edit-gate-input" name="key" placeholder="Edit key" autocomplete="off" required> <button type="submit" class="button-primary">Unlock editing</button> </form> <div id="edit-gate-logged-in" class="edit-gate-logged-in" hidden> <p>You’re logged in. You can edit collection details for 2 hours.</p> <a href="/collection/" class="button-primary">Go to collection</a> <a href="/api/admin/logout" class="edit-gate-logout">Log out</a> </div> </div> </div> ` })} ${renderScript($$result, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro", void 0);

const $$file = "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
