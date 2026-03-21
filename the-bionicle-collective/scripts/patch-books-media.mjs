/**
 * One-time patch: replace placeholder book rows with canonical BIONICLE novels
 * (Biosector01 Books page). Run: node scripts/patch-books-media.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const path = join(root, 'src/data/media.json');

const PLACEHOLDER_IMG = 'https://placehold.co/280x280?text=Book';

const books = [
  // BIONICLE Chronicles (2003)
  ['book_chronicles_1-tale-of-the-toa', 'Chronicles 1', 'Tale of the Toa', 2003, 'BIONICLE_Chronicles_1:_Tale_of_the_Toa'],
  ['book_chronicles_2-beware-the-bohrok', 'Chronicles 2', 'Beware the Bohrok', 2003, 'BIONICLE_Chronicles_2:_Beware_the_Bohrok'],
  ['book_chronicles_3-makutas-revenge', 'Chronicles 3', "Makuta's Revenge", 2003, 'BIONICLE_Chronicles_3:_Makuta%27s_Revenge'],
  ['book_chronicles_4-tales-of-the-masks', 'Chronicles 4', 'Tales of the Masks', 2003, 'BIONICLE_Chronicles_4:_Tales_of_the_Masks'],
  // Movie novelization (2003)
  ['book_mask-of-light', 'Movie', 'Mask of Light', 2003, 'BIONICLE:_Mask_of_Light_(Book)'],
  // BIONICLE Adventures (2004–2005)
  ['book_adventures_1-mystery-of-metru-nui', 'Adventures 1', 'Mystery of Metru Nui', 2004, 'BIONICLE_Adventures_1:_Mystery_of_Metru_Nui'],
  ['book_adventures_2-trial-by-fire', 'Adventures 2', 'Trial by Fire', 2004, 'BIONICLE_Adventures_2:_Trial_by_Fire'],
  ['book_adventures_3-the-darkness-below', 'Adventures 3', 'The Darkness Below', 2004, 'BIONICLE_Adventures_3:_The_Darkness_Below'],
  ['book_adventures_4-legends-of-metru-nui', 'Adventures 4', 'Legends of Metru Nui', 2004, 'BIONICLE_Adventures_4:_Legends_of_Metru_Nui'],
  ['book_adventures_5-voyage-of-fear', 'Adventures 5', 'Voyage of Fear', 2005, 'BIONICLE_Adventures_5:_Voyage_of_Fear'],
  ['book_adventures_6-maze-of-shadows', 'Adventures 6', 'Maze of Shadows', 2005, 'BIONICLE_Adventures_6:_Maze_of_Shadows'],
  ['book_adventures_7-web-of-the-visorak', 'Adventures 7', 'Web of the Visorak', 2005, 'BIONICLE_Adventures_7:_Web_of_the_Visorak'],
  ['book_adventures_8-challenge-of-the-hordika', 'Adventures 8', 'Challenge of the Hordika', 2005, 'BIONICLE_Adventures_8:_Challenge_of_the_Hordika'],
  ['book_adventures_9-web-of-shadows', 'Adventures 9', 'Web of Shadows', 2005, 'BIONICLE_Adventures_9:_Web_of_Shadows'],
  ['book_adventures_10-time-trap', 'Adventures 10', 'Time Trap', 2005, 'BIONICLE_Adventures_10:_Time_Trap'],
  // BIONICLE Legends (2006–2008)
  ['book_legends_1-island-of-doom', 'Legends 1', 'Island of Doom', 2006, 'BIONICLE_Legends_1:_Island_of_Doom'],
  ['book_legends_2-dark-destiny', 'Legends 2', 'Dark Destiny', 2006, 'BIONICLE_Legends_2:_Dark_Destiny'],
  ['book_legends_3-power-play', 'Legends 3', 'Power Play', 2006, 'BIONICLE_Legends_3:_Power_Play'],
  ['book_legends_4-legacy-of-evil', 'Legends 4', 'Legacy of Evil', 2006, 'BIONICLE_Legends_4:_Legacy_of_Evil'],
  ['book_legends_5-inferno', 'Legends 5', 'Inferno', 2007, 'BIONICLE_Legends_5:_Inferno'],
  ['book_legends_6-city-of-the-lost', 'Legends 6', 'City of the Lost', 2007, 'BIONICLE_Legends_6:_City_of_the_Lost'],
  ['book_legends_7-prisoners-of-the-pit', 'Legends 7', 'Prisoners of the Pit', 2007, 'BIONICLE_Legends_7:_Prisoners_of_the_Pit'],
  ['book_legends_8-downfall', 'Legends 8', 'Downfall', 2007, 'BIONICLE_Legends_8:_Downfall'],
  ['book_legends_9-shadows-in-the-sky', 'Legends 9', 'Shadows in the Sky', 2008, 'BIONICLE_Legends_9:_Shadows_in_the_Sky'],
  ['book_legends_10-swamp-of-secrets', 'Legends 10', 'Swamp of Secrets', 2008, 'BIONICLE_Legends_10:_Swamp_of_Secrets'],
  ['book_legends_11-the-final-battle', 'Legends 11', 'The Final Battle', 2008, 'BIONICLE_Legends_11:_The_Final_Battle'],
  // Bara Magna Super Chapter Books (2009–2010)
  ['book_bara-magna_1-raid-on-vulcanus', 'Bara Magna 1', 'Raid on Vulcanus', 2009, 'BIONICLE:_Raid_on_Vulcanus'],
  ['book_bara-magna_2-the-legend-reborn', 'Bara Magna 2', 'The Legend Reborn', 2009, 'BIONICLE:_The_Legend_Reborn_(Book)'],
  ['book_bara-magna_3-journeys-end', 'Bara Magna 3', "Journey's End", 2010, 'BIONICLE:_Journey%27s_End'],
  // Generation 2 chapter books (2015–2016)
  ['book_g2_1-island-of-lost-masks', 'G2 1', 'Island of Lost Masks', 2015, 'BIONICLE:_Island_of_Lost_Masks'],
  ['book_g2_2-revenge-of-the-skull-spiders', 'G2 2', 'Revenge of the Skull Spiders', 2015, 'BIONICLE:_Revenge_of_the_Skull_Spiders'],
  ['book_g2_3-escape-from-the-underworld', 'G2 3', 'Escape from the Underworld', 2016, 'BIONICLE:_Escape_from_the_Underworld'],
];

const REMOVE_IDS = new Set(['books-2001-volume-1', 'books-2001-volume-2', 'books-2015-volume-1', 'books-2015-volume-2']);

const media = JSON.parse(readFileSync(path, 'utf8'));
if (!Array.isArray(media)) throw new Error('Expected array');

const newRows = books.map(([id, issueNumber, title, year, wikiTitle]) => ({
  id,
  title,
  issueNumber,
  category: 'books',
  year,
  imageUrl: PLACEHOLDER_IMG,
  sourceUrl: `https://biosector01.com/wiki/${wikiTitle}`,
}));

const newIds = new Set(newRows.map((r) => r.id));
const filtered = media.filter((m) => !REMOVE_IDS.has(m.id) && !newIds.has(m.id));
const insertAfter = 'bionicle_glatorian_7-rebirth';
const idx = filtered.findIndex((m) => m.id === insertAfter);
if (idx === -1) throw new Error(`Anchor ${insertAfter} not found`);

const next = [...filtered.slice(0, idx + 1), ...newRows, ...filtered.slice(idx + 1)];
writeFileSync(path, JSON.stringify(next, null, 2) + '\n', 'utf8');
console.log(`Patched ${path}: +${newRows.length} books, removed ${REMOVE_IDS.size} placeholders.`);
