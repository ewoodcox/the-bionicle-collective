globalThis.process ??= {}; globalThis.process.env ??= {};
import { e as createAstro, f as createComponent, r as renderTemplate, k as defineScriptVars, l as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_DXfHa-2P.mjs';
import { $ as $$Layout } from '../../chunks/Layout_BrcL0Ql7.mjs';
import { g as getSetById, a as getSetDisplayLabel, b as getSetNumber, s as sets, c as getSetSortKey, d as getYearGroup, e as getYearsForGroup } from '../../chunks/constants_Cc7xRAlb.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://bioniclecollective.com");
function getStaticPaths() {
  return sets.map((set) => ({ params: { id: set.id } }));
}
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  function getCollectionPageOrder() {
    const byGroup = /* @__PURE__ */ new Map();
    for (const g of ["gen1", "gen2", "other"]) byGroup.set(g, []);
    for (const s of sets) {
      const year = Number(s.year);
      const group = getYearGroup(year);
      byGroup.get(group).push(s);
    }
    for (const [, list] of byGroup) list.sort((a, b) => getSetSortKey(a) - getSetSortKey(b));
    const ordered = [];
    const gen1Years = getYearsForGroup("gen1");
    const gen1Items = (byGroup.get("gen1") ?? []).filter((s) => (s.theme ?? "") !== "Combiner Models" && (s.theme ?? "") !== "Alternate Models");
    for (const y of gen1Years) {
      const yearItems = gen1Items.filter((s) => Number(s.year) === y);
      ordered.push(...yearItems);
    }
    const gen2Years = getYearsForGroup("gen2");
    const gen2Items = (byGroup.get("gen2") ?? []).filter((s) => (s.theme ?? "") !== "Combiner Models" && (s.theme ?? "") !== "Alternate Models");
    for (const y of gen2Years) {
      const yearItems = gen2Items.filter((s) => Number(s.year) === y);
      ordered.push(...yearItems);
    }
    const combiner = sets.filter((s) => (s.theme ?? "") === "Combiner Models").sort((a, b) => getSetSortKey(a) - getSetSortKey(b));
    const alternate = sets.filter((s) => (s.theme ?? "") === "Alternate Models").sort((a, b) => getSetSortKey(a) - getSetSortKey(b));
    ordered.push(...combiner, ...alternate);
    const media = sets.filter((s) => (s.theme ?? "").toLowerCase().includes("media")).sort((a, b) => getSetSortKey(a) - getSetSortKey(b));
    ordered.push(...media);
    return ordered;
  }
  const { id } = Astro2.params;
  const set = id ? getSetById(id) : null;
  if (!set) {
    return Astro2.redirect("/collection/");
  }
  const displayLabel = getSetDisplayLabel(set);
  const setNumberDisplay = getSetNumber(set);
  const orderedSets = getCollectionPageOrder();
  const currentIndex = orderedSets.findIndex((s) => s.id === set.id);
  const prevSet = currentIndex > 0 ? orderedSets[currentIndex - 1] : null;
  const nextSet = currentIndex >= 0 && currentIndex < orderedSets.length - 1 ? orderedSets[currentIndex + 1] : null;
  const url = Astro2.url;
  const genParam = url.searchParams.get("gen");
  const yearParam = url.searchParams.get("year");
  const backParams = new URLSearchParams();
  if (genParam) backParams.set("gen", genParam);
  if (yearParam) backParams.set("year", yearParam);
  const backQuery = backParams.toString();
  const backSuffix = backQuery ? `?${backQuery}` : "";
  const backHref = `/collection/${backSuffix}`;
  const prevHref = prevSet ? `/collection/${prevSet.id}/${backSuffix}` : null;
  const nextHref = nextSet ? `/collection/${nextSet.id}/${backSuffix}` : null;
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function formatAcquiredDate(acquiredDate) {
    if (!acquiredDate || acquiredDate.trim() === "") return "\u2014";
    const parts = acquiredDate.trim().split("-");
    const year = parts[0];
    const monthNum = parts[1];
    if (monthNum && monthNum.length >= 1 && monthNum.length <= 2) {
      const monthIndex = parseInt(monthNum, 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) return `${MONTH_NAMES[monthIndex]} ${year}`;
    }
    return year;
  }
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  const viewEl = document.getElementById('collection-view');\n  const formEl = document.getElementById('collection-form');\n  const editBtn = document.getElementById('collection-edit-btn');\n  const cancelBtn = document.getElementById('collection-cancel-btn');\n  const viewAcquiredDate = document.getElementById('view-acquiredDate');\n  const viewAcquiredFrom = document.getElementById('view-acquiredFrom');\n  const viewStatus = document.getElementById('view-status');\n  const viewNotes = document.getElementById('view-notes');\n  const inputAcquiredMonth = document.getElementById('input-acquiredMonth');\n  const inputAcquiredYear = document.getElementById('input-acquiredYear');\n  const inputAcquiredFrom = document.getElementById('input-acquiredFrom');\n  const inputStatus = document.getElementById('input-status');\n  const inputNotes = document.getElementById('input-notes');\n\n  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\n  const STATUS_LABELS = {\n    'new': 'New',\n    'used-complete': 'Used \\u2013 Complete',\n    'used-incomplete': 'Used \\u2013 Incomplete',\n  };\n  function formatAcquiredDateForView(acquiredDate) {\n    if (!acquiredDate || acquiredDate.trim() === '') return '\u2014';\n    const parts = acquiredDate.trim().split('-');\n    const year = parts[0];\n    const monthNum = parts[1];\n    if (monthNum && monthNum.length >= 1 && monthNum.length <= 2) {\n      const monthIndex = parseInt(monthNum, 10) - 1;\n      if (monthIndex >= 0 && monthIndex < 12) return monthNames[monthIndex] + ' ' + year;\n    }\n    return year;\n  }\n\n  function formatStatusForView(status) {\n    if (!status || status.trim() === '') return '\\u2014';\n    return STATUS_LABELS[status] || status;\n  }\n\n  const INITIAL_DATA = {\n    acquiredDate: initialAcquiredDate,\n    acquiredFrom: initialAcquiredFrom,\n    status: initialStatus,\n    notes: initialNotes,\n  };\n\n  async function fetchCollectionData() {\n    try {\n      const res = await fetch(`/api/collection/${encodeURIComponent(setId)}`);\n      if (!res.ok) return INITIAL_DATA;\n      const data = await res.json();\n      return {\n        acquiredDate: data.acquiredDate ?? '',\n        acquiredFrom: data.acquiredFrom ?? '',\n        status: data.status ?? '',\n        notes: data.notes ?? '',\n      };\n    } catch (_) {\n      return INITIAL_DATA;\n    }\n  }\n\n  function applyToView(data) {\n    const d = (v) => (v === '' ? '\u2014' : v);\n    viewAcquiredDate.textContent = formatAcquiredDateForView(data.acquiredDate);\n    viewAcquiredFrom.textContent = d(data.acquiredFrom);\n    viewStatus.textContent = formatStatusForView(data.status);\n    viewNotes.textContent = d(data.notes);\n  }\n\n  function showView() {\n    formEl.classList.add('collection-form--hidden');\n    viewEl.classList.remove('collection-view--hidden');\n  }\n\n  function showEdit() {\n    fetchCollectionData().then((data) => {\n      const ad = data.acquiredDate || '';\n      const parts = ad.split('-');\n      const y = parts[0] || '';\n      let m = (parts[1] || '').padStart(2, '0');\n      if (parseInt(m, 10) < 1 || parseInt(m, 10) > 12) m = '';\n      inputAcquiredMonth.value = m;\n      inputAcquiredYear.value = y;\n      inputAcquiredFrom.value = data.acquiredFrom;\n      inputStatus.value = data.status || '';\n      inputNotes.value = data.notes;\n      viewEl.classList.add('collection-view--hidden');\n      formEl.classList.remove('collection-form--hidden');\n      inputAcquiredMonth.focus();\n    });\n  }\n\n  function save(data) {\n    fetch(`/api/collection/${encodeURIComponent(setId)}`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(data),\n      credentials: 'include',\n    })\n      .then((res) => {\n        if (res.status === 401) {\n          window.location.href = '/?next=' + encodeURIComponent(window.location.pathname);\n          return;\n        }\n        if (!res.ok) return;\n        applyToView(data);\n        showView();\n      })\n      .catch(() => {});\n  }\n\n  const isEditHost = window.location.hostname === 'edit.bioniclecollective.com';\n  if (isEditHost) {\n    editBtn.addEventListener('click', showEdit);\n  } else {\n    const editActions = document.getElementById('collection-edit-actions');\n    if (editActions) editActions.style.display = 'none';\n  }\n\n  cancelBtn.addEventListener('click', () => {\n    showView();\n  });\n\n  formEl.addEventListener('submit', (e) => {\n    e.preventDefault();\n    const year = inputAcquiredYear.value.trim();\n    const month = inputAcquiredMonth.value.trim();\n    let acquiredDate = '';\n    if (year) acquiredDate = month ? year + '-' + month : year;\n    save({\n      acquiredDate,\n      acquiredFrom: inputAcquiredFrom.value.trim(),\n      status: inputStatus.value,\n      notes: inputNotes.value.trim(),\n    });\n  });\n\n  fetchCollectionData().then((data) => {\n    applyToView(data);\n  });\n})();<\/script>"], ["", " <script>(function(){", "\n  const viewEl = document.getElementById('collection-view');\n  const formEl = document.getElementById('collection-form');\n  const editBtn = document.getElementById('collection-edit-btn');\n  const cancelBtn = document.getElementById('collection-cancel-btn');\n  const viewAcquiredDate = document.getElementById('view-acquiredDate');\n  const viewAcquiredFrom = document.getElementById('view-acquiredFrom');\n  const viewStatus = document.getElementById('view-status');\n  const viewNotes = document.getElementById('view-notes');\n  const inputAcquiredMonth = document.getElementById('input-acquiredMonth');\n  const inputAcquiredYear = document.getElementById('input-acquiredYear');\n  const inputAcquiredFrom = document.getElementById('input-acquiredFrom');\n  const inputStatus = document.getElementById('input-status');\n  const inputNotes = document.getElementById('input-notes');\n\n  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];\n  const STATUS_LABELS = {\n    'new': 'New',\n    'used-complete': 'Used \\\\u2013 Complete',\n    'used-incomplete': 'Used \\\\u2013 Incomplete',\n  };\n  function formatAcquiredDateForView(acquiredDate) {\n    if (!acquiredDate || acquiredDate.trim() === '') return '\u2014';\n    const parts = acquiredDate.trim().split('-');\n    const year = parts[0];\n    const monthNum = parts[1];\n    if (monthNum && monthNum.length >= 1 && monthNum.length <= 2) {\n      const monthIndex = parseInt(monthNum, 10) - 1;\n      if (monthIndex >= 0 && monthIndex < 12) return monthNames[monthIndex] + ' ' + year;\n    }\n    return year;\n  }\n\n  function formatStatusForView(status) {\n    if (!status || status.trim() === '') return '\\\\u2014';\n    return STATUS_LABELS[status] || status;\n  }\n\n  const INITIAL_DATA = {\n    acquiredDate: initialAcquiredDate,\n    acquiredFrom: initialAcquiredFrom,\n    status: initialStatus,\n    notes: initialNotes,\n  };\n\n  async function fetchCollectionData() {\n    try {\n      const res = await fetch(\\`/api/collection/\\${encodeURIComponent(setId)}\\`);\n      if (!res.ok) return INITIAL_DATA;\n      const data = await res.json();\n      return {\n        acquiredDate: data.acquiredDate ?? '',\n        acquiredFrom: data.acquiredFrom ?? '',\n        status: data.status ?? '',\n        notes: data.notes ?? '',\n      };\n    } catch (_) {\n      return INITIAL_DATA;\n    }\n  }\n\n  function applyToView(data) {\n    const d = (v) => (v === '' ? '\u2014' : v);\n    viewAcquiredDate.textContent = formatAcquiredDateForView(data.acquiredDate);\n    viewAcquiredFrom.textContent = d(data.acquiredFrom);\n    viewStatus.textContent = formatStatusForView(data.status);\n    viewNotes.textContent = d(data.notes);\n  }\n\n  function showView() {\n    formEl.classList.add('collection-form--hidden');\n    viewEl.classList.remove('collection-view--hidden');\n  }\n\n  function showEdit() {\n    fetchCollectionData().then((data) => {\n      const ad = data.acquiredDate || '';\n      const parts = ad.split('-');\n      const y = parts[0] || '';\n      let m = (parts[1] || '').padStart(2, '0');\n      if (parseInt(m, 10) < 1 || parseInt(m, 10) > 12) m = '';\n      inputAcquiredMonth.value = m;\n      inputAcquiredYear.value = y;\n      inputAcquiredFrom.value = data.acquiredFrom;\n      inputStatus.value = data.status || '';\n      inputNotes.value = data.notes;\n      viewEl.classList.add('collection-view--hidden');\n      formEl.classList.remove('collection-form--hidden');\n      inputAcquiredMonth.focus();\n    });\n  }\n\n  function save(data) {\n    fetch(\\`/api/collection/\\${encodeURIComponent(setId)}\\`, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(data),\n      credentials: 'include',\n    })\n      .then((res) => {\n        if (res.status === 401) {\n          window.location.href = '/?next=' + encodeURIComponent(window.location.pathname);\n          return;\n        }\n        if (!res.ok) return;\n        applyToView(data);\n        showView();\n      })\n      .catch(() => {});\n  }\n\n  const isEditHost = window.location.hostname === 'edit.bioniclecollective.com';\n  if (isEditHost) {\n    editBtn.addEventListener('click', showEdit);\n  } else {\n    const editActions = document.getElementById('collection-edit-actions');\n    if (editActions) editActions.style.display = 'none';\n  }\n\n  cancelBtn.addEventListener('click', () => {\n    showView();\n  });\n\n  formEl.addEventListener('submit', (e) => {\n    e.preventDefault();\n    const year = inputAcquiredYear.value.trim();\n    const month = inputAcquiredMonth.value.trim();\n    let acquiredDate = '';\n    if (year) acquiredDate = month ? year + '-' + month : year;\n    save({\n      acquiredDate,\n      acquiredFrom: inputAcquiredFrom.value.trim(),\n      status: inputStatus.value,\n      notes: inputNotes.value.trim(),\n    });\n  });\n\n  fetchCollectionData().then((data) => {\n    applyToView(data);\n  });\n})();<\/script>"])), renderComponent($$result, "Layout", $$Layout, { "title": `${displayLabel} | The Bionicle Collective`, "description": `${displayLabel} (${set.year})` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<a${addAttribute(backHref, "href")} class="button-primary back-link">← Back to collection</a> <div class="set-detail-layout"> <nav class="set-detail-nav" aria-label="Set navigation"> ${prevHref ? renderTemplate`<a${addAttribute(prevHref, "href")} class="set-detail-arrow-btn" aria-label="Previous set">←</a>` : renderTemplate`<span class="set-detail-arrow-btn set-detail-arrow-btn--disabled" aria-hidden="true">←</span>`} </nav> <article class="set-detail"> <div class="image-wrap"> <img${addAttribute(`/set-photos/${set.id}.jpg`, "src")}${addAttribute(set.imageUrl, "data-fallback")}${addAttribute(displayLabel, "alt")} width="280" height="280" onerror="this.onerror=null;this.src=this.dataset.fallback"> </div> <div> <h1>${displayLabel}</h1> <ul class="meta-list"> <li><span>Set #</span><span>${setNumberDisplay}</span></li> <li><span>Year</span><span>${set.year}</span></li> <li><span>Theme</span><span>${set.theme}</span></li> ${set.pieceCount != null && renderTemplate`<li><span>Pieces</span><span>${set.pieceCount}</span></li>`} </ul> <div class="bio-block collection-section" id="in-my-collection"${addAttribute(set.id, "data-set-id")}> <h3>In my collection</h3> <div class="collection-view" id="collection-view" role="region" aria-label="Collection details"> <p class="collection-field"><strong>Date acquired:</strong> <span id="view-acquiredDate" class="collection-value">${formatAcquiredDate(set.acquiredDate)}</span></p> <p class="collection-field"><strong>Purchased from:</strong> <span id="view-acquiredFrom" class="collection-value">${set.acquiredFrom ?? "\u2014"}</span></p> <p class="collection-field"><strong>Status:</strong> <span id="view-status" class="collection-value">—</span></p> <p class="collection-field"><strong>Collector notes:</strong> <span id="view-notes" class="collection-value">${set.notes ?? "\u2014"}</span></p> <p class="collection-edit-actions" id="collection-edit-actions"> <button type="button" class="button-primary collection-edit-btn" id="collection-edit-btn" aria-label="Edit collection details">Edit</button> </p> </div> <form class="collection-form collection-form--hidden" id="collection-form" aria-label="Edit collection details"> <label class="collection-label">Date acquired</label> <div class="collection-date-row"> <select id="input-acquiredMonth" class="collection-input collection-select" name="acquiredMonth" aria-label="Month"> <option value="">—</option> ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, i) => {
    const val = String(i + 1).padStart(2, "0");
    const selected = (() => {
      if (!set.acquiredDate) return false;
      const part = set.acquiredDate.split("-")[1];
      const m = part ? String(parseInt(part, 10)).padStart(2, "0") : "";
      return m && parseInt(m, 10) >= 1 && parseInt(m, 10) <= 12 && m === val;
    })();
    return renderTemplate`<option${addAttribute(val, "value")}${addAttribute(selected, "selected")}>${name}</option>`;
  })} </select> <select id="input-acquiredYear" class="collection-input collection-select" name="acquiredYear" aria-label="Year"> <option value="">—</option> ${Array.from({ length: 2026 - 2003 + 1 }, (_, i) => 2003 + i).map((y) => {
    const selected = (() => {
      if (!set.acquiredDate) return false;
      const parts = set.acquiredDate.split("-");
      return parts[0] === String(y);
    })();
    return renderTemplate`<option${addAttribute(y, "value")}${addAttribute(selected, "selected")}>${y}</option>`;
  })} </select> </div> <label class="collection-label" for="input-acquiredFrom">Purchased from</label> <input type="text" id="input-acquiredFrom" class="collection-input" name="acquiredFrom"${addAttribute(set.acquiredFrom ?? "", "value")} placeholder="e.g. LEGO Store"> <label class="collection-label" for="input-status">Status</label> <select id="input-status" class="collection-input collection-select" name="status"> <option value="">—</option> <option value="new">New</option> <option value="used-complete">Used – Complete</option> <option value="used-incomplete">Used – Incomplete</option> </select> <label class="collection-label" for="input-notes">Collector notes</label> <textarea id="input-notes" class="collection-input collection-textarea" name="notes" rows="3" placeholder="Optional notes">${set.notes ?? ""}</textarea> <div class="collection-form-actions"> <button type="submit" class="button-primary">Save</button> <button type="button" class="button-secondary collection-cancel-btn" id="collection-cancel-btn">Cancel</button> </div> </form> </div> </div> </article> <nav class="set-detail-nav" aria-label="Set navigation"> ${nextHref ? renderTemplate`<a${addAttribute(nextHref, "href")} class="set-detail-arrow-btn" aria-label="Next set">→</a>` : renderTemplate`<span class="set-detail-arrow-btn set-detail-arrow-btn--disabled" aria-hidden="true">→</span>`} </nav> </div> ` }), defineScriptVars({ setId: set.id, initialAcquiredDate: set.acquiredDate ?? "", initialAcquiredFrom: set.acquiredFrom ?? "", initialNotes: set.notes ?? "", initialStatus: "" }));
}, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/[id].astro", void 0);

const $$file = "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/[id].astro";
const $$url = "/collection/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
