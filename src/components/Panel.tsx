import type { ReactNode } from 'react'

import { STATIONS, type SectionId } from '@/lib/descent'
import { formatCoord } from '@/lib/geo'
import { EARTH_RADIUS_KM } from '@/lib/descent'
import { SOURCES, type Stat } from '@/data/benin'

const SOURCE_SHORT: Record<keyof typeof SOURCES, string> = {
  wb: 'Banque mondiale',
  rgph4: 'INStaD · RGPH4',
  geoboundaries: 'geoBoundaries',
  naturalearth: 'Natural Earth',
  unesco: 'UNESCO',
  factbook: 'CIA World Factbook',
  wikipedia: 'Wikipédia · Bénin',
}

/**
 * Repère de section. Ce ne sont pas des numéros décoratifs : c'est la station
 * caméra réellement atteinte quand la section arrive au centre de l'écran.
 */
function Station({ id }: { id: SectionId }) {
  const s = STATIONS[id]
  const above = (s.alt - 1) * EARTH_RADIUS_KM
  return (
    <p className="station">
      <span>{formatCoord(s.lat, 'lat')}</span>
      <span>{formatCoord(s.lon, 'lon')}</span>
      <span className="station__alt">
        {above >= 1000
          ? `${Math.round(above).toLocaleString('fr-FR')} km`
          : `${above.toFixed(0)} km`}
      </span>
    </p>
  )
}

export function Panel({
  id,
  title,
  lede,
  children,
}: {
  id: SectionId
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
}) {
  // Le côté du texte et le décalage de la caméra viennent de la même station :
  // impossible qu'ils se désynchronisent.
  const side = STATIONS[id].side

  return (
    <section id={id} className={`panel panel--${side}`} aria-labelledby={`${id}-title`}>
      <div className="panel__card">
        <Station id={id} />
        <h2 className="panel__title" id={`${id}-title`}>
          {title}
        </h2>
        {lede ? <p className="panel__lede">{lede}</p> : null}
        {children}
      </div>
    </section>
  )
}

export function Stats({ items }: { items: Stat[] }) {
  return (
    <ul className="stats">
      {items.map((s) => (
        <li className="stat" key={s.key}>
          <p className="stat__label">{s.label}</p>
          <p className="stat__value">
            {s.value}
            {s.unit ? <span className="stat__unit">{s.unit}</span> : null}
          </p>
          <p className="stat__note">{s.note}</p>
          <p className="stat__source">{SOURCE_SHORT[s.source]}</p>
        </li>
      ))}
    </ul>
  )
}
