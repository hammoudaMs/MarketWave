import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID || null,
  cronSchedule: process.env.CRON_SCHEDULE || '0 7 * * *',
  timezone: process.env.TZ || 'Africa/Tunis',
  dbPath: process.env.DB_PATH || 'data/subventions.db',
  requestTimeoutMs: 25000,
  userAgent:
    'TunisiaSubventionBot/1.0 (+https://github.com; personal monitoring bot)',
};

export const sectors = {
  it: {
    label: 'IT / Numérique',
    keywords: [
      'informatique',
      'tic',
      'digital',
      'numérique',
      'numerique',
      'startup',
      'innovation',
      'technologie',
      'logiciel',
      'software',
      'intelligence artificielle',
      'ia',
      'tech',
      'tic',
      'ict',
      'proof-of-concept',
      'poc',
      'r&d',
      'recherche',
    ],
  },
  textile: {
    label: 'Textile / Broderie',
    keywords: [
      'textile',
      'broderie',
      'embroidery',
      'artisanat',
      'habillement',
      'mode',
      'couture',
      'tapisserie',
      'fonapra',
      'fonapram',
      'petits métiers',
      'petits metiers',
      'artisanat d\'art',
      'industrie textile',
    ],
  },
};

export const financiniSectors = [
  { id: 2, category: 'it', label: 'TIC' },
  { id: 15, category: 'it', label: 'Innovation' },
  { id: 14, category: 'textile', label: 'Artisanat' },
  { id: 3, category: 'textile', label: 'Industrie' },
];

export const startupPrograms = [
  {
    title: 'AIR — Subvention Proof-of-Concept (30 000 TND)',
    url: 'https://startup.gov.tn/index.php/fr/startup_ecosystem/flywheel/air',
    category: 'it',
    summary:
      'Subvention pour startups en phase POC technologique et innovante. Couvre achats de biens et services.',
    type: 'subvention',
    status: 'open',
  },
  {
    title: 'AIR² — Subvention Scale-up (150 000 – 200 000 TND)',
    url: 'https://startup.gov.tn/index.php/fr/startup_ecosystem/flywheel/air2',
    category: 'it',
    summary:
      'Soutien pour startups ayant levé des fonds seed, en préparation Series A.',
    type: 'subvention',
    status: 'open',
  },
  {
    title: 'DEAL — Subvention programmes incubation / accélération',
    url: 'https://startup.gov.tn/index.php/fr/startup_ecosystem/flywheel/deal',
    category: 'it',
    summary: 'Financement de nouveaux programmes d\'accompagnement de startups.',
    type: 'subvention',
    status: 'open',
  },
  {
    title: 'Startup Act — Avantages et label startup',
    url: 'https://startup.gov.tn/index.php/fr/startup_act/discover',
    category: 'it',
    summary:
      'Cadre légal et avantages fiscaux pour startups innovantes en Tunisie.',
    type: 'programme',
    status: 'open',
  },
];
