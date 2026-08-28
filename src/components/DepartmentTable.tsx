'use client'

import { useMemo } from 'react'

import { DEPARTMENTS, density } from '@/data/benin'
import { densityColor } from '@/lib/theme'
import { setHovered, useHovered } from '@/lib/hover'

const nf = new Intl.NumberFormat('fr-FR')

/**
 * Les 12 départements, classés du plus dense au moins dense.
 * Survoler une ligne éclaire le département sur la carte, et réciproquement.
 */
export function DepartmentTable() {
  const hovered = useHovered()

  const rows = useMemo(
    () =>
      [...DEPARTMENTS]
        .map((d) => ({ ...d, d: density(d), swatch: `#${densityColor(density(d)).getHexString()}` }))
        .sort((a, b) => b.d - a.d),
    [],
  )

  return (
    <div className="depts">
      <table className="depts__table">
        <caption className="depts__caption">
          Superficies et populations : recensement de 2013 (RGPH4). Survolez une ligne pour la
          situer sur la carte.
        </caption>
        <thead>
          <tr>
            <th scope="col">Département</th>
            <th scope="col">Chef-lieu</th>
            <th scope="col" className="num">
              Habitants
            </th>
            <th scope="col" className="num">
              hab/km²
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.code}
              className={hovered === r.code ? 'is-hot' : undefined}
              onMouseEnter={() => setHovered(r.code)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(r.code)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <th scope="row">
                <span className="depts__swatch" style={{ background: r.swatch }} aria-hidden />
                {r.name}
              </th>
              <td>{r.seat}</td>
              <td className="num">{nf.format(r.pop2013)}</td>
              <td className="num">{nf.format(Math.round(r.d))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="depts__legend" aria-hidden>
        <span className="depts__scale" />
        <span>33 hab/km² — Alibori</span>
        <span>8 593 — Littoral</span>
      </p>
    </div>
  )
}
