import { Language, PageData, PoiItemData, HistoryItem } from '../types';

const createPoiItems = (): PoiItemData[] => [
  {
    title: 'Familia este punctul de plecare',
    href: '/sprijin-pentru-familii/',
    position: [-3.5, 3.2, 0.5],
  },
  {
    title: 'O casa gandita pe termen lung',
    href: '/casa-sustenabila/',
    position: [-1.2, 4.5, -2.1],
  },
  {
    title: 'Energie care reduce costurile',
    href: '/confort-si-siguranta/',
    position: [2.1, 3.8, 1.2],
  },
  { title: 'Construim impreuna', href: '/voluntariat/', position: [3.8, 2.5, -1.8] },
  {
    title: 'Impact pe care il poti urmari',
    href: '/impact/',
    position: [0.5, 5.8, -0.8],
  },
];

export const POI_ITEMS: Record<Language, PoiItemData[]> = {
  de: createPoiItems(),
  en: createPoiItems(),
};

const historyItems: HistoryItem[] = [
  { year: '01', text: 'Ascultam familia si evaluam nevoile reale' },
  { year: '02', text: 'Proiectam locuinta si publicam obiectivul si bugetul' },
  { year: '03', text: 'Construim cu materiale durabile' },
  { year: '04', text: 'Predam caminul si sprijinim mutarea' },
  { year: '05', text: 'Urmarim consumul si publicam rezultatele' },
];

export const HISTORY_ITEMS: Record<Language, HistoryItem[]> = {
  de: historyItems.map((item) => ({ ...item })),
  en: historyItems.map((item) => ({ ...item })),
};

const createPagesData = (): Record<string, PageData> => ({
  index: {
    id: 'page_projekt',
    uid: 'index',
    title: 'Construim siguranta, casa cu casa',
    color: 'sand',
    facts: [
      {
        title: 'Familia',
        text: 'Ascultam, verificam nevoia si stabilim impreuna prioritatile.',
        column: 'Left',
      },
      {
        title: 'Caminul',
        text: 'Proiectam o locuinta sigura, eficienta si usor de intretinut.',
        column: 'Left',
      },
      {
        title: 'Increderea',
        text: 'Publicam obiectivul, bugetul, progresul si rezultatul proiectului.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'GREENTECH Charity transforma contributiile comunitatii in locuinte sustenabile pentru familii aflate in dificultate.',
      'Reunim familia, donatorii, voluntarii si specialistii intr-un proces clar, de la evaluarea nevoii pana la predarea caminului.',
    ],
    links: [
      { text: 'Vezi proiectele', url: '/procesul-proiectului/' },
      { text: 'Afla cum poti ajuta', url: '/voluntariat/' },
    ],
  },
  wohnen: {
    id: 'page_wohnen',
    uid: 'wohnen',
    title: 'Familia este punctul de plecare',
    color: 'lemon',
    pointOfInterest: true,
    facts: [
      {
        title: 'Nevoie reala',
        text: 'Verificam responsabil situatia si intelegem prioritatile familiei.',
        column: 'Left',
      },
      {
        title: 'Demnitate',
        text: 'Construim un spatiu sigur si adaptat vietii de zi cu zi.',
        column: 'Left',
      },
      {
        title: 'Continuitate',
        text: 'Ramanem aproape de familie si dupa predarea locuintei.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'Nu pornim de la un model de casa, ci de la oamenii care vor locui in ea. Sprijinul incepe cu ascultare, continua cu un plan clar si ramane activ dupa predarea caminului.',
    ],
    links: [{ text: 'Descopera procesul', url: '#' }],
  },
  architektur: {
    id: 'page_architektur',
    uid: 'architektur',
    title: 'O casa gandita pe termen lung',
    color: 'forest',
    pointOfInterest: true,
    facts: [
      {
        title: 'Siguranta',
        text: 'Folosim solutii verificate si materiale alese pentru o viata lunga.',
        column: 'Left',
      },
      {
        title: 'Eficienta',
        text: 'Reducem pierderile de energie si costurile lunare ale familiei.',
        column: 'Left',
      },
      {
        title: 'Adaptare',
        text: 'Organizam spatiile in functie de nevoile reale ale beneficiarilor.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'Fiecare locuinta GREENTECH Charity echilibreaza siguranta, costurile de utilizare si impactul asupra mediului. Alegem solutii care ajuta familia zi de zi.',
    ],
  },
  nachhaltigkeit: {
    id: 'page_nachhaltigkeit',
    uid: 'nachhaltigkeit',
    title: 'Energie care reduce costurile',
    color: 'lemon',
    pointOfInterest: true,
    facts: [
      {
        title: 'Energie curata',
        text: 'Integram surse regenerabile acolo unde proiectul permite.',
        column: 'Left',
      },
      {
        title: 'Consum redus',
        text: 'Izolatia si instalatiile eficiente reduc cheltuielile pe termen lung.',
        column: 'Left',
      },
      {
        title: 'Spatii verzi',
        text: 'Cream zone cu umbra si vegetatie simpla, potrivita locului.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'Eficienta energetica inseamna temperatura stabila, cheltuieli mai usor de sustinut si un impact redus asupra mediului.',
    ],
  },
  lage: {
    id: 'page_lage',
    uid: 'lage',
    title: 'Construim impreuna',
    color: 'sand',
    pointOfInterest: true,
    facts: [
      {
        title: 'Aproape de oameni',
        text: 'Lucram local si pastram legatura directa cu familia sprijinita.',
        column: 'Left',
      },
      {
        title: 'Parteneri',
        text: 'Implicam specialisti, companii si organizatii de incredere.',
        column: 'Left',
      },
      {
        title: 'Sprijin comun',
        text: 'Fiecare contributie completeaza efortul intregii comunitati.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'Donatorii, voluntarii, specialistii si partenerii locali au roluri clare in acelasi proiect. GREENTECH Charity coordoneaza contributiile si face progresul vizibil.',
    ],
  },
  wohnungen: {
    id: 'page_wohnungen',
    uid: 'wohnungen',
    title: 'Impact pe care il poti urmari',
    color: 'lemon',
    pointOfInterest: true,
    facts: [
      {
        title: 'Etape publice',
        text: 'Comunicam progresul de la evaluare pana la predarea casei.',
        column: 'Left',
      },
      {
        title: 'Buget clar',
        text: 'Aratam cum sunt folosite donatiile in fiecare etapa.',
        column: 'Left',
      },
      {
        title: 'Rezultate',
        text: 'Documentam impactul concret pentru familie si comunitate.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'Pentru fiecare proiect prezentam nevoia documentata, bugetul, progresul lucrarilor si rezultatul final, respectand confidentialitatea familiei.',
    ],
    links: [{ text: 'Vezi impactul', url: '/impact/' }],
  },
  kontakt: {
    id: 'page_kontakt',
    uid: 'kontakt',
    title: 'Contact',
    color: 'forest',
    paragraphs: [
      'Sediu: Calea Floreasca 194, Sector 1, 014472 Bucuresti, Romania.',
      'E-mail: help@greentechcharity.ro',
    ],
    links: [
      { text: 'Trimite un e-mail', url: 'mailto:help@greentechcharity.ro' },
      { text: 'Site web GREENTECH', url: 'https://greentechpro.ro/' },
    ],
  },
  news: {
    id: 'page_news',
    uid: 'news',
    title: 'Proiecte',
    color: 'sand',
    news: true,
    paragraphs: [
      'Urmareste traseul unui proiect GREENTECH Charity, de la evaluarea nevoii pana la predarea caminului si publicarea rezultatelor.',
    ],
  },
});

export const PAGES_DATA: Record<Language, Record<string, PageData>> = {
  de: createPagesData(),
  en: createPagesData(),
};

export const NAV_PAGES_KEYS = ['index', 'wohnen', 'architektur', 'nachhaltigkeit', 'lage', 'wohnungen', 'kontakt'];
