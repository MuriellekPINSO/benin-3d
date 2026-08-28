/**
 * La page est une descente continue : de l'orbite basse jusqu'aux 12 départements.
 * Chaque section du document possède une station caméra (latitude, longitude, altitude).
 * Le défilement interpole entre deux stations consécutives — la position dans le texte
 * et la position au-dessus du Bénin sont la même chose.
 */

export type Station = {
  /** Latitude visée, en degrés. */
  lat: number
  /** Longitude visée, en degrés. */
  lon: number
  /** Distance au centre du globe, en rayons terrestres (1 = surface). */
  alt: number
  /**
   * Côté où se pose le texte. La caméra décale sa fenêtre de projection à l'opposé,
   * pour que le pays ne passe jamais sous le panneau.
   */
  side: 'hero' | 'left' | 'right'
}

/** Position visée du sujet à l'écran : -1 à gauche, 0 au centre, +1 à droite. */
export const biasOf = (side: Station['side']) => (side === 'left' ? 1 : side === 'right' ? -1 : 0)

export type SectionId =
  | 'orbite'
  | 'territoire'
  | 'voisins'
  | 'population'
  | 'appartenances'
  | 'departements'
  | 'economie'
  | 'patrimoine'
  | 'sources'

export const STATIONS: Record<SectionId, Station> = {
  orbite: { lat: 16, lon: -34, alt: 4.2, side: 'hero' },
  territoire: { lat: 12.5, lon: -7, alt: 2.5, side: 'right' },
  voisins: { lat: 10.2, lon: 2.31, alt: 2.05, side: 'left' },
  population: { lat: 9.4, lon: 2.31, alt: 1.6, side: 'right' },
  appartenances: { lat: 9.3, lon: 2.31, alt: 1.45, side: 'left' },
  departements: { lat: 9.3, lon: 2.31, alt: 1.33, side: 'right' },
  economie: { lat: 8.8, lon: 2.31, alt: 1.27, side: 'left' },
  patrimoine: { lat: 7.2, lon: 2.2, alt: 1.19, side: 'right' },
  sources: { lat: 9.4, lon: 2.31, alt: 1.62, side: 'left' },
}

export const SECTION_ORDER: SectionId[] = [
  'orbite',
  'territoire',
  'voisins',
  'population',
  'appartenances',
  'departements',
  'economie',
  'patrimoine',
  'sources',
]

/** Rayon terrestre moyen, pour convertir l'altitude de scène en kilomètres réels. */
export const EARTH_RADIUS_KM = 6371

/**
 * État partagé entre le DOM et la boucle de rendu.
 * Muté par un écouteur de défilement, lu dans useFrame : aucun re-render par pixel scrollé.
 */
export const view = {
  /** Progression globale du document, 0 → 1. */
  p: 0,
  /** Index fractionnaire de section : 3.4 = 40 % du chemin entre la section 3 et la 4. */
  t: 0,
  /** Station courante, écrite par la caméra à chaque frame. */
  lat: STATIONS.orbite.lat,
  lon: STATIONS.orbite.lon,
  alt: STATIONS.orbite.alt,
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** Rampe douce entre deux bornes. */
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/** Interpolation d'altitude en échelle logarithmique : le zoom paraît linéaire à l'œil. */
export const lerpAlt = (a: number, b: number, t: number) =>
  Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t)

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Station interpolée pour un index fractionnaire de section. */
export function stationAt(t: number): Station {
  const last = SECTION_ORDER.length - 1
  const i = Math.max(0, Math.min(last - 1, Math.floor(t)))
  const f = clamp01(t - i)
  const e = f * f * (3 - 2 * f) // adoucit l'arrivée sur chaque station
  const a = STATIONS[SECTION_ORDER[i]]
  const b = STATIONS[SECTION_ORDER[Math.min(last, i + 1)]]
  return {
    lat: lerp(a.lat, b.lat, e),
    lon: lerp(a.lon, b.lon, e),
    alt: lerpAlt(a.alt, b.alt, e),
    side: e < 0.5 ? a.side : b.side,
  }
}

/** Décalage du sujet à l'écran pour l'index de section donné, interpolé comme le reste. */
export function biasAt(t: number): number {
  const last = SECTION_ORDER.length - 1
  const i = Math.max(0, Math.min(last - 1, Math.floor(t)))
  const f = clamp01(t - i)
  const e = f * f * (3 - 2 * f)
  const a = biasOf(STATIONS[SECTION_ORDER[i]].side)
  const b = biasOf(STATIONS[SECTION_ORDER[Math.min(last, i + 1)]].side)
  return lerp(a, b, e)
}

/**
 * Multiplicateur d'altitude pour les écrans étroits.
 * En portrait, le champ horizontal devient contraignant : on recule pour garder le cadrage.
 */
export const framingFactor = (aspect: number) =>
  aspect >= 1 ? 1 : Math.min(1.75, 1 + (1 / aspect - 1) * 0.62)
