/**
 * Official Bionicle set number → name (from BIONICLEsector01 wiki).
 * Used to display "8534 - Tahu" in the UI. Add more years as needed.
 */

const SET_2001: Record<string, string> = {
  '8525': 'BIONICLE Masks',
  '8530': 'BIONICLE Masks',
  '8531': 'Pohatu',
  '8532': 'Onua',
  '8533': 'Gali',
  '8534': 'Tahu',
  '8535': 'Lewa',
  '8536': 'Kopaka',
  '8537': 'Nui-Rama',
  '8538': 'Muaka & Kane-Ra',
  '8539': 'Manas',
  '8540': 'Vakama',
  '8541': 'Matau',
  '8542': 'Onewa',
  '8543': 'Nokama',
  '8544': 'Nuju',
  '8545': 'Whenua',
  '8546': 'PowerPack',
  '8548': 'Nui-Jaga',
  '8549': 'Tarakava',
  '1388': 'Huki',
  '1389': 'Onepu',
  '1390': 'Maku',
  '1391': 'Jala',
  '1392': 'Kongu',
  '1393': 'Matoro',
};

/** Name → primary set number for 2001 (for spreadsheet data that has names). */
const NAME_TO_NUMBER_2001: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2001)) {
  if (!NAME_TO_NUMBER_2001[name]) NAME_TO_NUMBER_2001[name] = num;
}
NAME_TO_NUMBER_2001['Muaka\n& Kane-Ra'] = '8538';
NAME_TO_NUMBER_2001['Muaka & Kane-Ra'] = '8538';

const SET_2002: Record<string, string> = {
  '8550': 'Gahlok Va',
  '8551': 'Kohrak Va',
  '8552': 'Lehvak Va',
  '8553': 'Pahrak Va',
  '8554': 'Tahnok Va',
  '8555': 'Nuhvok Va',
  '8556': 'Boxor',
  '8557': 'Exo-Toa',
  '8558': 'Cahdok & Gahdok',
  '8559': 'BIONICLE Krana',
  '8560': 'Pahrak',
  '8561': 'Nuhvok',
  '8562': 'Gahlok',
  '8563': 'Tahnok',
  '8564': 'Lehvak',
  '8565': 'Kohrak',
  '8566': 'Onua Nuva',
  '8567': 'Lewa Nuva',
  '8568': 'Pohatu Nuva',
  '8569': 'BIONICLE Krana',
  '8570': 'Gali Nuva',
  '8571': 'Kopaka Nuva',
  '8572': 'Tahu Nuva',
  '8597': 'Kanohi Nuva & Krana Pack',
  '8598': 'Kanohi Nuva & Krana Pack',
  '10023': 'BIONICLE Master Builder Set',
};

const NAME_TO_NUMBER_2002: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2002)) {
  if (!NAME_TO_NUMBER_2002[name]) NAME_TO_NUMBER_2002[name] = num;
}
// Handle variants from spreadsheet imports (line breaks, slight name changes)
NAME_TO_NUMBER_2002['Cahdok\n& Gahdok'] = '8558';

const SET_2003: Record<string, string> = {
  '8581': 'Kopeke',
  '8582': 'Matoro',
  '8583': 'Hahli',
  '8584': 'Hewkii',
  '8585': 'Hafu',
  '8586': 'Macku',
  '8573': 'Nuhvok-Kal',
  '8574': 'Tahnok-Kal',
  '8575': 'Kohrak-Kal',
  '8576': 'Lehvak-Kal',
  '8577': 'Pahrak-Kal',
  '8578': 'Gahlok-Kal',
  '8587': 'Panrahk',
  '8588': 'Kurahk',
  '8589': 'Lerahk',
  '8590': 'Guurahk',
  '8591': 'Vorahk',
  '8592': 'Turahk',
  '8593': 'Makuta',
  '8594': 'Jaller & Gukko', // BS01 uses Jaller; spreadsheet may use Jala
  '8595': 'Takua & Pewku',
  '8596': 'Takanuva',
  '10201': 'Takutanuva',
  '8580': 'Kraata',
  '8599': 'Krana-Kal',
  '8600': 'Krana-Kal',
};

const NAME_TO_NUMBER_2003: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2003)) {
  if (!NAME_TO_NUMBER_2003[name]) NAME_TO_NUMBER_2003[name] = num;
}
// Handle Jaller vs Jala spelling and newline variants from spreadsheet data
NAME_TO_NUMBER_2003['Jaller & Gukko'] = '8594';
NAME_TO_NUMBER_2003['Jala & Gukko'] = '8594';
NAME_TO_NUMBER_2003['Jaller\n& Gukko'] = '8594';
NAME_TO_NUMBER_2003['Takua & Pewku'] = '8595';
NAME_TO_NUMBER_2003['Takua\n& Pewku'] = '8595';

const SET_2004: Record<string, string> = {
  '8601': 'Toa Vakama',
  '8602': 'Toa Nokama',
  '8603': 'Toa Whenua',
  '8604': 'Toa Onewa',
  '8605': 'Toa Matau',
  '8606': 'Toa Nuju',
  '8607': 'Nuhrii',
  '8608': 'Vhisola',
  '8609': 'Tehutti',
  '8610': 'Ahkmou',
  '8611': 'Orkahm',
  '8612': 'Ehrye',
  '8613': 'Kanoka Disk Launcher Pack',
  '8614': 'Vahki Nuurakh',
  '8615': 'Vahki Bordakh',
  '8616': 'Vahki Vorzakh',
  '8617': 'Vahki Zadakh',
  '8618': 'Vahki Rorzakh',
  '8619': 'Vahki Keerakh',
  '8621': 'Turaga Dume & Nivawk',
  '8622': 'Nidhiki',
  '8623': 'Krekka',
  '3287': 'Takutanuva',
  '8711': 'Master Accessory Kit',
  '8811': 'Toa Lhikan & Kikanalo',
  '10202': 'Ultimate Dume',
  '3259': 'Shooter + Disc',
  '7934': 'Kanoka Disk Launcher and Disk',
  '8026': 'Kraatu',
};

const NAME_TO_NUMBER_2004: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2004)) {
  if (!NAME_TO_NUMBER_2004[name]) NAME_TO_NUMBER_2004[name] = num;
}
NAME_TO_NUMBER_2004['Turaga Dume\n& Nivawk'] = '8621';
NAME_TO_NUMBER_2004['Toa Lhikan\n& Kikanalo'] = '8811';
// Partial names from column E (spreadsheet) → set number; display uses full name from SET_2004
NAME_TO_NUMBER_2004['Vakama'] = '8601';
NAME_TO_NUMBER_2004['Nokama'] = '8602';
NAME_TO_NUMBER_2004['Whenua'] = '8603';
NAME_TO_NUMBER_2004['Onewa'] = '8604';
NAME_TO_NUMBER_2004['Matau'] = '8605';
NAME_TO_NUMBER_2004['Nuju'] = '8606';
NAME_TO_NUMBER_2004['Nuhrii'] = '8607';
NAME_TO_NUMBER_2004['Vhisola'] = '8608';
NAME_TO_NUMBER_2004['Tehutti'] = '8609';
NAME_TO_NUMBER_2004['Ahkmou'] = '8610';
NAME_TO_NUMBER_2004['Orkahm'] = '8611';
NAME_TO_NUMBER_2004['Ehrye'] = '8612';
NAME_TO_NUMBER_2004['Ehyre'] = '8612';
NAME_TO_NUMBER_2004['Nuurakh'] = '8614';
NAME_TO_NUMBER_2004['Bordakh'] = '8615';
NAME_TO_NUMBER_2004['Vorzakh'] = '8616';
NAME_TO_NUMBER_2004['Zadakh'] = '8617';
NAME_TO_NUMBER_2004['Rorzakh'] = '8618';
NAME_TO_NUMBER_2004['Keerakh'] = '8619';
NAME_TO_NUMBER_2004['Nidhiki'] = '8622';
NAME_TO_NUMBER_2004['Krekka'] = '8623';

const SET_2005: Record<string, string> = {
  '4868': 'Rahaga Gaaki',
  '4869': 'Rahaga Pouks',
  '4870': 'Rahaga Kualus',
  '4877': 'Rahaga Norik',
  '4878': 'Rahaga Bomonga',
  '4879': 'Rahaga Iruini',
  '8736': 'Toa Hordika Vakama',
  '8737': 'Toa Hordika Nokama',
  '8738': 'Toa Hordika Whenua',
  '8739': 'Toa Hordika Onewa',
  '8740': 'Toa Hordika Matau',
  '8741': 'Toa Hordika Nuju',
  '8742': 'Visorak Vohtarak',
  '8743': 'Visorak Boggarak',
  '8744': 'Visorak Oohnorak',
  '8745': 'Visorak Roporak',
  '8746': 'Visorak Keelerak',
  '8747': 'Visorak Suukorak',
  '8748': 'Rhotuka Spinners',
  '8755': 'Keetongu',
  '8756': 'Sidorak',
  '8757': 'Visorak Battle Ram',
  '8758': 'Tower of Toa',
  '8759': 'Battle of Metru Nui',
  '8761': 'Roodaka',
  '8762': 'Toa Iruini',
  '8763': 'Toa Norik',
  '8769': "Visorak's Gate",
  '10203': 'Voporak',
  '6637': 'Ultimate Battle Set',
  '8713': 'Ultimate BIONICLE Accessory Kit',
  '8715': 'Ultimate Creatures Accessory Set',
};

const NAME_TO_NUMBER_2005: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2005)) {
  if (!NAME_TO_NUMBER_2005[name]) NAME_TO_NUMBER_2005[name] = num;
}
NAME_TO_NUMBER_2005['Voporak'] = '10203';
NAME_TO_NUMBER_2005["Visorak's Gate"] = '8769';
// Partial names (spreadsheet column F)
NAME_TO_NUMBER_2005['Gaaki'] = '4868';
NAME_TO_NUMBER_2005['Pouks'] = '4869';
NAME_TO_NUMBER_2005['Kualus'] = '4870';
NAME_TO_NUMBER_2005['Norik'] = '4877';
NAME_TO_NUMBER_2005['Bomonga'] = '4878';
NAME_TO_NUMBER_2005['Iruini'] = '4879';
NAME_TO_NUMBER_2005['Vakama'] = '8736';
NAME_TO_NUMBER_2005['Nokama'] = '8737';
NAME_TO_NUMBER_2005['Whenua'] = '8738';
NAME_TO_NUMBER_2005['Onewa'] = '8739';
NAME_TO_NUMBER_2005['Matau'] = '8740';
NAME_TO_NUMBER_2005['Nuju'] = '8741';
NAME_TO_NUMBER_2005['Vohtarak'] = '8742';
NAME_TO_NUMBER_2005['Boggarak'] = '8743';
NAME_TO_NUMBER_2005['Oohnorak'] = '8744';
NAME_TO_NUMBER_2005['Oohnarak'] = '8744'; // spreadsheet typo
NAME_TO_NUMBER_2005['Visorak Oohnorak'] = '8744';
NAME_TO_NUMBER_2005['Roporak'] = '8745';
NAME_TO_NUMBER_2005['Keelerak'] = '8746';
NAME_TO_NUMBER_2005['Suukorak'] = '8747';
NAME_TO_NUMBER_2005['Keetongu'] = '8755';
NAME_TO_NUMBER_2005['Sidorak'] = '8756';
NAME_TO_NUMBER_2005['Roodaka'] = '8761';
NAME_TO_NUMBER_2005['Toa Iruini'] = '8762';
NAME_TO_NUMBER_2005['Toa Norik'] = '8763';
NAME_TO_NUMBER_2005['Visorak Battle Ram'] = '8757';
NAME_TO_NUMBER_2005['Tower of Toa'] = '8758';
NAME_TO_NUMBER_2005['Battle of Metru Nui'] = '8759';

const SET_2006: Record<string, string> = {
  '8721': 'Velika',
  '8722': 'Kazi',
  '8723': 'Piruk',
  '8724': 'Garan',
  '8725': 'Balta',
  '8726': 'Dalu',
  '8900': 'Reidak',
  '8901': 'Hakann',
  '8902': 'Vezok',
  '8903': 'Zaktan',
  '8904': 'Avak',
  '8905': 'Thok',
  '8727': 'Toa Jaller',
  '8728': 'Toa Hahli',
  '8729': 'Toa Nuparu',
  '8730': 'Toa Hewkii',
  '8731': 'Toa Kongu',
  '8732': 'Toa Matoro',
  '8733': 'Axonn',
  '8734': 'Brutaka',
  '8764': 'Vezon & Fenrakk',
  '8625': 'Umbra',
  '8626': 'Irnakk',
  '10204': 'Vezon & Kardas',
  '8892': 'Piraka Outpost',
  '8893': 'Lava Chamber Gate',
  '8894': 'Piraka Stronghold',
  '8624': 'Race for the Mask of Life',
  '8719': 'Zamor Spheres',
  '66157': 'Piraka Combination Set 1',
  '66158': 'Piraka Combination Set 2',
  '66170': 'Co-Pack 8733+8727',
  '66207': 'BIONICLE Gift Set',
  '6934': 'Good Guy',
  '6935': 'Bad Guy',
  '7216': 'Gold Good Guy',
  '7217': 'Duracell Bad Guy',
  '7716': 'QUICK Good Guy White',
  '7717': 'QUICK Bad Guy Green',
  '7718': 'QUICK Bad Guy Yellow',
  '7719': 'QUICK Good Guy Red',
};

const NAME_TO_NUMBER_2006: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2006)) {
  if (!NAME_TO_NUMBER_2006[name]) NAME_TO_NUMBER_2006[name] = num;
}
NAME_TO_NUMBER_2006['Jaller'] = '8727';
NAME_TO_NUMBER_2006['Hahli'] = '8728';
NAME_TO_NUMBER_2006['Nuparu'] = '8729';
NAME_TO_NUMBER_2006['Hewkii'] = '8730';
NAME_TO_NUMBER_2006['Kongu'] = '8731';
NAME_TO_NUMBER_2006['Matoro'] = '8732';
NAME_TO_NUMBER_2006['Vezon and Fenrakk'] = '8764';
NAME_TO_NUMBER_2006['Vezon & Fenrakk'] = '8764';
NAME_TO_NUMBER_2006['Vezon\n& Fenrakk'] = '8764';
NAME_TO_NUMBER_2006['Vezon & Kardas'] = '10204';
NAME_TO_NUMBER_2006['Vezon\n& Kardas'] = '10204';

const SET_2007: Record<string, string> = {
  '8929': 'Defilak',
  '8930': 'Dekar',
  '8931': 'Thulox',
  '8932': 'Morak',
  '8916': 'Takadox',
  '8917': 'Kalmah',
  '8918': 'Carapar',
  '8919': 'Mantax',
  '8920': 'Ehlek',
  '8921': 'Pridak',
  '8910': 'Toa Kongu',
  '8911': 'Toa Jaller',
  '8912': 'Toa Hewkii',
  '8913': 'Toa Nuparu',
  '8914': 'Toa Hahli',
  '8915': 'Toa Matoro',
  '8922': 'Gadunka',
  '8923': 'Hydraxon',
  '8924': 'Maxilos & Spinax',
  '8935': 'Nocturn',
  '8939': 'Lesovikk',
  '8940': 'Karzahni',
  '8925': 'Barraki Deepsea Patrol',
  '8926': 'Toa Undersea Attack',
  '8927': 'Toa Terrain Crawler',
  '8934': 'Squid Ammo',
  '6944': 'Good Guy 07',
  '6945': 'Bad Guy 07',
  '6946': 'Squid Launcher Function',
};

const NAME_TO_NUMBER_2007: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2007)) {
  if (!NAME_TO_NUMBER_2007[name]) NAME_TO_NUMBER_2007[name] = num;
}
NAME_TO_NUMBER_2007['Kongu'] = '8910';
NAME_TO_NUMBER_2007['Jaller'] = '8911';
NAME_TO_NUMBER_2007['Hewkii'] = '8912';
NAME_TO_NUMBER_2007['Nuparu'] = '8913';
NAME_TO_NUMBER_2007['Hahli'] = '8914';
NAME_TO_NUMBER_2007['Matoro'] = '8915';
NAME_TO_NUMBER_2007['Maxilos and Spinax'] = '8924';
NAME_TO_NUMBER_2007['Maxilos & Spinax'] = '8924';
NAME_TO_NUMBER_2007['Maxilos\n& Spinax'] = '8924';

const SET_2008: Record<string, string> = {
  '8944': 'Tanma',
  '8945': 'Solek',
  '8946': 'Photok',
  '8947': 'Radiak',
  '8948': 'Gavla',
  '8949': 'Kirop',
  '8685': 'Toa Kopaka',
  '8686': 'Toa Lewa',
  '8687': 'Toa Pohatu',
  '8691': 'Antroz',
  '8692': 'Vamprah',
  '8693': 'Chirox',
  '8688': 'Toa Gali',
  '8689': 'Toa Tahu',
  '8690': 'Toa Onua',
  '8694': 'Krika',
  '8695': 'Gorast',
  '8696': 'Bitil',
  '8697': 'Toa Ignika',
  '8698': 'Vultraz',
  '8699': 'Takanuva',
  '8952': 'Mutran & Vican',
  '8953': 'Makuta Icarax',
  '8954': 'Mazeka',
  '8941': 'Rockoh T3',
  '8942': 'Jetrax T6',
  '8942-2': 'Jetrax T6',
  '8943': 'Axalara T9',
  '6126': 'Good Guy 2008',
  '6127': 'Bad Guy 2008',
  '6128': 'Function 2008',
  '20005': 'Klakk',
};

const NAME_TO_NUMBER_2008: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2008)) {
  if (!NAME_TO_NUMBER_2008[name]) NAME_TO_NUMBER_2008[name] = num;
}
NAME_TO_NUMBER_2008['Kopaka'] = '8685';
NAME_TO_NUMBER_2008['Lewa'] = '8686';
NAME_TO_NUMBER_2008['Pohatu'] = '8687';
NAME_TO_NUMBER_2008['Gali'] = '8688';
NAME_TO_NUMBER_2008['Tahu'] = '8689';
NAME_TO_NUMBER_2008['Onua'] = '8690';
NAME_TO_NUMBER_2008['Mutran and Vican'] = '8952';
NAME_TO_NUMBER_2008['Mutran & Vican'] = '8952';
NAME_TO_NUMBER_2008['Mutran\n& Vican'] = '8952';
NAME_TO_NUMBER_2008['Icarax'] = '8953';
NAME_TO_NUMBER_2008['SE Jetrax T6'] = '8942-2';

const SET_2009: Record<string, string> = {
  '8972': 'Atakus',
  '8973': 'Raanu',
  '8974': 'Tarduk',
  '8975': 'Berix',
  '8976': 'Metus',
  '8977': 'Zesk',
  '8978': 'Skrall',
  '8979': 'Malum',
  '8980': 'Gresh',
  '8981': 'Tarix',
  '8982': 'Strakk',
  '8983': 'Vorox',
  '8984': 'Stronius',
  '8985': 'Ackar',
  '8986': 'Vastus',
  '8987': 'Kiina',
  '8988': 'Gelu',
  '8989': 'Mata Nui',
  '8991': 'Tuma',
  '8990': 'Fero & Skirmix',
  '8998': 'Toa Mata Nui',
  '8992': 'Cendox V1',
  '8993': 'Kaxium V3',
  '8994': 'Baranus V7',
  '8995': 'Thornatus V9',
  '8996': 'Skopio XV-1',
  '20012': 'Click',
};

const NAME_TO_NUMBER_2009: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2009)) {
  if (!NAME_TO_NUMBER_2009[name]) NAME_TO_NUMBER_2009[name] = num;
}
NAME_TO_NUMBER_2009['Fero and Skirmix'] = '8990';
NAME_TO_NUMBER_2009['Fero & Skirmix'] = '8990';
NAME_TO_NUMBER_2009['Fero\n& Skirmix'] = '8990';

const SET_2010: Record<string, string> = {
  '7116': 'Tahu',
  '7117': 'Gresh',
  '7135': 'Takanuva',
  '7136': 'Skrall',
  '7137': 'Piraka',
  '7138': 'Rahkshi',
};

const NAME_TO_NUMBER_2010: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2010)) {
  if (!NAME_TO_NUMBER_2010[name]) NAME_TO_NUMBER_2010[name] = num;
}
NAME_TO_NUMBER_2010['Tahu'] = '7116';
NAME_TO_NUMBER_2010['Gresh'] = '7117';
NAME_TO_NUMBER_2010['Takanuva'] = '7135';
NAME_TO_NUMBER_2010['Skrall'] = '7136';
NAME_TO_NUMBER_2010['Piraka'] = '7137';
NAME_TO_NUMBER_2010['Rahkshi'] = '7138';

const SET_2015: Record<string, string> = {
  '70778': "Protector of Jungle - 'Vizuna'",
  '70779': "Protector of Stone - 'Nilkuu'",
  '70780': "Protector of Water - 'Kivoda'",
  '70781': "Protector of Earth - 'Korgot'",
  '70782': "Protector of Ice - 'Izotor'",
  '70783': "Protector of Fire - 'Narmoto'",
  '70784': 'Lewa – Master of Jungle',
  '70785': 'Pohatu – Master of Stone',
  '70786': 'Gali – Master of Water',
  '70790': 'Lord of Skull Spiders',
  '70791': 'Skull Warrior',
  '70792': 'Skull Slicer',
  '70793': 'Skull Basher',
  '70794': 'Skull Scorpio',
  '70787': 'Tahu – Master of Fire',
  '70788': 'Kopaka – Master of Ice',
  '70789': 'Onua – Master of Earth',
  '70795': 'Mask Maker vs. Skull Grinder',
  '5002941': 'Hero Pack',
  '5002942': 'Villain Pack',
  '5004459': 'Protector of Fire – Power Up',
  '5004462': 'Protector of Ice – Power Up',
  '5004463': 'Protector of Jungle – Power Up',
  '5004465': 'Protector of Stone – Power Up',
  '5004466': 'Protector of Earth – Power Up',
  '5004467': 'Protector of Water – Power Up',
};

const SET_2016: Record<string, string> = {
  '71300': 'Uxar – Creature of Jungle',
  '71301': 'Ketar – Creature of Stone',
  '71302': 'Akida – Creature of Water',
  '71303': 'Ikir – Creature of Fire',
  '71304': 'Terak – Creature of Earth',
  '71305': 'Lewa – Uniter of Jungle',
  '71306': 'Pohatu – Uniter of Stone',
  '71307': 'Gali – Uniter of Water',
  '71308': 'Tahu – Uniter of Fire',
  '71309': 'Onua – Uniter of Earth',
  '71310': 'Umarak the Hunter',
  '71311': 'Kopaka and Melum – Unity set',
  '71312': 'Ekimu the Mask Maker',
  '71313': 'Lava Beast',
  '71314': 'Storm Beast',
  '71315': 'Quake Beast',
  '71316': 'Umarak the Destroyer',
  '601601': 'Scorpion',
  '601602': 'Ekimu Falcon',
  '5004409': 'Accessory pack',
};

const NAME_TO_NUMBER_2015: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2015)) {
  if (!NAME_TO_NUMBER_2015[name]) NAME_TO_NUMBER_2015[name] = num;
}
NAME_TO_NUMBER_2015['Vizuna'] = '70778';
NAME_TO_NUMBER_2015['Nilkuu'] = '70779';
NAME_TO_NUMBER_2015['Kivoda'] = '70780';
NAME_TO_NUMBER_2015['Korgot'] = '70781';
NAME_TO_NUMBER_2015['Izotor'] = '70782';
NAME_TO_NUMBER_2015['Narmoto'] = '70783';
NAME_TO_NUMBER_2015['Lewa'] = '70784';
NAME_TO_NUMBER_2015['Pohatu'] = '70785';
NAME_TO_NUMBER_2015['Gali'] = '70786';
NAME_TO_NUMBER_2015['Tahu'] = '70787';
NAME_TO_NUMBER_2015['Kopaka'] = '70788';
NAME_TO_NUMBER_2015['Onua'] = '70789';

const NAME_TO_NUMBER_2016: Record<string, string> = {};
for (const [num, name] of Object.entries(SET_2016)) {
  if (!NAME_TO_NUMBER_2016[name]) NAME_TO_NUMBER_2016[name] = num;
}
NAME_TO_NUMBER_2016['Uxar'] = '71300';
NAME_TO_NUMBER_2016['Ketar'] = '71301';
NAME_TO_NUMBER_2016['Akida'] = '71302';
NAME_TO_NUMBER_2016['Ikir'] = '71303';
NAME_TO_NUMBER_2016['Terak'] = '71304';
NAME_TO_NUMBER_2016['Lewa'] = '71305';
NAME_TO_NUMBER_2016['Pohatu'] = '71306';
NAME_TO_NUMBER_2016['Gali'] = '71307';
NAME_TO_NUMBER_2016['Tahu'] = '71308';
NAME_TO_NUMBER_2016['Onua'] = '71309';
NAME_TO_NUMBER_2016['Kopaka'] = '71311';
NAME_TO_NUMBER_2016['Melum'] = '71311';
NAME_TO_NUMBER_2016['Kopaka & Melum'] = '71311';
NAME_TO_NUMBER_2016['Ekimu'] = '71312';
NAME_TO_NUMBER_2016['Ekimu the Mask Maker'] = '71312';

const LOOKUP: Record<number, Record<string, string>> = {
  2001: SET_2001,
  2002: SET_2002,
  2003: SET_2003,
  2004: SET_2004,
  2005: SET_2005,
  2006: SET_2006,
  2007: SET_2007,
  2008: SET_2008,
  2009: SET_2009,
  2010: SET_2010,
  2015: SET_2015,
  2016: SET_2016,
};

const NAME_LOOKUP: Record<number, Record<string, string>> = {
  2001: NAME_TO_NUMBER_2001,
  2002: NAME_TO_NUMBER_2002,
  2003: NAME_TO_NUMBER_2003,
  2004: NAME_TO_NUMBER_2004,
  2005: NAME_TO_NUMBER_2005,
  2006: NAME_TO_NUMBER_2006,
  2007: NAME_TO_NUMBER_2007,
  2008: NAME_TO_NUMBER_2008,
  2009: NAME_TO_NUMBER_2009,
  2010: NAME_TO_NUMBER_2010,
  2015: NAME_TO_NUMBER_2015,
  2016: NAME_TO_NUMBER_2016,
};

import type { SetRecord } from './sets';

/**
 * Returns display label like "8534 - Tahu" when we have a match for the set's year.
 * Falls back to "setNumber - name" or set.name when no lookup exists.
 */
export function getSetDisplayLabel(set: SetRecord): string {
  const yearKey = Number(set.year);
  const byNumber = LOOKUP[yearKey];
  const byName = NAME_LOOKUP[yearKey];

  if (byNumber && byName) {
    const setNumStr = String(set.setNumber).trim();
    const nameStr = String(set.name).trim();
    const num = /^\d+$/.test(setNumStr)
      ? setNumStr
      : byName[nameStr];
    const name = num && byNumber[num] ? byNumber[num] : nameStr;
    if (num) return `${num} - ${name}`;
  }

  if (set.setNumber && set.name && set.setNumber !== set.name)
    return `${set.setNumber} - ${set.name}`;
  return set.name || set.setNumber || 'Unknown';
}

/**
 * Returns a sort key (numeric when possible) so sets can be ordered by set number.
 */
export function getSetSortKey(set: SetRecord): number {
  const yearKey = Number(set.year);
  const byName = NAME_LOOKUP[yearKey];
  const setNumStr = String(set.setNumber).trim();
  const numStr = /^\d+$/.test(setNumStr)
    ? setNumStr
    : (byName && byName[String(set.name).trim()]) || setNumStr;
  const n = parseInt(numStr, 10);
  return Number.isNaN(n) ? 999999 : n;
}

/**
 * Best-effort canonical set number for display (e.g. "8534" for "Tahu").
 */
export function getSetNumber(set: SetRecord): string {
  const yearKey = Number(set.year);
  const byName = NAME_LOOKUP[yearKey];

  const setNumStr = String(set.setNumber ?? '').trim();
  const nameStr = String(set.name ?? '').trim();

  if (/^\d+$/.test(setNumStr)) return setNumStr;

  if (byName) {
    const mapped = byName[nameStr];
    if (mapped) return mapped;
  }

  return setNumStr || nameStr || 'Unknown';
}

/** Entries for sets in this year that are not in ownedSetNumbers (for "Missing" section). */
export function getMissingSetEntries(
  year: number,
  ownedSetNumbers: Set<string>
): { setNumber: string; name: string }[] {
  const byNumber = LOOKUP[year];
  if (!byNumber) return [];
  const entries = Object.entries(byNumber)
    .filter(([num]) => !ownedSetNumbers.has(num))
    .map(([setNumber, name]) => ({ setNumber, name }));
  entries.sort((a, b) => parseInt(a.setNumber, 10) - parseInt(b.setNumber, 10));
  return entries;
}
