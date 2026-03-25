/**
 * Kanohi mask data and helpers.
 * Masks use BrickLink part images: https://img.bricklink.com/ItemImage/PN/{colorId}/{partId}.png
 */

import kanohiData from './kanohi.json';
import kanohiCollection from './kanohi-collection.json';

export interface KanohiMask {
  id: string;
  name: string;
  fullName: string;
  type: 'great' | 'noble' | 'nuva' | 'protodermic' | 'special';
  year: number;
  color: string;
  colorLabel: string;
  partId: string;
  bricklinkColorId: string;
  source: string;
  sourceNote: string;
  isRare: boolean;
  owned?: boolean;
  imageUrl?: string;
}

const OWNED_IDS = new Set(kanohiCollection as string[]);

function toMask(raw: { id: string; bricklinkColorId: string; partId: string; [k: string]: unknown }): KanohiMask {
  const owned = OWNED_IDS.has(raw.id);
  // Use our cached proxy; first request fetches from BrickLink and stores in R2
  const imageUrl = `/api/kanohi/image/PN/${raw.bricklinkColorId}/${raw.partId}.png`;
  return {
    ...raw,
    year: Number(raw.year),
    owned,
    imageUrl,
  } as KanohiMask;
}

const masks: KanohiMask[] = (kanohiData.masks as unknown[]).map((raw) =>
  toMask(raw as { id: string; bricklinkColorId: string; partId: string; [k: string]: unknown })
);

export function getMasks(): KanohiMask[] {
  return masks;
}

export function getMasksByYear(year: number): KanohiMask[] {
  return masks.filter((m) => m.year === year);
}

export function getMasksByType(type: KanohiMask['type']): KanohiMask[] {
  return masks.filter((m) => m.type === type);
}

// ── Sorting ────────────────────────────────────────────────────────────────

/** Color order for Great and Nuva Kanohi (standard Toa colors first, then metallics). */
const GREAT_NUVA_COLOR_ORDER: string[] = [
  'green', 'white', 'blue', 'red', 'brown', 'black',
  'bionicle-gold', 'bionicle-silver', 'pearl-light-gray',
];

/** Mask name order within a color group (base name without "Nuva" suffix). */
const GREAT_NUVA_MASK_ORDER: string[] = [
  'Miru', 'Akaku', 'Kaukau', 'Hau', 'Kakama', 'Pakari',
];

function greatNuvaSort(a: KanohiMask, b: KanohiMask): number {
  const ci = GREAT_NUVA_COLOR_ORDER.indexOf(a.color) - GREAT_NUVA_COLOR_ORDER.indexOf(b.color);
  if (ci !== 0) return ci;
  const baseName = (m: KanohiMask) => m.name.replace(' Nuva', '');
  return GREAT_NUVA_MASK_ORDER.indexOf(baseName(a)) - GREAT_NUVA_MASK_ORDER.indexOf(baseName(b));
}

/** Sort a group of masks using the appropriate order for their type. */
export function sortMasks(group: KanohiMask[]): KanohiMask[] {
  const type = group[0]?.type;
  if (type === 'great' || type === 'nuva') {
    return [...group].sort(greatNuvaSort);
  }
  // Noble/special: alphabetical by name then colorLabel (noble order TBD)
  return [...group].sort((a, b) => a.name.localeCompare(b.name) || a.colorLabel.localeCompare(b.colorLabel));
}

export function getKanohiYears(): number[] {
  const years = [...new Set(masks.map((m) => m.year))];
  return years.sort((a, b) => a - b);
}
