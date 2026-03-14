import XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * One-off importer for "Combiner/Alternate Models" sheet.
 * Appends combiner/alternate models into src/data/collection.json
 * WITHOUT touching existing sets (including Protectors / Creatures).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const xlsxPath = join(projectRoot, 'data', 'BIONICLE (1).xlsx');
const outPath = join(projectRoot, 'src', 'data', 'collection.json');

const COMBINER_SKIP_NAMES = new Set(['Vezon & Kardas', 'Irnakk', 'Ultimate Dume', 'Voporak']);

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function loadExistingSets() {
  if (!existsSync(outPath)) return [];
  try {
    const raw = readFileSync(outPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function addCombinerModels(workbook, sets) {
  const sheetName =
    Object.keys(workbook.Sheets).find((name) => name.toLowerCase().includes('combiner')) ?? null;
  if (!sheetName) {
    console.warn('Combiner sheet not found (no sheet name containing "combiner")');
    return;
  }
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const rows = Array.isArray(data) ? data : [];
  if (!rows.length) return;

  const headerRow = rows[0] || [];

  // Build quick lookup of existing IDs so we don't duplicate.
  const existingIds = new Set(sets.map((s) => s.id));

  // Columns B–K (indices 1–10) hold combiner names under year headers.
  for (let colIndex = 1; colIndex <= 10; colIndex++) {
    const headerCell = headerRow[colIndex];
    if (!headerCell) continue;
    const headerStr = String(headerCell).trim();
    if (!headerStr) continue;

    const yearMatch = headerStr.match(/\d{4}/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;

    // Rows 2–10 (indices 1–9) contain combiner names.
    for (let rowIndex = 1; rowIndex <= 9 && rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const cell = row && row[colIndex];
      if (cell == null || cell === '') continue;

      let value = String(cell).trim().replace(/\s+/g, ' ');
      if (!value) continue;
      if (COMBINER_SKIP_NAMES.has(value)) continue;

      const slug = slugify(value);
      const id = `${slug}-${year || 'combiner'}`;
      if (existingIds.has(id)) continue;

      sets.push({
        id,
        name: value,
        setNumber: '',
        year: year || 0,
        theme: 'Combiner Models',
        imageUrl: `https://placehold.co/280x280?text=${encodeURIComponent(value)}`,
      });
      existingIds.add(id);
    }
  }
}

function run() {
  if (!existsSync(xlsxPath)) {
    console.error('Spreadsheet not found at:', xlsxPath);
    process.exit(1);
  }

  const workbook = XLSX.readFile(xlsxPath);
  const sets = loadExistingSets();

  addCombinerModels(workbook, sets);

  writeFileSync(outPath, JSON.stringify(sets, null, 2), 'utf8');
  console.log('Wrote %d total sets (including combiners) to %s', sets.length, outPath);
}

run();

