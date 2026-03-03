/**
 * Collection data: one record per set.
 * Edit src/data/collection.json directly to add or update sets.
 */

import collection from './collection.json';

export interface SetRecord {
  /** Unique slug for the URL, e.g. "8534-2001" */
  id: string;
  name: string;
  setNumber: string;
  year: number;
  theme: string;
  pieceCount?: number;
  /** BionicleSector01 or your own image URL */
  imageUrl: string;
  acquiredDate?: string;
  acquiredFrom?: string;
  notes?: string;
}

/** Loaded from collection.json. */
export const sets: SetRecord[] = collection as SetRecord[];

export function getSetById(id: string): SetRecord | undefined {
  return sets.find((s) => s.id === id);
}
