globalThis.process ??= {}; globalThis.process.env ??= {};
const media = /* #__PURE__ */ JSON.parse("[{\"id\":\"bionicle_1-the-coming-of-the-toa\",\"title\":\"The Coming of the Toa\",\"issueNumber\":\"Issue 1\",\"category\":\"comics\",\"year\":2001,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_1-the-coming-of-the-toa/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_1-the-coming-of-the-toa/alt.png\"},{\"id\":\"bionicle_2-deep-into-darkness\",\"title\":\"Deep into Darkness\",\"issueNumber\":\"Issue 2\",\"category\":\"comics\",\"year\":2001,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_2-deep-into-darkness/main.png\"},{\"id\":\"bionicle_3-triumph-of-the-toa\",\"title\":\"Triumph of the Toa\",\"issueNumber\":\"Issue 3\",\"category\":\"comics\",\"year\":2001,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_3-triumph-of-the-toa/main.png\"},{\"id\":\"bionicle_4-the-bohrok-awake\",\"title\":\"The Bohrok Awake\",\"issueNumber\":\"Issue 4\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_4-the-bohrok-awake/main.png\"},{\"id\":\"bionicle_5-to-trap-a-tahnok\",\"title\":\"To Trap a Tahnok\",\"issueNumber\":\"Issue 5\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_5-to-trap-a-tahnok/main.png\"},{\"id\":\"bionicle_6-into-the-nest\",\"title\":\"Into The Nest\",\"issueNumber\":\"Issue 6\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_6-into-the-nest/main.png\"},{\"id\":\"bionicle_7-what-lurks-below\",\"title\":\"What Lurks Below\",\"issueNumber\":\"Issue 7\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_7-what-lurks-below/main.png\"},{\"id\":\"bionicle_8-the-end-of-the-toa\",\"title\":\"The End of the Toa?\",\"issueNumber\":\"Issue 8\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_8-the-end-of-the-toa/main.png\"},{\"id\":\"bionicle_9-divided-we-fall\",\"title\":\"Divided We Fall\",\"issueNumber\":\"Issue 9\",\"category\":\"comics\",\"year\":2002,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_9-divided-we-fall/main.png\"},{\"id\":\"bionicle_10-powerless\",\"title\":\"Powerless!\",\"issueNumber\":\"Issue 10\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_10-powerless/main.png\"},{\"id\":\"bionicle_11-a-matter-of-time\",\"title\":\"A Matter of Time...\",\"issueNumber\":\"Issue 11\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_11-a-matter-of-time/main.png\"},{\"id\":\"bionicle_12-absolute-power\",\"title\":\"Absolute Power\",\"issueNumber\":\"Issue 12\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_12-absolute-power/main.png\"},{\"id\":\"bionicle_13-rise-of-the-rahkshi\",\"title\":\"Rise of the Rahkshi!\",\"issueNumber\":\"Issue 13\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_13-rise-of-the-rahkshi/main.png\"},{\"id\":\"bionicle_14-at-last-takanuva\",\"title\":\"At Last -- Takanuva!\",\"issueNumber\":\"Issue 14\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_14-at-last-takanuva/main.png\"},{\"id\":\"bionicle_15-secrets-and-shadows\",\"title\":\"Secrets and Shadows\",\"issueNumber\":\"Issue 15\",\"category\":\"comics\",\"year\":2003,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_15-secrets-and-shadows/main.png\"},{\"id\":\"bionicle_16-toa-metru\",\"title\":\"Toa Metru!\",\"issueNumber\":\"Issue 16\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_16-toa-metru/main.png\"},{\"id\":\"bionicle_17-disks-of-danger\",\"title\":\"Disks of Danger\",\"issueNumber\":\"Issue 17\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_17-disks-of-danger/main.png\"},{\"id\":\"bionicle_18-seeds-of-doom\",\"title\":\"Seeds of Doom\",\"issueNumber\":\"Issue 18\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_18-seeds-of-doom/main.png\"},{\"id\":\"bionicle_19-enemies-of-metru-nui\",\"title\":\"Enemies of Metru Nui\",\"issueNumber\":\"Issue 19\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_19-enemies-of-metru-nui/main.png\"},{\"id\":\"bionicle_20-struggle-in-the-sky\",\"title\":\"Struggle in the Sky\",\"issueNumber\":\"Issue 20\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_20-struggle-in-the-sky/main.png\"},{\"id\":\"bionicle_21-dreams-of-darkness\",\"title\":\"Dreams of Darkness\",\"issueNumber\":\"Issue 21\",\"category\":\"comics\",\"year\":2004,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_21-dreams-of-darkness/main.png\"},{\"id\":\"bionicle_22-monsters-in-the-dark\",\"title\":\"Monsters in the Dark\",\"issueNumber\":\"Issue 22\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_22-monsters-in-the-dark/main.png\"},{\"id\":\"bionicle_23-vengeance-of-the-visorak\",\"title\":\"Vengeance of the Visorak\",\"issueNumber\":\"Issue 23\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_23-vengeance-of-the-visorak/main.png\"},{\"id\":\"bionicle_24-shadow-play\",\"title\":\"Shadow Play\",\"issueNumber\":\"Issue 24\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_24-shadow-play/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_24-shadow-play/alt.png\"},{\"id\":\"bionicle_25-birth-of-the-rahaga\",\"title\":\"Birth of the Rahaga\",\"issueNumber\":\"Issue 25\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_25-birth-of-the-rahaga/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_25-birth-of-the-rahaga/alt.png\"},{\"id\":\"bionicle_26-hanging-by-a-thread\",\"title\":\"Hanging by a Thread\",\"issueNumber\":\"Issue 26\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_26-hanging-by-a-thread/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_26-hanging-by-a-thread/alt.png\"},{\"id\":\"bionicle_27-fractures\",\"title\":\"Fractures\",\"issueNumber\":\"Issue 27\",\"category\":\"comics\",\"year\":2005,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_27-fractures/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_27-fractures/alt.png\"},{\"id\":\"bionicle_ignition_0-ignition-0\",\"title\":\"Ignition 0\",\"issueNumber\":\"Ignition 0\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_1-if-a-universe-ends\",\"title\":\"If a Universe Ends ...\",\"issueNumber\":\"Ignition 1\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_2-vengeance-of-axonn\",\"title\":\"Vengeance of Axonn\",\"issueNumber\":\"Ignition 2\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_3-showdown\",\"title\":\"Showdown\",\"issueNumber\":\"Ignition 3\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_ignition_3-showdown/main.png\",\"imageUrlAlt\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_ignition_3-showdown/alt.png\"},{\"id\":\"bionicle_ignition_4-a-cold-light-dawns\",\"title\":\"A Cold Light Dawns\",\"issueNumber\":\"Ignition 4\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_5-in-final-battle\",\"title\":\"In Final Battle\",\"issueNumber\":\"Ignition 5\",\"category\":\"comics\",\"year\":2006,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_6-ignition-6\",\"title\":\"Ignition 6\",\"issueNumber\":\"Ignition 6\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_7-mask-of-life-mask-of-doom\",\"title\":\"Mask of Life, Mask of Doom\",\"issueNumber\":\"Ignition 7\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_8-sea-of-darkness\",\"title\":\"Sea of Darkness\",\"issueNumber\":\"Ignition 8\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_9-battle-in-the-deep\",\"title\":\"Battle in the Deep!\",\"issueNumber\":\"Ignition 9\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_10-the-death-of-mata-nui\",\"title\":\"The Death of Mata Nui\",\"issueNumber\":\"Ignition 10\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_11-death-of-a-hero\",\"title\":\"Death of a Hero\",\"issueNumber\":\"Ignition 11\",\"category\":\"comics\",\"year\":2007,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_12-realm-of-fear\",\"title\":\"Realm of Fear\",\"issueNumber\":\"Ignition 12\",\"category\":\"comics\",\"year\":2008,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_13-swamp-of-shadows\",\"title\":\"Swamp of Shadows\",\"issueNumber\":\"Ignition 13\",\"category\":\"comics\",\"year\":2008,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_14-endgame\",\"title\":\"Endgame\",\"issueNumber\":\"Ignition 14\",\"category\":\"comics\",\"year\":2008,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_ignition_15-mata-nui-rising\",\"title\":\"Mata Nui Rising\",\"issueNumber\":\"Ignition 15\",\"category\":\"comics\",\"year\":2008,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_1-sands-of-bara-magna\",\"title\":\"Sands of Bara Magna\",\"issueNumber\":\"Glatorian 1\",\"category\":\"comics\",\"year\":2009,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_2-the-fall-of-atero\",\"title\":\"The Fall of Atero\",\"issueNumber\":\"Glatorian 2\",\"category\":\"comics\",\"year\":2009,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_3-a-hero-reborn\",\"title\":\"A Hero Reborn\",\"issueNumber\":\"Glatorian 3\",\"category\":\"comics\",\"year\":2009,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_4-before-the-storm\",\"title\":\"Before the Storm\",\"issueNumber\":\"Glatorian 4\",\"category\":\"comics\",\"year\":2009,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_5-valley-of-fear\",\"title\":\"Valley of Fear\",\"issueNumber\":\"Glatorian 5\",\"category\":\"comics\",\"year\":2009,\"imageUrl\":\"https://placehold.co/280x280?text=Comics\"},{\"id\":\"bionicle_glatorian_6-all-that-glitters\",\"title\":\"All That Glitters\",\"issueNumber\":\"Glatorian 6\",\"category\":\"comics\",\"year\":2010,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_glatorian_6-all-that-glitters/main.png\"},{\"id\":\"bionicle_glatorian_7-rebirth\",\"title\":\"Rebirth\",\"issueNumber\":\"Glatorian 7\",\"category\":\"comics\",\"year\":2010,\"imageUrl\":\"https://a43ef82a759b3a8676ec011927bbe7dd.r2.cloudflarestorage.com/bionicle-collection/media-covers/bionicle_glatorian_7-rebirth/main.jpg\"},{\"id\":\"disks-2001-1\",\"title\":\"BIONICLE Disks (2001)\",\"category\":\"disks\",\"year\":2001,\"imageUrl\":\"https://placehold.co/280x280?text=Disks%202001\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"games-2001-1\",\"title\":\"BIONICLE Games (2001)\",\"category\":\"games\",\"year\":2001,\"imageUrl\":\"https://placehold.co/280x280?text=Games%202001\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"cards-2001-1\",\"title\":\"BIONICLE Cards (2001)\",\"category\":\"cards\",\"year\":2001,\"imageUrl\":\"https://placehold.co/280x280?text=Cards%202001\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"books-2001-volume-1\",\"title\":\"BIONICLE Books\",\"issueNumber\":\"Volume 1\",\"category\":\"books\",\"year\":2001,\"imageUrl\":\"https://placehold.co/280x280?text=Books%201201\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"books-2001-volume-2\",\"title\":\"BIONICLE Books\",\"issueNumber\":\"Volume 2\",\"category\":\"books\",\"year\":2001,\"imageUrl\":\"https://placehold.co/280x280?text=Books%201202\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"books-2015-volume-1\",\"title\":\"BIONICLE Books\",\"issueNumber\":\"Volume 1\",\"category\":\"books\",\"year\":2015,\"imageUrl\":\"https://placehold.co/280x280?text=Books%2025101\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"books-2015-volume-2\",\"title\":\"BIONICLE Books\",\"issueNumber\":\"Volume 2\",\"category\":\"books\",\"year\":2015,\"imageUrl\":\"https://placehold.co/280x280?text=Books%2025102\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"disks-2015-1\",\"title\":\"BIONICLE Disks (2015)\",\"category\":\"disks\",\"year\":2015,\"imageUrl\":\"https://placehold.co/280x280?text=Disks%202015\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"games-2015-1\",\"title\":\"BIONICLE Games (2015)\",\"category\":\"games\",\"year\":2015,\"imageUrl\":\"https://placehold.co/280x280?text=Games%202015\",\"sourceUrl\":\"https://biosector01.com/wiki/\"},{\"id\":\"cards-2015-1\",\"title\":\"BIONICLE Cards (2015)\",\"category\":\"cards\",\"year\":2015,\"imageUrl\":\"https://placehold.co/280x280?text=Cards%202015\",\"sourceUrl\":\"https://biosector01.com/wiki/\"}]");

const MEDIA_CATEGORIES = [
  { id: "comics", label: "Comics" },
  { id: "books", label: "Books" },
  { id: "disks", label: "Disks" },
  { id: "games", label: "Games" },
  { id: "cards", label: "Cards" }
];
const mediaItems = media;
function getMediaById(id) {
  return mediaItems.find((m) => m.id === id);
}
function getMediaCardName(m) {
  if (m.issueNumber && m.issueNumber.trim() !== "") return `${m.issueNumber} – ${m.title}`;
  return m.title;
}

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

export { MEDIA_CATEGORIES as M, getMediaCardName as a, getMediaById as b, getMediaEraLabel as g, mediaItems as m, sortMediaByEra as s };
