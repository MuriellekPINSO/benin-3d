import { Color } from 'three'

/**
 * Palette tirée des matières du pays : nuit et indigo des tissus teints, kaolin des
 * autels vodun, latérite des pistes du nord, laiton des fontes d'Abomey, palmeraie.
 * Ces valeurs sont dupliquées dans globals.css — les deux doivent rester alignées.
 */
export const COLORS = {
  ink: '#05080F',
  indigo: '#16224A',
  indigoLit: '#2B3C74',
  chalk: '#F1EBDD',
  laterite: '#C9552C',
  brass: '#E0A83C',
  palm: '#2E8B6B',
} as const

/**
 * Échelle de densité. La clarté augmente de façon monotone avec la densité :
 * l'œil lit « plus clair = plus dense » sans avoir à consulter la légende.
 * Nuit indigo (Alibori, 33 hab/km²) → latérite → laiton (Littoral, 8 593).
 */
export const DENSITY_RAMP = ['#101A3C', '#33306A', '#773E52', '#B45733', '#E8A93E']

const RAMP = DENSITY_RAMP.map((c) => new Color(c))

/**
 * Couleur d'un département d'après sa densité de population.
 * Échelle logarithmique : 33 hab/km² dans l'Alibori, 8 593 dans le Littoral.
 */
export function densityColor(density: number): Color {
  const LOW = Math.log10(30)
  const HIGH = Math.log10(9000)
  const t = Math.max(0, Math.min(1, (Math.log10(density) - LOW) / (HIGH - LOW)))
  const scaled = t * (RAMP.length - 1)
  const i = Math.min(RAMP.length - 2, Math.floor(scaled))
  return new Color().lerpColors(RAMP[i], RAMP[i + 1], scaled - i)
}
