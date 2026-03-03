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

export function getKanohiYears(): number[] {
  const years = [...new Set(masks.map((m) => m.year))];
  return years.sort((a, b) => a - b);
}
