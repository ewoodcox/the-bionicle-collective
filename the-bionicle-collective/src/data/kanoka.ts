import kanokaData from './kanoka.json';

export interface Kanoka {
  id: string;
  code: string | null;
  metru: number | null;
  power: number | null;
  level: number | null;
  isGreatDisk: boolean;
  isSpecial: boolean;
  specialName?: string;
  partId: string | null;
  colorId: number;
  owned?: boolean;
}

export const METRU_LIST = [
  { id: 1, label: 'Ta-Metru', element: 'Fire',  color: '#c43c1e' },
  { id: 2, label: 'Ga-Metru', element: 'Water', color: '#1a6fbb' },
  { id: 3, label: 'Po-Metru', element: 'Stone', color: '#9e7340' },
  { id: 4, label: 'Ko-Metru', element: 'Ice',   color: '#7aa8bc' },
  { id: 5, label: 'Le-Metru', element: 'Air',   color: '#3a7a3a' },
  { id: 6, label: 'Onu-Metru', element: 'Earth', color: '#555555' },
] as const;

export const POWER_NAMES: Record<number, string> = {
  1: 'Reconstitute at Random',
  2: 'Weaken',
  3: 'Remove Poison',
  4: 'Regenerate',
  5: 'Teleport',
  6: 'Freeze',
  7: 'Increase Weight',
  8: 'Enlarge',
};

export const POWER_ABBREV: Record<number, string> = {
  1: 'Reconstitute',
  2: 'Weaken',
  3: 'Rm. Poison',
  4: 'Regenerate',
  5: 'Teleport',
  6: 'Freeze',
  7: 'Inc. Weight',
  8: 'Enlarge',
};

export function getKanoka(): Kanoka[] {
  return kanokaData as Kanoka[];
}

export function getKanokaByMetru(metru: number): Kanoka[] {
  return (kanokaData as Kanoka[]).filter((k) => k.metru === metru);
}

export function getKanokaSpecials(): Kanoka[] {
  return (kanokaData as Kanoka[]).filter((k) => k.isSpecial);
}
