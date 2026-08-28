// Convertit les GeoJSON bruts (raw/) en un seul module compact consommé par la scène 3D.
// Sources :
//   raw/land110.geojson  -> Natural Earth 110m land (domaine public)
//   raw/adm0_*.geojson   -> geoBoundaries gbOpen ADM0 (frontières nationales)
//   raw/ben_adm1.geojson -> geoBoundaries gbOpen ADM1 (12 départements du Bénin)
// Usage : node scripts/build-geo.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const PRECISION = 3 // ~110 m à l'équateur, suffisant à notre altitude de caméra minimale

/** Aplatit un anneau [[lon,lat],…] en [lon,lat,lon,lat,…] arrondi. */
const flatten = (ring) => {
  const out = []
  let prev = null
  for (const [lon, lat] of ring) {
    const x = Number(lon.toFixed(PRECISION))
    const y = Number(lat.toFixed(PRECISION))
    if (prev && prev[0] === x && prev[1] === y) continue // doublons consécutifs du source
    out.push(x, y)
    prev = [x, y]
  }
  return out
}

/** Renvoie tous les anneaux extérieurs d'une géométrie Polygon ou MultiPolygon. */
const outerRings = (geometry) => {
  const polys =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
  return polys.map((poly) => flatten(poly[0])).filter((r) => r.length >= 6)
}

// --- Terres émergées (fond du globe) ------------------------------------------------
const land = read('raw/land110.geojson').features.flatMap((f) =>
  outerRings(f.geometry),
)

// --- Frontières nationales ----------------------------------------------------------
const country = (iso) => outerRings(read(`raw/adm0_${iso}.geojson`).features[0].geometry)

const benin = country('BEN')
const neighbours = [
  { iso: 'TGO', name: 'Togo', rings: country('TGO'), label: [0.95, 8.4] },
  { iso: 'NGA', name: 'Nigeria', rings: country('NGA'), label: [4.9, 8.2] },
  { iso: 'NER', name: 'Niger', rings: country('NER'), label: [3.7, 13.4] },
  { iso: 'BFA', name: 'Burkina Faso', rings: country('BFA'), label: [-1.1, 12.5] },
]

// --- Départements -------------------------------------------------------------------
// geoBoundaries orthographie certains noms sans accent ni graphie officielle.
const DEPT_META = {
  Alibori: { code: 'AL' },
  Atakora: { code: 'AK', name: 'Atacora' },
  Atlanique: { code: 'AQ', name: 'Atlantique' },
  Borgou: { code: 'BO' },
  Collines: { code: 'CL' },
  Kouffo: { code: 'CF', name: 'Couffo' },
  Donga: { code: 'DO' },
  Littoral: { code: 'LI' },
  Mono: { code: 'MO' },
  Oueme: { code: 'OU', name: 'Ouémé' },
  Plateau: { code: 'PL' },
  Zou: { code: 'ZO' },
}

const departments = read('raw/ben_adm1.geojson').features.map((f) => {
  const raw = f.properties.shapeName
  const meta = DEPT_META[raw]
  if (!meta) throw new Error(`Département inconnu dans le GeoJSON : ${raw}`)
  return { code: meta.code, name: meta.name ?? raw, rings: outerRings(f.geometry) }
})

if (departments.length !== 12) {
  throw new Error(`12 départements attendus, ${departments.length} trouvés`)
}

const payload = { land, benin, neighbours, departments }
const target = join(root, 'src/data/geo.json')
writeFileSync(target, JSON.stringify(payload))

const points = (rings) => rings.reduce((n, r) => n + r.length / 2, 0)
console.log(`geo.json écrit — ${(readFileSync(target).length / 1024).toFixed(0)} Ko`)
console.log(`  terres      ${land.length} anneaux / ${points(land)} points`)
console.log(`  Bénin       ${benin.length} anneaux / ${points(benin)} points`)
console.log(`  voisins     ${neighbours.length}`)
console.log(`  départements ${departments.length} / ${departments.reduce((n, d) => n + points(d.rings), 0)} points`)
