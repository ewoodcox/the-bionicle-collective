globalThis.process ??= {}; globalThis.process.env ??= {};
const MEDIA_ERAS = [
  { id: "mata_nui_saga", label: "Mata Nui Saga", sortPosition: 10 },
  { id: "metru_nui_saga", label: "Metru Nui Saga", sortPosition: 20 },
  { id: "ignition_trilogy", label: "Ignition Trilogy", sortPosition: 30 },
  { id: "bara_magna_saga", label: "Bara Magna Saga", sortPosition: 40 },
  // Books (and other non-comics items) don't currently have arc metadata, so keep them together until mapped.
  { id: "books_tbd", label: "Books (TBD)", sortPosition: 9990 },
  { id: "unknown", label: "Unknown", sortPosition: 9999 }
];
function getMainIssueNumber(m) {
  const s = (m.issueNumber ?? "").trim();
  const match = s.match(/^Issue\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}
function getIgnitionIssueNumber(m) {
  const s = (m.issueNumber ?? "").trim();
  const match = s.match(/^Ignition\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}
function getGlatorianIssueNumber(m) {
  const s = (m.issueNumber ?? "").trim();
  const match = s.match(/^Glatorian\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}
function getVolumeNumber(m) {
  const s = (m.issueNumber ?? "").trim();
  const match = s.match(/^Volume\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}
function getMediaEraId(m) {
  if (m.category === "comics") {
    if (m.year >= 2001 && m.year <= 2003) return "mata_nui_saga";
    if (m.year >= 2004 && m.year <= 2005) return "metru_nui_saga";
    if (m.year >= 2006 && m.year <= 2008) return "ignition_trilogy";
    if (m.year >= 2009 && m.year <= 2010) return "bara_magna_saga";
  }
  if (m.category === "books") return "books_tbd";
  return "unknown";
}
function getMediaEraLabel(m) {
  return MEDIA_ERAS.find((e) => e.id === getMediaEraId(m))?.label ?? "Unknown";
}
function getWithinEraSortNumber(m) {
  if (m.category === "comics") {
    const main = getMainIssueNumber(m);
    if (main !== null) return main;
    const ignition = getIgnitionIssueNumber(m);
    if (ignition !== null) return ignition;
    const glatorian = getGlatorianIssueNumber(m);
    if (glatorian !== null) return glatorian;
  }
  if (m.category === "books") {
    const vol = getVolumeNumber(m);
    if (vol !== null) return vol;
    return m.year;
  }
  return m.year;
}
function sortMediaByEra(items) {
  return items.slice().sort((a, b) => {
    const eraA = getMediaEraId(a);
    const eraB = getMediaEraId(b);
    const posA = MEDIA_ERAS.find((e) => e.id === eraA)?.sortPosition ?? 99999;
    const posB = MEDIA_ERAS.find((e) => e.id === eraB)?.sortPosition ?? 99999;
    if (posA !== posB) return posA - posB;
    const withinA = getWithinEraSortNumber(a);
    const withinB = getWithinEraSortNumber(b);
    if (withinA !== withinB) return withinA - withinB;
    return a.title.localeCompare(b.title);
  });
}

export { getMediaEraLabel as g, sortMediaByEra as s };
