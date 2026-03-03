/**
 * Year groups for the collection list page.
 * 2001–2010 = Generation 1, 2015–2016 = Generation 2, then "Other".
 */

export const YEAR_GROUPS: readonly { id: string; label: string; labelShort?: string }[] = [
  { id: 'gen1', label: 'Generation 1', labelShort: 'Gen 1' },
  { id: 'gen2', label: 'Generation 2', labelShort: 'Gen 2' },
  { id: 'other', label: 'Other' },
];

export function getYearGroup(year: number): string {
  if (year >= 2001 && year <= 2010) return 'gen1';
  if (year === 2015 || year === 2016) return 'gen2';
  return 'other';
}

/** Years shown in the carousel when a generation is selected. */
export function getYearsForGroup(groupId: string): number[] {
  if (groupId === 'gen1') return [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010];
  if (groupId === 'gen2') return [2015, 2016];
  return [];
}
