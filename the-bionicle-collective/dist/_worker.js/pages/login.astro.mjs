globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead, o as renderScript } from '../chunks/astro/server_DXfHa-2P.mjs';
import { $ as $$Layout } from '../chunks/Layout_CPvPB-j_.mjs';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin login | The Bionicle Collective", "description": "Admin login for collection edits." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="login-page"> <h1>Admin login</h1> <p>Enter your admin secret to edit "In my Collection" on set pages.</p> <form id="login-form" class="login-form"> <label for="secret" class="login-label">Secret</label> <input type="password" id="secret" name="secret" class="login-input" autocomplete="current-password" required> <button type="submit" class="button-primary">Log in</button> </form> <p id="login-error" class="login-error" aria-live="polite" hidden></p> </div> ${renderScript($$result2, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/login.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/login.astro", void 0);

const $$file = "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
