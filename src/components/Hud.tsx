'use client'

import { useEffect, useRef } from 'react'

import { EARTH_RADIUS_KM, view } from '@/lib/descent'
import { formatCoord } from '@/lib/geo'

const km = (alt: number) => {
  const value = (alt - 1) * EARTH_RADIUS_KM
  if (value >= 1000) return `${Math.round(value).toLocaleString('fr-FR')} km`
  if (value >= 10) return `${value.toFixed(0)} km`
  return `${value.toFixed(1)} km`
}

/**
 * Relevé d'instrument : la position réelle de la caméra au-dessus du globe.
 * Mis à jour dans une boucle rAF qui écrit directement dans le DOM, hors de React.
 */
export function Hud() {
  const lat = useRef<HTMLSpanElement>(null)
  const lon = useRef<HTMLSpanElement>(null)
  const alt = useRef<HTMLSpanElement>(null)
  const gauge = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    let last = ''

    const tick = () => {
      const next = `${view.lat.toFixed(3)}|${view.lon.toFixed(3)}|${view.alt.toFixed(4)}|${view.p.toFixed(3)}`
      if (next !== last) {
        last = next
        if (lat.current) lat.current.textContent = formatCoord(view.lat, 'lat')
        if (lon.current) lon.current.textContent = formatCoord(view.lon, 'lon')
        if (alt.current) alt.current.textContent = km(view.alt)
        if (gauge.current) gauge.current.style.transform = `scaleX(${Math.max(0.01, view.p)})`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <aside className="hud" aria-hidden>
      <div className="hud__gauge">
        <div className="hud__gaugeFill" ref={gauge} />
      </div>
      <dl className="hud__readout">
        <div>
          <dt>lat</dt>
          <dd>
            <span ref={lat}>16°00′N</span>
          </dd>
        </div>
        <div>
          <dt>lon</dt>
          <dd>
            <span ref={lon}>34°00′O</span>
          </dd>
        </div>
        <div>
          <dt>alt</dt>
          <dd>
            <span ref={alt}>20 387 km</span>
          </dd>
        </div>
      </dl>
    </aside>
  )
}
