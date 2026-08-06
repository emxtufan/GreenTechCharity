import { Language, PageData, PoiItemData, HistoryItem } from '../types';

const createPoiItems = (): PoiItemData[] => [
  { title: 'Sprijin pentru familii', href: '/wohnen/', position: [-3.5, 3.2, 0.5] },
  { title: 'Casa sustenabila', href: '/architektur/', position: [-1.2, 4.5, -2.1] },
  { title: 'Energie si mediu', href: '/nachhaltigkeit/', position: [2.1, 3.8, 1.2] },
  { title: 'Comunitatea', href: '/lage/', position: [3.8, 2.5, -1.8] },
  { title: 'Impact si transparenta', href: '/wohnungen/', position: [0.5, 5.8, -0.8] },
];

export const POI_ITEMS: Record<Language, PoiItemData[]> = {
  de: createPoiItems(),
  en: createPoiItems(),
};

const historyItems: HistoryItem[] = [
  { year: '01', text: 'Ascultam familia si evaluam nevoile reale' },
  { year: '02', text: 'Proiectam locuinta si publicam bugetul' },
  { year: '03', text: 'Construim cu materiale durabile' },
  { year: '04', text: 'Predam un camin sigur si eficient' },
  { year: '05', text: 'Masuram si publicam impactul' },
];

export const HISTORY_ITEMS: Record<Language, HistoryItem[]> = {
  de: historyItems.map((item) => ({ ...item })),
  en: historyItems.map((item) => ({ ...item })),
};

const createPagesData = (): Record<string, PageData> => ({
  index: {
    id: 'page_projekt',
    uid: 'index',
    title: 'Misiunea noastra',
    color: 'sand',
    facts: [
      {
        title: 'Oameni',
        text: 'Pornim de la nevoile reale ale familiilor aflate in dificultate.',
        column: 'Left',
      },
      {
        title: 'Sustenabilitate',
        text: 'Construim locuinte eficiente energetic, sigure si usor de intretinut.',
        column: 'Left',
      },
      {
        title: 'Transparenta',
        text: 'Aratam clar cum fiecare contributie devine parte dintr-un camin.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'GREENTECH Charity construieste locuinte sustenabile pentru familii aflate in dificultate. Fiecare proiect aduce siguranta, costuri mai mici si sansa unui nou inceput.',
      'Reunim donatori, voluntari si specialisti pentru a transforma sprijinul comunitatii in impact concret si usor de urmarit.',
    ],
    links: [
      { text: 'Vezi proiectele', url: '#' },
      { text: 'Afla cum poti ajuta', url: '#' },
    ],
  },
  wohnen: {
    id: 'page_wohnen',
    uid: 'wohnen',
    title: 'Sprijin pentru familii',
    color: 'lemon',
    pointOfInterest: true,
    facts: [
      {
        title: 'Nevoie reala',
        text: 'Selectam responsabil cazurile si intelegem situatia fiecarei familii.',
        column: 'Left',
      },
      {
        title: 'Demnitate',
        text: 'Construim un spatiu sigur, cald si adaptat vietii de zi cu zi.',
        column: 'Left',
      },
      {
        title: 'Continuitate',
        text: 'Ramanem aproape de familie si dupa predarea locuintei.',
        column: 'Right',
      },
    ],
    paragraphs: [
      'O locuinta stabila poate schimba directia unei familii. Sprijinul nostru incepe cu ascultare, continua cu un plan clar si se incheie doar atunci cand casa devine un camin.',
    ],
    links: [{ text: 'Descopera procesul', url: '#' }],
  },
  architektur: {
    id: 'page_architektur',
    uid: 'architektur',
    title: 'Casa sustenabila',
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
      'Fiecare casa GREENTECH Charity este proiectata pentru confort, lumina naturala si consum responsabil. Designul ramane simplu, functional si usor de intretinut.',
    ],
  },
  nachhaltigkeit: {
    id: 'page_nachhaltigkeit',
    uid: 'nachhaltigkeit',
    title: 'Energie si mediu',
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
      'Sustenabilitatea inseamna beneficii reale pentru familie: o casa mai sanatoasa, facturi mai mici si un impact redus asupra mediului.',
    ],
  },
  lage: {
    id: 'page_lage',
    uid: 'lage',
    title: 'Comunitatea',
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
      'O casa durabila se construieste mai bine atunci cand comunitatea lucreaza impreuna. GREENTECH Charity coordoneaza acest efort si face progresul vizibil.',
    ],
  },
  wohnungen: {
    id: 'page_wohnungen',
    uid: 'wohnungen',
    title: 'Impact si transparenta',
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
      'Transparenta transforma increderea in parteneriat. Pentru fiecare proiect prezentam nevoia, resursele, lucrarile realizate si rezultatul final.',
    ],
    links: [{ text: 'Vezi impactul', url: '#' }],
  },
  kontakt: {
    id: 'page_kontakt',
    uid: 'kontakt',
    title: 'Implica-te',
    color: 'forest',
    paragraphs: [
      'Poti sustine GREENTECH Charity printr-o donatie, voluntariat sau un parteneriat. Orice resursa oferita responsabil poate deveni ajutor concret pentru o familie.',
    ],
    links: [
      { text: 'Doneaza', url: '#' },
      { text: 'Devino partener', url: '#' },
    ],
  },
  news: {
    id: 'page_news',
    uid: 'news',
    title: 'Proiecte',
    color: 'sand',
    news: true,
    paragraphs: [
      'Urmareste etapele proiectelor GREENTECH Charity si vezi cum sprijinul comunitatii se transforma in locuinte sustenabile.',
    ],
  },
});

export const PAGES_DATA: Record<Language, Record<string, PageData>> = {
  de: createPagesData(),
  en: createPagesData(),
};

export const NAV_PAGES_KEYS = ['index', 'wohnen', 'architektur', 'nachhaltigkeit', 'lage', 'wohnungen', 'kontakt'];
