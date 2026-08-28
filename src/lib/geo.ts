import { BufferAttribute, BufferGeometry, ShapeUtils, Vector2, Vector3 } from 'three'
import geo from '@/data/geo.json'

/** Rayon du globe dans la scène. Tout le reste s'exprime en multiples de ce rayon. */
export const R = 1

const DEG = Math.PI / 180

/** Anneau aplati : [lon, lat, lon, lat, …]. */
export type Ring = number[]

export const GEO = geo as {
  land: Ring[]
  benin: Ring[]
  neighbours: { iso: string; name: string; rings: Ring[]; label: [number, number] }[]
  departments: { code: string; name: string; rings: Ring[] }[]
}

/**
 * Projette une coordonnée géographique sur la sphère.
 * Convention : lon 0 / lat 0 pointe vers +Z, le pôle Nord vers +Y.
 */
export function latLonToVec3(lat: number, lon: number, r = R, target = new Vector3()) {
  const la = lat * DEG
  const lo = lon * DEG
  const c = Math.cos(la)
  return target.set(r * c * Math.sin(lo), r * Math.sin(la), r * c * Math.cos(lo))
}

/** Anneau fermé -> suite de points pour une polyligne. */
export function ringToPoints(ring: Ring, r: number): Vector3[] {
  const pts: Vector3[] = []
  for (let i = 0; i < ring.length; i += 2) {
    pts.push(latLonToVec3(ring[i + 1], ring[i], r))
  }
  if (pts.length > 1 && !pts[0].equals(pts[pts.length - 1])) pts.push(pts[0].clone())
  return pts
}

/**
 * Fusionne plusieurs anneaux en une seule géométrie de segments.
 * Un seul draw call pour les 127 anneaux de terres émergées.
 */
export function ringsToSegments(rings: Ring[], r: number): BufferGeometry {
  const verts: number[] = []
  const v = new Vector3()
  for (const ring of rings) {
    const n = ring.length / 2
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      latLonToVec3(ring[i * 2 + 1], ring[i * 2], r, v)
      verts.push(v.x, v.y, v.z)
      latLonToVec3(ring[j * 2 + 1], ring[j * 2], r, v)
      verts.push(v.x, v.y, v.z)
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
  return g
}

/**
 * Triangule des anneaux dans l'espace (lon, lat) puis projette les sommets sur la sphère.
 * À notre altitude de caméra minimale (0,155 R), la flèche d'une corde reste sous
 * l'écart radial appliqué aux surfaces — pas de z-fighting avec le globe.
 */
export function ringsToFill(rings: Ring[], r: number): BufferGeometry {
  const verts: number[] = []
  const v = new Vector3()

  for (const ring of rings) {
    const contour: Vector2[] = []
    for (let i = 0; i < ring.length; i += 2) contour.push(new Vector2(ring[i], ring[i + 1]))
    // ShapeUtils attend un contour ouvert.
    const first = contour[0]
    const last = contour[contour.length - 1]
    if (contour.length > 1 && first.equals(last)) contour.pop()
    if (contour.length < 3) continue

    for (const tri of ShapeUtils.triangulateShape(contour, [])) {
      for (const idx of tri) {
        const p = contour[idx]
        latLonToVec3(p.y, p.x, r, v)
        verts.push(v.x, v.y, v.z)
      }
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
  g.computeVertexNormals()
  return g
}

/** Graticule : parallèles et méridiens tous les `step` degrés. */
export function graticule(step = 15, r = R): BufferGeometry {
  const verts: number[] = []
  const v = new Vector3()
  const push = (lat: number, lon: number) => {
    latLonToVec3(lat, lon, r, v)
    verts.push(v.x, v.y, v.z)
  }

  for (let lat = -90 + step; lat < 90; lat += step) {
    for (let lon = -180; lon < 180; lon += 4) {
      push(lat, lon)
      push(lat, lon + 4)
    }
  }
  for (let lon = -180; lon < 180; lon += step) {
    for (let lat = -90; lat < 90; lat += 4) {
      push(lat, lon)
      push(lat + 4, lon)
    }
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
  return g
}

/** Formate un angle en degrés/minutes avec son hémisphère, comme un relevé d'instrument. */
export function formatCoord(value: number, axis: 'lat' | 'lon') {
  const hemi = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'O'
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const min = Math.round((abs - deg) * 60)
  const d = min === 60 ? deg + 1 : deg
  const m = min === 60 ? 0 : min
  return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}′${hemi}`
}
