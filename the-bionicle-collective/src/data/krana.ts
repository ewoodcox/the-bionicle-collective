/**
 * Krana data and helpers.
 * Images use BrickLink part images: https://img.bricklink.com/ItemImage/PN/{colorId}/{partId}.png
 * proxied via /api/kanohi/image/ (reuses the same route).
 */

import kranaData from './krana.json';
import kranaCollection from './krana-collection.json';

export interface Krana {
  id: string;
  type: string;
  variant: 'active' | 'dormant' | 'krana-kal';
  color: string;
  colorLabel: string;
  partId: string;
  bricklinkColorId: string;
  owned?: boolean;
  imageUrl?: string;
}

/** Krana types in display order (columns). */
export const KRANA_TYPES: readonly { id: string; label: string }[] = [
  { id: 'xa', label: 'Xa' },
  { id: 'za', label: 'Za' },
  { id: 'vu', label: 'Vu' },
  { id: 'ca', label: 'Ca' },
  { id: 'yo', label: 'Yo' },
  { id: 'ja', label: 'Ja' },
  { id: 'su', label: 'Su' },
  { id: 'bo', label: 'Bo' },
];

/** Krana variants, each with their color rows in display order. */
export const KRANA_VARIANTS: readonly {
  id: 'active' | 'dormant' | 'krana-kal';
  label: string;
  colors: readonly { id: string; label: string }[];
}[] = [
  {
    id: 'active',
    label: 'Krana (Active)',
    colors: [
      { id: 'red', label: 'Red' },
      { id: 'medium-blue', label: 'Medium Blue' },
      { id: 'orange', label: 'Orange' },
      { id: 'blue', label: 'Blue' },
      { id: 'green', label: 'Green' },
      { id: 'lime', label: 'Lime' },
    ],
  },
  {
    id: 'dormant',
    label: 'Krana (Dormant)',
    colors: [
      { id: 'dark-gray', label: 'Dark Gray' },
      { id: 'white', label: 'White' },
      { id: 'purple', label: 'Purple' },
      { id: 'yellow', label: 'Yellow' },
      { id: 'tan', label: 'Tan' },
      { id: 'black', label: 'Black' },
    ],
  },
  {
    id: 'krana-kal',
    label: 'Krana-Kal',
    colors: [
      { id: 'metallic-green', label: 'Metallic Green' },
      { id: 'pearl-very-light-gray', label: 'Pearl Very Light Gray' },
      { id: 'pearl-sand-blue', label: 'Pearl Sand Blue' },
      { id: 'flat-dark-gold', label: 'Flat Dark Gold' },
      { id: 'pearl-dark-gray', label: 'Pearl Dark Gray' },
      { id: 'reddish-gold', label: 'Reddish Gold' },
    ],
  },
];

const OWNED_IDS = new Set(kranaCollection as string[]);

function toKrana(raw: {
  id: string;
  type: string;
  variant: 'active' | 'dormant' | 'krana-kal';
  color: string;
  colorLabel: string;
  partId: string;
  bricklinkColorId: string;
}): Krana {
  const owned = OWNED_IDS.has(raw.id);
  // Reuse the Kanohi image proxy — same BrickLink PN path format
  const imageUrl = `/api/kanohi/image/PN/${raw.bricklinkColorId}/${raw.partId}.png`;
  return { ...raw, owned, imageUrl };
}

const krana: Krana[] = (kranaData.krana as unknown[]).map((raw) =>
  toKrana(raw as {
    id: string;
    type: string;
    variant: 'active' | 'dormant' | 'krana-kal';
    color: string;
    colorLabel: string;
    partId: string;
    bricklinkColorId: string;
  })
);

export function getKrana(): Krana[] {
  return krana;
}

export function getKranaByVariant(variant: Krana['variant']): Krana[] {
  return krana.filter((k) => k.variant === variant);
}
