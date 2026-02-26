/**
 * Collection data: one record per set.
 * Generated from spreadsheet by: npm run import:xlsx
 * (Reads data/BIONICLE (1).xlsx, sheet "Total Count"; column B = 2001 set list.)
 * Image URLs: use BionicleSector01 or replace in collection.json / re-import.
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

/** Loaded from collection.json (see scripts/import-from-xlsx.mjs). */
export const sets: SetRecord[] = collection as SetRecord[];

export function getSetById(id: string): SetRecord | undefined {
  return sets.find((s) => s.id === id);
}
