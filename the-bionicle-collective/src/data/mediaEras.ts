import type { MediaRecord } from './media';

export type MediaEraId =
  | 'mata_nui_saga'
  | 'metru_nui_saga'
  | 'ignition_trilogy'
  | 'bara_magna_saga'
  | 'books_tbd'
  | 'unknown';

export interface MediaEra {
  id: MediaEraId;
  label: string;
  sortPosition: number;
}

export const MEDIA_ERAS: readonly MediaEra[] = [
  { id: 'mata_nui_saga', label: 'Mata Nui Saga', sortPosition: 10 },
  { id: 'metru_nui_saga', label: 'Metru Nui Saga', sortPosition: 20 },
  { id: 'ignition_trilogy', label: 'Ignition Trilogy', sortPosition: 30 },
  { id: 'bara_magna_saga', label: 'Bara Magna Saga', sortPosition: 40 },
  // Books (and other non-comics items) don't currently have arc metadata, so keep them together until mapped.
  { id: 'books_tbd', label: 'Books', sortPosition: 9990 },
  { id: 'unknown', label: 'Unknown', sortPosition: 9999 },
] as const;

function getMainIssueNumber(m: MediaRecord): number | null {
  const s = (m.issueNumber ?? '').trim();
  const match = s.match(/^Issue\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function getIgnitionIssueNumber(m: MediaRecord): number | null {
  const s = (m.issueNumber ?? '').trim();
  const match = s.match(/^Ignition\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function getGlatorianIssueNumber(m: MediaRecord): number | null {
  const s = (m.issueNumber ?? '').trim();
  const match = s.match(/^Glatorian\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function getVolumeNumber(m: MediaRecord): number | null {
  const s = (m.issueNumber ?? '').trim();
  const match = s.match(/^Volume\s+(\d+)$/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

/** Novel series order for the books carousel (see media.json `issueNumber`). */
function getBookSeriesSortKey(m: MediaRecord): number | null {
  const s = (m.issueNumber ?? '').trim();
  let match = s.match(/^Chronicles\s+(\d+)$/i);
  if (match) return 100 + Number(match[1]);
  if (/^movie$/i.test(s)) return 150;
  match = s.match(/^Adventures\s+(\d+)$/i);
  if (match) return 200 + Number(match[1]);
  match = s.match(/^Legends\s+(\d+)$/i);
  if (match) return 400 + Number(match[1]);
  match = s.match(/^Bara Magna\s+(\d+)$/i);
  if (match) return 500 + Number(match[1]);
  match = s.match(/^G2\s+(\d+)$/i);
  if (match) return 600 + Number(match[1]);
  return null;
}

export function getMediaEraId(m: MediaRecord): MediaEraId {
  if (m.category === 'comics') {
    // Era grouping is defined by story arc period years (not artist changes).
    if (m.year >= 2001 && m.year <= 2003) return 'mata_nui_saga';
    if (m.year >= 2004 && m.year <= 2005) return 'metru_nui_saga';
    if (m.year >= 2006 && m.year <= 2008) return 'ignition_trilogy';
    if (m.year >= 2009 && m.year <= 2010) return 'bara_magna_saga';
  }

  // Books currently have no story-arc metadata in `media.json`, so treat as a placeholder era.
  if (m.category === 'books') return 'books_tbd';

  return 'unknown';
}

export function getMediaEraLabel(m: MediaRecord): string {
  return MEDIA_ERAS.find((e) => e.id === getMediaEraId(m))?.label ?? 'Unknown';
}

function getWithinEraSortNumber(m: MediaRecord): number {
  // Sort within an era by their logical sequence number where possible.
  if (m.category === 'comics') {
    // Use the issue numbering scheme when available so cards remain chronologically ordered within each saga.
    const main = getMainIssueNumber(m);
    if (main !== null) return main;
    const ignition = getIgnitionIssueNumber(m);
    if (ignition !== null) return ignition;
    const glatorian = getGlatorianIssueNumber(m);
    if (glatorian !== null) return glatorian;
  }

  if (m.category === 'books') {
    const series = getBookSeriesSortKey(m);
    if (series !== null) return series;
    const vol = getVolumeNumber(m);
    if (vol !== null) return vol;
    return m.year;
  }

  return m.year;
}

export function sortMediaByEra(items: MediaRecord[]): MediaRecord[] {
  return items
    .slice()
    .sort((a, b) => {
      const eraA = getMediaEraId(a);
      const eraB = getMediaEraId(b);

      const posA = MEDIA_ERAS.find((e) => e.id === eraA)?.sortPosition ?? 99999;
      const posB = MEDIA_ERAS.find((e) => e.id === eraB)?.sortPosition ?? 99999;

      if (posA !== posB) return posA - posB;

      const withinA = getWithinEraSortNumber(a);
      const withinB = getWithinEraSortNumber(b);
      if (withinA !== withinB) return withinA - withinB;

      // Stable secondary sort.
      return a.title.localeCompare(b.title);
    });
}

