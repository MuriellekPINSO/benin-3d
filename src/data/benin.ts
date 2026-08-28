// Toutes les valeurs de ce fichier sont sourcées. Chaque chiffre porte son millésime :
// une donnée sans année n'a pas sa place ici.

export type Source = { id: string; label: string; url: string }

export const SOURCES: Record<string, Source> = {
  wb: {
    id: 'wb',
    label: 'Banque mondiale — World Development Indicators',
    url: 'https://data.worldbank.org/country/benin',
  },
  rgph4: {
    id: 'rgph4',
    label: 'INStaD — Recensement général de la population et de l’habitation (RGPH4, 2013)',
    url: 'https://instad.bj/statistiques/statistiques-demographiques',
  },
  geoboundaries: {
    id: 'geoboundaries',
    label: 'geoBoundaries (gbOpen) — frontières nationales et départementales',
    url: 'https://www.geoboundaries.org/',
  },
  naturalearth: {
    id: 'naturalearth',
    label: 'Natural Earth — terres émergées 1:110m',
    url: 'https://www.naturalearthdata.com/',
  },
  unesco: {
    id: 'unesco',
    label: 'UNESCO — Liste du patrimoine mondial',
    url: 'https://whc.unesco.org/fr/etatsparties/bj',
  },
  factbook: {
    id: 'factbook',
    label: 'CIA World Factbook — Bénin, section Geography',
    url: 'https://www.cia.gov/the-world-factbook/countries/benin/',
  },
  wikipedia: {
    id: 'wikipedia',
    label: 'Wikipédia — Bénin, article de synthèse citant les sources géographiques nationales',
    url: 'https://fr.wikipedia.org/wiki/B%C3%A9nin',
  },
}

export const IDENTITY = {
  former: 'République du Dahomey jusqu’en 1975',
  independence: '1er août 1960',
  capital: 'Porto-Novo',
  seat: 'Cotonou',
  currency: 'Franc CFA (XOF), arrimé à l’euro',
}

export type Stat = {
  key: string
  value: string
  unit?: string
  label: string
  note: string
  source: keyof typeof SOURCES
}

/** Forme et emprise du territoire. */
export const TERRITORY: Stat[] = [
  {
    key: 'area',
    value: '114 763',
    unit: 'km²',
    label: 'Superficie',
    note: 'Chiffre national. Le World Factbook retient 112 622 km²',
    source: 'wikipedia',
  },
  {
    key: 'ns',
    value: '672',
    unit: 'km',
    label: 'Du nord au sud',
    note: 'Du fleuve Niger à l’Atlantique',
    source: 'wikipedia',
  },
  {
    key: 'ew',
    value: '324',
    unit: 'km',
    label: 'Largeur maximale',
    note: 'Dans la partie septentrionale',
    source: 'wikipedia',
  },
  {
    key: 'coast',
    value: '121',
    unit: 'km',
    label: 'Façade atlantique',
    note: 'Golfe de Guinée, côte rectiligne et sableuse',
    source: 'factbook',
  },
  {
    key: 'peak',
    value: '658',
    unit: 'm',
    label: 'Point culminant',
    note: 'Mont Sokbaro, Atacora. Le World Factbook retient 675 m',
    source: 'wikipedia',
  },
  {
    key: 'forest',
    value: '26,5',
    unit: '%',
    label: 'Couvert forestier',
    note: 'Part du territoire, 2023',
    source: 'wb',
  },
]

/** Population et société. */
export const PEOPLE: Stat[] = [
  {
    key: 'pop',
    value: '14 814 460',
    label: 'Habitants',
    note: 'Estimation 2025',
    source: 'wb',
  },
  {
    key: 'census',
    value: '10 008 749',
    label: 'Recensés en 2013',
    note: 'RGPH4, résultats définitifs publiés en juin 2015',
    source: 'rgph4',
  },
  {
    key: 'density',
    value: '129',
    unit: 'hab/km²',
    label: 'Densité moyenne',
    note: 'Population 2025 rapportée à la superficie',
    source: 'wb',
  },
  {
    key: 'young',
    value: '41,3',
    unit: '%',
    label: 'Moins de 15 ans',
    note: 'Estimation 2025',
    source: 'wb',
  },
  {
    key: 'urban',
    value: '53,4',
    unit: '%',
    label: 'Population urbaine',
    note: 'Estimation 2025',
    source: 'wb',
  },
  {
    key: 'life',
    value: '61,0',
    unit: 'ans',
    label: 'Espérance de vie',
    note: 'À la naissance, 2024',
    source: 'wb',
  },
]

/** Économie. */
export const ECONOMY: Stat[] = [
  {
    key: 'gdp',
    value: '24,6',
    unit: 'Mds USD',
    label: 'Produit intérieur brut',
    note: 'Prix courants, 2025',
    source: 'wb',
  },
  {
    key: 'gdppc',
    value: '1 658',
    unit: 'USD',
    label: 'PIB par habitant',
    note: 'Prix courants, 2025',
    source: 'wb',
  },
  {
    key: 'elec',
    value: '59',
    unit: '%',
    label: 'Accès à l’électricité',
    note: 'Part de la population, 2024',
    source: 'wb',
  },
]

export type Department = {
  code: string
  name: string
  seat: string
  /** km², RGPH4 */
  area: number
  /** habitants, RGPH4 2013 */
  pop2013: number
}

/** Les 12 départements. Superficies et populations : RGPH4 (2013). */
export const DEPARTMENTS: Department[] = [
  { code: 'AL', name: 'Alibori', seat: 'Kandi', area: 26242, pop2013: 867463 },
  { code: 'AK', name: 'Atacora', seat: 'Natitingou', area: 20499, pop2013: 772262 },
  { code: 'AQ', name: 'Atlantique', seat: 'Allada', area: 3233, pop2013: 1398229 },
  { code: 'BO', name: 'Borgou', seat: 'Parakou', area: 25856, pop2013: 1214249 },
  { code: 'CL', name: 'Collines', seat: 'Dassa-Zoumè', area: 13931, pop2013: 716558 },
  { code: 'CF', name: 'Couffo', seat: 'Aplahoué', area: 2404, pop2013: 741895 },
  { code: 'DO', name: 'Donga', seat: 'Djougou', area: 11126, pop2013: 543130 },
  { code: 'LI', name: 'Littoral', seat: 'Cotonou', area: 79, pop2013: 678874 },
  { code: 'MO', name: 'Mono', seat: 'Lokossa', area: 1605, pop2013: 497243 },
  { code: 'OU', name: 'Ouémé', seat: 'Porto-Novo', area: 1281, pop2013: 1100404 },
  { code: 'PL', name: 'Plateau', seat: 'Pobè', area: 3264, pop2013: 624146 },
  { code: 'ZO', name: 'Zou', seat: 'Abomey', area: 5243, pop2013: 851623 },
]

export const density = (d: Department) => d.pop2013 / d.area

export type City = {
  name: string
  lat: number
  lon: number
  role?: string
  /** Rang d'affichage : 0 = toujours visible, 1 = apparaît à l'approche. */
  tier: 0 | 1
  /** Côté où se pose le nom, par rapport au point. */
  align?: 'left' | 'right'
  /** Ajustement en pixels, pour séparer les villes serrées du littoral. */
  nudge?: [number, number]
}

export const CITIES: City[] = [
  { name: 'Porto-Novo', lat: 6.4969, lon: 2.6289, role: 'Capitale', tier: 0, nudge: [0, -10] },
  {
    name: 'Cotonou',
    lat: 6.3703,
    lon: 2.3912,
    role: 'Siège du gouvernement',
    tier: 0,
    align: 'left',
    nudge: [-4, 16],
  },
  { name: 'Parakou', lat: 9.3372, lon: 2.6303, tier: 0 },
  { name: 'Natitingou', lat: 10.3042, lon: 1.3796, tier: 1, align: 'left' },
  { name: 'Kandi', lat: 11.1342, lon: 2.9386, tier: 1 },
  { name: 'Djougou', lat: 9.7085, lon: 1.666, tier: 1, align: 'left' },
  { name: 'Abomey', lat: 7.1826, lon: 1.9912, tier: 1, align: 'left' },
  { name: 'Ouidah', lat: 6.3667, lon: 2.0833, tier: 1, align: 'left', nudge: [-4, -12] },
]

/** Frontières terrestres, en kilomètres. Total : 2 123 km. */
export type Neighbour = {
  name: string
  bearing: string
  km: number
  detail: string
}

export const NEIGHBOURS: Neighbour[] = [
  {
    name: 'Nigeria',
    bearing: 'Est',
    km: 809,
    detail: 'La plus longue des quatre, du Plateau à l’Alibori.',
  },
  {
    name: 'Togo',
    bearing: 'Ouest',
    km: 651,
    detail: 'Le mont Sokbaro, point culminant du pays, est sur cette frontière.',
  },
  {
    name: 'Burkina Faso',
    bearing: 'Nord-ouest',
    km: 386,
    detail: 'Savane partagée du complexe W-Arly-Pendjari.',
  },
  {
    name: 'Niger',
    bearing: 'Nord-est',
    km: 277,
    detail: 'La plus courte. Le fleuve Niger tient lieu de frontière.',
  },
]

export const BORDERS_TOTAL_KM = 2123

export type Heritage = {
  name: string
  where: string
  detail: string
  year?: string
}

/** Sites inscrits au patrimoine mondial de l'UNESCO, et repères associés. */
export const HERITAGE: Heritage[] = [
  {
    name: 'Palais royaux d’Abomey',
    where: 'Abomey, Zou',
    detail:
      'Douze palais de terre bâtis par les rois du Danhomè entre 1625 et 1900, sur 40 hectares.',
    year: 'Inscrit en 1985',
  },
  {
    name: 'Complexe W-Arly-Pendjari',
    where: 'Atacora et Alibori',
    detail:
      'Savane ouest-africaine partagée avec le Burkina Faso et le Niger. Dernière population d’éléphants et de lions de la région.',
    year: 'Inscrit en 2017',
  },
  {
    name: 'Ganvié',
    where: 'Lac Nokoué, Atlantique',
    detail:
      'Cité lacustre bâtie sur pilotis au XVIIIᵉ siècle par les Tofinu pour échapper aux razzias. Environ 30 000 habitants.',
  },
  {
    name: 'Ouidah',
    where: 'Atlantique',
    detail:
      'Point de départ de la route des esclaves vers les Amériques, et l’un des foyers du culte vodun.',
  },
]

/** Appartenances religieuses déclarées, RGPH4 (2013). En % de la population. */
export const RELIGIONS: { name: string; share: number }[] = [
  { name: 'Islam', share: 27.7 },
  { name: 'Catholicisme', share: 25.5 },
  { name: 'Vodun', share: 11.6 },
  { name: 'Christianisme céleste', share: 6.7 },
  { name: 'Sans affiliation', share: 5.8 },
]

/** Groupes de population, RGPH3 (2002) — dernier recensement à publier cette ventilation. */
export const PEOPLES: { name: string; share: number }[] = [
  { name: 'Fon', share: 39.2 },
  { name: 'Adja', share: 15.2 },
  { name: 'Yoruba', share: 12.3 },
  { name: 'Bariba', share: 9.2 },
  { name: 'Batammariba', share: 6.1 },
  { name: 'Yoms', share: 5.5 },
  { name: 'Peuls', share: 4.0 },
]
