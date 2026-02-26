globalThis.process ??= {}; globalThis.process.env ??= {};
import { f as createComponent, l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as Fragment, o as renderScript } from '../chunks/astro/server_CfljLbGr.mjs';
import { $ as $$Layout } from '../chunks/Layout_BPaiV44K.mjs';
import { s as sets, c as getSetSortKey, a as getSetDisplayLabel, b as getSetNumber, d as getMissingSetEntries } from '../chunks/setNamesByYear_DM9KZk86.mjs';
export { renderers } from '../renderers.mjs';

const YEAR_GROUPS = [
  { id: "gen1", label: "Generation 1" },
  { id: "gen2", label: "Generation 2" },
  { id: "other", label: "Other" }
];
function getYearGroup(year) {
  if (year >= 2001 && year <= 2010) return "gen1";
  if (year === 2015 || year === 2016) return "gen2";
  return "other";
}
function getYearsForGroup(groupId) {
  if (groupId === "gen1") return [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];
  if (groupId === "gen2") return [2015, 2016];
  return [];
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const byGroup = /* @__PURE__ */ new Map();
  for (const g of YEAR_GROUPS) byGroup.set(g.id, []);
  for (const s of sets) {
    const year = Number(s.year);
    const group = getYearGroup(year);
    byGroup.get(group).push(s);
  }
  for (const [, list] of byGroup) list.sort((a, b) => getSetSortKey(a) - getSetSortKey(b));
  const EXTRA_GROUPS = [{ id: "other", label: "Other" }, { id: "media", label: "Media" }];
  const VISIBLE_GROUPS = [...YEAR_GROUPS.filter((g) => g.id === "gen1" || g.id === "gen2"), ...EXTRA_GROUPS];
  const groupsWithData = VISIBLE_GROUPS.filter((g) => {
    if (g.id === "other")
      return sets.some((s) => {
        const theme = s.theme ?? "";
        return theme === "Combiner Models" || theme === "Alternate Models";
      });
    if (g.id === "media") return sets.some((s) => (s.theme ?? "").toLowerCase().includes("media"));
    return (byGroup.get(g.id) ?? []).length > 0;
  });
  const defaultGroupId = groupsWithData.find((g) => g.id === "gen1")?.id ?? groupsWithData[0]?.id ?? VISIBLE_GROUPS[0]?.id ?? null;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Meet the Collective | The Bionicle Collective", "description": "Bionicle collection by year." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="collection-page"> <h1>Meet the Collective</h1> <p style="text-align: center; margin-top: 0.25rem; margin-bottom: 1.5rem;">
Here you can browse through the individual sets and other items that make up The Bionicle Collective.
</p> ${VISIBLE_GROUPS.length > 1 && renderTemplate`<div class="generation-tabs" role="tablist" aria-label="Select generation"> ${VISIBLE_GROUPS.map((group) => renderTemplate`<button type="button" class="generation-tab" role="tab"${addAttribute(group.id === defaultGroupId, "aria-selected")}${addAttribute(group.id, "data-group-id")}> ${group.label} </button>`)} </div>`} ${VISIBLE_GROUPS.map((group) => {
    const items = group.id === "other" ? sets.filter((s) => {
      const theme = s.theme ?? "";
      return theme === "Combiner Models" || theme === "Alternate Models";
    }) : group.id === "media" ? sets.filter((s) => (s.theme ?? "").toLowerCase().includes("media")) : (byGroup.get(group.id) ?? []).filter((s) => {
      const theme = s.theme ?? "";
      return theme !== "Combiner Models" && theme !== "Alternate Models";
    });
    const years = getYearsForGroup(group.id);
    const hasCarousel = years.length > 0;
    const yearsWithData = hasCarousel ? years.filter((y) => items.some((s) => Number(s.year) === y)) : [];
    const firstYear = yearsWithData.length > 0 ? yearsWithData[0] : null;
    return renderTemplate`<section class="collection-section"${addAttribute(group.id, "id")}${addAttribute(group.id, "data-group-id")}${addAttribute(group.id === defaultGroupId, "data-active")}> ${items.length === 0 ? renderTemplate`<p class="collection-empty">No sets added yet for this generation.</p>` : group.id === "other" ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <div class="year-carousel" role="tablist"${addAttribute(`Select group for ${group.label}`, "aria-label")}${addAttribute(group.id, "data-group-id")}> ${items.some((s) => (s.theme ?? "") === "Combiner Models") && renderTemplate`<button type="button" role="tab"${addAttribute(true, "aria-selected")}${addAttribute(`${group.id}-year-combiner`, "aria-controls")}${addAttribute(`${group.id}-tab-combiner`, "id")} data-year="combiner"${addAttribute(group.id, "data-group-id")}>
Combiner Models
</button>`} ${items.some((s) => (s.theme ?? "") === "Alternate Models") && renderTemplate`<button type="button" role="tab"${addAttribute(!items.some((s) => (s.theme ?? "") === "Combiner Models"), "aria-selected")}${addAttribute(`${group.id}-year-alternate`, "aria-controls")}${addAttribute(`${group.id}-tab-alternate`, "id")} data-year="alternate"${addAttribute(group.id, "data-group-id")}>
Alternate Models
</button>`} </div> ${items.some((s) => (s.theme ?? "") === "Combiner Models") && renderTemplate`<div class="year-pane"${addAttribute(`${group.id}-year-combiner`, "id")} role="tabpanel"${addAttribute(`${group.id}-tab-combiner`, "aria-labelledby")} data-year="combiner"${addAttribute(group.id, "data-group-id")}${addAttribute(true, "data-active")}> <div class="set-grid"> ${items.filter((s) => (s.theme ?? "") === "Combiner Models").map((set) => renderTemplate`<a${addAttribute(`/collection/${set.id}/`, "href")} class="set-card"> <img${addAttribute(`/set-photos/${set.id}.jpg`, "src")}${addAttribute(set.imageUrl, "data-fallback")}${addAttribute(getSetDisplayLabel(set), "alt")} width="160" height="160" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback"> <div class="info"> <div class="name">${getSetDisplayLabel(set)}</div> <div class="meta">${set.year}</div> </div> </a>`)} </div> </div>`}${items.some((s) => (s.theme ?? "") === "Alternate Models") && renderTemplate`<div class="year-pane"${addAttribute(`${group.id}-year-alternate`, "id")} role="tabpanel"${addAttribute(`${group.id}-tab-alternate`, "aria-labelledby")} data-year="alternate"${addAttribute(group.id, "data-group-id")}${addAttribute(!items.some((s) => (s.theme ?? "") === "Combiner Models"), "data-active")}> <div class="set-grid"> ${items.filter((s) => (s.theme ?? "") === "Alternate Models").map((set) => renderTemplate`<a${addAttribute(`/collection/${set.id}/`, "href")} class="set-card"> <img${addAttribute(`/set-photos/${set.id}.jpg`, "src")}${addAttribute(set.imageUrl, "data-fallback")}${addAttribute(getSetDisplayLabel(set), "alt")} width="160" height="160" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback"> <div class="info"> <div class="name">${getSetDisplayLabel(set)}</div> <div class="meta">${set.year}</div> </div> </a>`)} </div> </div>`}` })}` : hasCarousel && yearsWithData.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <div class="year-carousel" role="tablist"${addAttribute(`Select year for ${group.label}`, "aria-label")}${addAttribute(group.id, "data-group-id")}> ${yearsWithData.map((y) => renderTemplate`<button type="button" role="tab"${addAttribute(y === firstYear, "aria-selected")}${addAttribute(`${group.id}-year-${y}`, "aria-controls")}${addAttribute(`${group.id}-tab-${y}`, "id")}${addAttribute(String(y), "data-year")}${addAttribute(group.id, "data-group-id")}> ${y} </button>`)} </div> ${yearsWithData.map((y) => {
      const yearKey = String(y);
      const yearItems = items.filter((s) => Number(s.year) === y);
      const ownedSetNumbers = new Set(yearItems.map((s) => getSetNumber(s)));
      const missingEntries = getMissingSetEntries(y, ownedSetNumbers);
      return renderTemplate`<div class="year-pane"${addAttribute(`${group.id}-year-${yearKey}`, "id")} role="tabpanel"${addAttribute(`${group.id}-tab-${y}`, "aria-labelledby")}${addAttribute(yearKey, "data-year")}${addAttribute(group.id, "data-group-id")}${addAttribute(y === firstYear, "data-active")}> <div class="set-grid"> ${yearItems.map((set) => renderTemplate`<a${addAttribute(`/collection/${set.id}/`, "href")} class="set-card"> <img${addAttribute(`/set-photos/${set.id}.jpg`, "src")}${addAttribute(set.imageUrl, "data-fallback")}${addAttribute(getSetDisplayLabel(set), "alt")} width="160" height="160" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback"> <div class="info"> <div class="name">${getSetDisplayLabel(set)}</div> <div class="meta">${set.year}</div> </div> </a>`)} </div> ${missingEntries.length > 0 && renderTemplate`<div class="missing-section"> <h3 class="missing-heading">Missing</h3> <div class="set-grid"> ${missingEntries.map((entry) => renderTemplate`<div class="set-card set-card--missing"> <img${addAttribute(`https://placehold.co/160x160?text=${encodeURIComponent(entry.setNumber)}`, "src")}${addAttribute(`${entry.setNumber} - ${entry.name}`, "alt")} width="160" height="160" loading="lazy"> <div class="info"> <div class="name">${entry.setNumber} - ${entry.name}</div> <div class="meta">${y}</div> </div> </div>`)} </div> </div>`} </div>`;
    })}` })}` : renderTemplate`<div class="set-grid"> ${items.map((set) => renderTemplate`<a${addAttribute(`/collection/${set.id}/`, "href")} class="set-card"> <img${addAttribute(`/set-photos/${set.id}.jpg`, "src")}${addAttribute(set.imageUrl, "data-fallback")}${addAttribute(getSetDisplayLabel(set), "alt")} width="160" height="160" loading="lazy" onerror="this.onerror=null;this.src=this.dataset.fallback"> <div class="info"> <div class="name">${getSetDisplayLabel(set)}</div> <div class="meta">${set.year}</div> </div> </a>`)} </div>`} </section>`;
  })} </div> ${renderScript($$result2, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/index.astro", void 0);

const $$file = "C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/index.astro";
const $$url = "/collection";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
