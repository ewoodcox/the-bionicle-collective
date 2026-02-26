/**
 * Reads BIONICLE (1).xlsx from data/, sheet "Total Count":
 *   Column B = 2001 set list, Column C = 2002 set list.
 * Writes src/data/collection.json for the site to use.
 * Run: npm run import:xlsx
 */

import XLSX from 'xlsx';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const xlsxPath = join(projectRoot, 'data', 'BIONICLE (1).xlsx');
const outPath = join(projectRoot, 'src', 'data', 'collection.json');

/** Preserve these fields from existing collection when re-importing. */
const PRESERVE_KEYS = ['theme', 'acquiredDate', 'acquiredFrom', 'notes'];

/**
 * Selectable themes per year. First in each array is the default when no theme column is used.
 * Add more options to an array to allow multiple themes for that year (e.g. 2006: ['Toa Inika / Piraka', 'Playsets', 'Promotional']).
 */
const THEMES_BY_YEAR = {
  2001: ['Toa', 'Turaga', 'Rahi', 'Tohunga'],
  2002: ['Bohrok', 'Toa Nuva', 'Titans'],
  2003: ['Bohrok-Kal', 'Matoran', 'Rahkshi', 'Titans'],
  2004: ['Toa Metru', 'Titans', 'Matoran'],
  2005: ['Toa Hordika', 'Titans', 'Visorak', 'Rahaga'],
  2006: ['Toa Inika', 'Piraka'],
  2007: ['Toa Mahri / Barraki'],
  2008: ['Phantoka / Mistika'],
  2009: ['Glatorian / Legends'],
  2010: ['Stars'],
  2015: ['Masters / Protectors / Skulls'],
  2016: ['Elemental Creatures / Toa Uniters / Shadow Horde'],
};
const DEFAULT_THEME = 'BIONICLE';

/** Optional theme column (0-based). Set to null to disable; 13 = column N. If set, each row can override theme. */
const THEME_COLUMN_INDEX = 13;

const SHEET_NAME = 'Total Count';
const COLUMNS = [
  { index: 1, year: 2001 }, // B
  { index: 2, year: 2002 }, // C
  { index: 3, year: 2003 }, // D
  { index: 4, year: 2004 }, // E
  { index: 5, year: 2005 }, // F
  { index: 6, year: 2006 }, // G
  { index: 7, year: 2007 }, // H
  { index: 8, year: 2008 }, // I
  { index: 9, year: 2009 }, // J
  { index: 10, year: 2010 }, // K
  { index: 11, year: 2015 }, // L
  { index: 12, year: 2016 }, // M
];

// Skip sheet rows 31-32 (0-based: 30, 31)
const SKIP_ROW_INDICES = new Set([30, 31]);

function getDefaultThemeForYear(year) {
  const list = THEMES_BY_YEAR[year];
  return (list && list[0]) || DEFAULT_THEME;
}

function getThemeForRow(row, year) {
  if (THEME_COLUMN_INDEX == null || row == null) return getDefaultThemeForYear(year);
  const cell = row[THEME_COLUMN_INDEX];
  const value = cell != null ? String(cell).trim() : '';
  if (!value) return getDefaultThemeForYear(year);
  const allowed = THEMES_BY_YEAR[year];
  if (allowed && allowed.includes(value)) return value;
  return getDefaultThemeForYear(year);
}

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function addSetsFromColumn(rows, colIndex, year, sets, existingById) {
  for (let i = 1; i < rows.length; i++) {
    if (SKIP_ROW_INDICES.has(i)) continue;
    const row = rows[i];
    const cell = row && row[colIndex];
    if (cell == null || cell === '') continue;

    let value = String(cell).trim().replace(/\s+/g, ' ');
    if (!value) continue;

    const slug = slugify(value);
    const id = `${slug}-${year}`;
    if (sets.some((s) => s.id === id)) continue;
    const record = {
      id,
      name: value,
      setNumber: value,
      year,
      theme: getThemeForRow(row, year),
      imageUrl: `https://placehold.co/280x280?text=${encodeURIComponent(value)}`,
    };
    const existing = existingById && existingById[id];
    if (existing) {
      for (const key of PRESERVE_KEYS) {
        if (existing[key] != null && existing[key] !== '') record[key] = existing[key];
      }
    }
    sets.push(record);
  }
}

function run() {
  if (!existsSync(xlsxPath)) {
    console.error('Spreadsheet not found at:', xlsxPath);
    console.error('Create data/ and put BIONICLE (1).xlsx there, then run again.');
    process.exit(1);
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    console.error('Sheet "%s" not found. Available:', SHEET_NAME, Object.keys(workbook.Sheets));
    process.exit(1);
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rows = Array.isArray(data) ? data : [];
  let existingById = null;
  if (existsSync(outPath)) {
    try {
      const existing = JSON.parse(readFileSync(outPath, 'utf8'));
      existingById = Array.isArray(existing) ? Object.fromEntries(existing.map((s) => [s.id, s])) : null;
    } catch (_) {
      existingById = null;
    }
  }

  const sets = [];
  for (const { index, year } of COLUMNS) {
    const before = sets.length;
    addSetsFromColumn(rows, index, year, sets, existingById);
    console.log('Column %s: %d sets (year %s)', String.fromCharCode(65 + index), sets.length - before, year);
  }

  writeFileSync(outPath, JSON.stringify(sets, null, 2), 'utf8');
  console.log('Wrote %d total sets to %s', sets.length, outPath);
}

run();
