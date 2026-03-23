globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead, p as renderScript } from '../chunks/astro/server_DPDpufRN.mjs';
import { $ as $$Layout } from '../chunks/Layout_DcLzPPtX.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Community | The Bionicle Collective", "description": "Contact the collector and suggest items to add to the site." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="community-page"> <h1>Community</h1> <p class="community-intro">
Get in touch with the collector or suggest items you'd like to see added to The Bionicle Collective.
</p> <section class="community-section" aria-labelledby="contact-heading"> <h2 id="contact-heading">Contact</h2> <p class="section-desc">Send me a private message! Your message will be forwarded via email.</p> <form id="contact-form" class="community-form"> <div class="form-row"> <label for="contact-name">Name</label> <input id="contact-name" name="name" type="text" required placeholder="Your name" autocomplete="name"> </div> <div class="form-row"> <label for="contact-email">Email</label> <input id="contact-email" name="email" type="email" required placeholder="your@email.com" autocomplete="email"> </div> <div class="form-row"> <label for="contact-subject">Subject</label> <select id="contact-subject" name="subject"> <option value="General inquiry">General inquiry</option> <option value="Collection question">Collection question</option> <option value="Other">Other</option> </select> </div> <div class="form-row"> <label for="contact-message">Message</label> <textarea id="contact-message" name="message" required rows="5" placeholder="Your message..." maxlength="2000"></textarea> </div> <div class="form-actions"> <button type="submit" class="button-primary">Send message</button> <span id="contact-status" class="form-status" aria-live="polite"></span> </div> </form> </section> <section class="community-section" aria-labelledby="suggestions-heading"> <h2 id="suggestions-heading">Suggestions</h2> <p class="section-desc">Recommend sets, masks, or other items to add to the site. Community members can upvote or downvote ideas.</p> <form id="suggestion-form" class="community-form"> <div class="form-row"> <label for="suggestion-title">Title</label> <input id="suggestion-title" name="title" type="text" required placeholder="e.g. Add 2005 Visorak" maxlength="100"> </div> <div class="form-row"> <label for="suggestion-description">Description (optional)</label> <textarea id="suggestion-description" name="description" rows="3" placeholder="Why should this be added?" maxlength="500"></textarea> </div> <div class="form-row"> <label for="suggestion-name">Your name (optional, for credit)</label> <input id="suggestion-name" name="submitterName" type="text" placeholder="Anonymous" maxlength="60"> </div> <div class="form-actions"> <button type="submit" class="button-primary">Submit suggestion</button> <span id="suggestion-status" class="form-status" aria-live="polite"></span> </div> </form> <div id="suggestions-list" class="suggestions-list"> <p class="loading-msg">Loading suggestions...</p> </div> </section> </div> ${renderScript($$result2, "/Users/ethan/Development/the-bionicle-collective/src/pages/community/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/ethan/Development/the-bionicle-collective/src/pages/community/index.astro", void 0);

const $$file = "/Users/ethan/Development/the-bionicle-collective/src/pages/community/index.astro";
const $$url = "/community";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
