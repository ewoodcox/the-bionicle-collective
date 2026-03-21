/**
 * Media data: one record per "media" entry (comics/books/disks/games/cards).
 * Edit `src/data/media.json` directly to add or update entries.
 */

import media from './media.json';

export type MediaCategoryId = 'comics' | 'books' | 'disks' | 'games' | 'cards';

export const MEDIA_CATEGORIES: readonly { id: MediaCategoryId; label: string }[] = [
  { id: 'comics', label: 'Comics' },
  { id: 'books', label: 'Books' },
  { id: 'disks', label: 'Disks' },
  { id: 'games', label: 'Games' },
  { id: 'cards', label: 'Cards' },
];

export interface MediaRecord {
  /** Stable slug used for the URL and for `/api/collection/:id` storage. */
  id: string;
  /** Display title (issue title for comics, book title for books). */
  title: string;
  category: MediaCategoryId;
  year: number;
  imageUrl: string;

  /** Optional alternate cover image URL (e.g. BrickMaster cover). */
  imageUrlAlt?: string;

  /** For comics/books: issue/volume number shown on the card (optional). */
  issueNumber?: string;

  // Optional citations/notes for your source data
  sourceUrl?: string;

  // These are the same fields edited by the "In my collection" UI
  acquiredDate?: string;
  acquiredFrom?: string;
  status?: string;
  notes?: string;
}

/** Loaded from media.json. */
export const mediaItems: MediaRecord[] = media as MediaRecord[];

export function getMediaById(id: string): MediaRecord | undefined {
  return mediaItems.find((m) => m.id === id);
}

function getExtFromUrl(url: string | undefined): string {
  if (!url) return 'png';
  const m = url.match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  if (!m) return 'png';
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}

/**
 * URL for `<img src>` — **served by `/api/media/cover/[id]`** from R2 (see `src/pages/api/media/cover/[id].ts`).
 * We no longer use `/media-covers/...` as the primary src: those files are optional in `public/` and often
 * aren’t deployed, which produced spurious 404s before the real API request.
 */
export function getMediaCoverSrc(m: MediaRecord, variant: 'main' | 'alt' = 'main'): string {
  return getMediaCoverApiUrl(m.id, variant);
}

/** Same URL as `getMediaCoverSrc` — kept for callers that need the path without a full `MediaRecord`. */
export function getMediaCoverApiUrl(id: string, variant: 'main' | 'alt' = 'main'): string {
  const q = variant === 'alt' ? '?variant=alt' : '';
  return `/api/media/cover/${encodeURIComponent(id)}${q}`;
}

export function getMediaYears(): number[] {
  const years = new Set<number>();
  for (const m of mediaItems) years.add(m.year);
  return Array.from(years).sort((a, b) => a - b);
}

export function getMediaByYear(year: number): MediaRecord[] {
  return mediaItems
    .filter((m) => m.year === year)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getMediaByYearAndCategory(year: number, categoryId: MediaCategoryId): MediaRecord[] {
  return mediaItems
    .filter((m) => m.year === year && m.category === categoryId)
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getMediaCardName(m: MediaRecord): string {
  // Example: "Issue 1 – Transformers" or "Volume 2 – ..."
  if (m.issueNumber && m.issueNumber.trim() !== '') return `${m.issueNumber} \u2013 ${m.title}`;
  return m.title;
}

