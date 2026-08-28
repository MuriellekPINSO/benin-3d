'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import {
  AdditiveBlending,
  BackSide,
  Color,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three'

import { CITIES, DEPARTMENTS, density } from '@/data/benin'
import { GEO, latLonToVec3, graticule, ringToPoints, ringsToFill, ringsToSegments } from '@/lib/geo'
import { COLORS, densityColor } from '@/lib/theme'
import {
  SECTION_ORDER,
  biasAt,
  clamp01,
  framingFactor,
  smoothstep,
  stationAt,
  view,
  type SectionId,
} from '@/lib/descent'
import { getHovered, setHovered } from '@/lib/hover'

/**
 * Repère de section, en index. Les seuils d'apparition s'expriment par rapport à une
 * section nommée plutôt qu'en nombres bruts : insérer une section ne les décale plus.
 */
const at = (id: SectionId) => SECTION_ORDER.indexOf(id)

// Décalages radiaux : chaque couche a son épaisseur de vernis, pour éviter le z-fighting.
const RADIUS = {
  graticule: 1.0004,
  land: 1.0012,
  neighbour: 1.0022,
  beninFill: 1.0034,
  deptFill: 1.0046,
  deptLine: 1.0058,
  beninLine: 1.007,
  pin: 1.008,
}

/* ------------------------------------------------------------------ caméra */

export function Rig({ reduced }: { reduced: boolean }) {
  const current = useRef({ ...stationAt(0), bias: 0 })

  // La caméra et la taille du canevas sont lues sur l'état de frame : c'est la boucle
  // de rendu qui les possède, pas React.
  useFrame(({ camera, size, clock }, delta) => {
    const dt = Math.min(delta, 0.1)
    const target = stationAt(view.t)

    // En orbite, une dérive lente en longitude donne du corps à la scène.
    // Elle s'éteint dès que la descente commence.
    const drift = reduced
      ? 0
      : Math.sin(clock.elapsedTime * 0.06) * 7 * (1 - smoothstep(0, 1, view.t))

    // Le cadrage se mesure au-dessus de la surface, pas depuis le centre.
    const framed = 1 + (target.alt - 1) * framingFactor(size.width / size.height)

    const c = current.current
    const lambda = reduced ? 12 : 3.6
    c.lat = MathUtils.damp(c.lat, target.lat, lambda, dt)
    c.lon = MathUtils.damp(c.lon, target.lon + drift, lambda, dt)
    c.alt = MathUtils.damp(c.alt, framed, lambda, dt)

    latLonToVec3(c.lat, c.lon, c.alt, camera.position)
    camera.lookAt(0, 0, 0)

    // Le sujet se décale à l'opposé du panneau de texte. En écran étroit le panneau
    // est en bas : le décalage devient vertical.
    const portrait = size.width < 900
    c.bias = MathUtils.damp(c.bias, biasAt(view.t), lambda, dt)
    const dx = portrait ? 0 : -c.bias * size.width * 0.19
    const dy = portrait ? Math.abs(c.bias) * size.height * 0.17 : 0
    camera.setViewOffset(size.width, size.height, dx, dy, size.width, size.height)

    const above = Math.max(c.alt - 1, 0.02)
    camera.near = MathUtils.clamp(above * 0.06, 0.002, 0.4)
    camera.far = c.alt + 2.5
    camera.updateProjectionMatrix()

    view.lat = c.lat
    view.lon = c.lon
    view.alt = c.alt
  })

  return null
}

/* ------------------------------------------------------------------ globe */

const GLOBE_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Le corps du globe : pas de texture, un simple terminateur entre nuit et indigo.
const GLOBE_FRAG = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uLit;
  varying vec3 vNormal;
  void main() {
    float d = dot(normalize(vNormal), normalize(vec3(-0.45, 0.55, 0.75)));
    gl_FragColor = vec4(mix(uDeep, uLit, smoothstep(-0.35, 0.95, d)), 1.0);
  }
`

const RIM_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const RIM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.2);
    gl_FragColor = vec4(uColor, f * 0.85);
  }
`

function Globe() {
  const land = useMemo(() => ringsToSegments(GEO.land, RADIUS.land), [])
  const grid = useMemo(() => graticule(15, RADIUS.graticule), [])
  const landMat = useRef<LineBasicMaterial>(null)
  const gridMat = useRef<LineBasicMaterial>(null)

  const uniforms = useMemo(
    () => ({
      globe: { uDeep: { value: new Color('#070C1E') }, uLit: { value: new Color('#1D2C60') } },
      rim: { uColor: { value: new Color('#5C7BC9') } },
    }),
    [],
  )

  useFrame(() => {
    // Les terres et le graticule sont un décor d'orbite : ils s'effacent à l'approche.
    if (landMat.current) landMat.current.opacity = 0.38 - 0.3 * smoothstep(at('voisins') - 0.6, at('departements') - 1.6, view.t)
    if (gridMat.current) gridMat.current.opacity = 0.13 * (1 - smoothstep(at('territoire') - 0.4, at('voisins') + 0.4, view.t))
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial vertexShader={GLOBE_VERT} fragmentShader={GLOBE_FRAG} uniforms={uniforms.globe} />
      </mesh>

      <mesh scale={1.035}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={RIM_VERT}
          fragmentShader={RIM_FRAG}
          uniforms={uniforms.rim}
          transparent
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <lineSegments geometry={grid}>
        <lineBasicMaterial ref={gridMat} color={COLORS.indigoLit} transparent depthWrite={false} />
      </lineSegments>

      <lineSegments geometry={land}>
        <lineBasicMaterial ref={landMat} color={COLORS.chalk} transparent depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/* ------------------------------------------------- pays voisins et frontières */

function Neighbours() {
  const geometry = useMemo(
    () => ringsToSegments(GEO.neighbours.flatMap((n) => n.rings), RADIUS.neighbour),
    [],
  )
  const mat = useRef<LineBasicMaterial>(null)

  useFrame(() => {
    if (mat.current) {
      mat.current.opacity =
        0.4 *
        smoothstep(at('voisins') - 0.9, at('voisins') + 0.1, view.t) *
        (1 - 0.35 * smoothstep(at('departements') - 0.6, at('departements') + 0.6, view.t))
    }
  })

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={mat} color={COLORS.chalk} transparent depthWrite={false} />
    </lineSegments>
  )
}

/* ------------------------------------------------------------------ le Bénin */

function BeninBody() {
  const fill = useMemo(() => ringsToFill(GEO.benin, RADIUS.beninFill), [])
  const outline = useMemo(() => ringToPoints(GEO.benin[0], RADIUS.beninLine), [])
  const fillMat = useRef<MeshBasicMaterial>(null)
  const fillMesh = useRef<Mesh>(null)
  const lineRef = useRef<{ material: { opacity: number } }>(null)

  useFrame(() => {
    // La surface pleine cède la place au découpage départemental.
    const o =
      0.82 *
      smoothstep(at('territoire') - 0.5, at('territoire') + 0.6, view.t) *
      (1 - smoothstep(at('departements') - 0.8, at('departements') + 0.05, view.t))
    if (fillMat.current) fillMat.current.opacity = o
    if (fillMesh.current) fillMesh.current.visible = o > 0.01
    if (lineRef.current) lineRef.current.material.opacity = smoothstep(at('territoire') - 0.6, at('territoire') + 0.4, view.t)
  })

  return (
    <group>
      <mesh ref={fillMesh} geometry={fill}>
        <meshBasicMaterial ref={fillMat} color={COLORS.laterite} transparent depthWrite={false} />
      </mesh>
      <Line
        ref={lineRef as never}
        points={outline}
        color={COLORS.brass}
        lineWidth={1.8}
        transparent
        depthWrite={false}
      />
    </group>
  )
}

/** Les 12 départements, teintés par densité de population (RGPH4, 2013). */
function Departments() {
  const parts = useMemo(
    () =>
      GEO.departments.map((d) => {
        const meta = DEPARTMENTS.find((x) => x.code === d.code)!
        return {
          code: d.code,
          name: meta.name,
          geometry: ringsToFill(d.rings, RADIUS.deptFill),
          color: densityColor(density(meta)),
        }
      }),
    [],
  )

  const borders = useMemo(
    () => ringsToSegments(GEO.departments.flatMap((d) => d.rings), RADIUS.deptLine),
    [],
  )

  const group = useRef<Mesh[]>([])
  const borderMat = useRef<LineBasicMaterial>(null)
  const highlight = useMemo(() => new Color(COLORS.brass), [])

  useFrame((_, delta) => {
    const base = 0.94 * smoothstep(at('departements') - 0.85, at('departements'), view.t)
    if (borderMat.current) borderMat.current.opacity = 0.45 * smoothstep(at('departements') - 0.7, at('departements') + 0.1, view.t)

    for (const mesh of group.current) {
      if (!mesh) continue
      const mat = mesh.material as MeshBasicMaterial
      const isHot = getHovered() === mesh.userData.code
      mat.opacity = MathUtils.damp(mat.opacity, isHot ? Math.min(1, base + 0.25) : base, 10, delta)
      mat.color.lerp(isHot ? highlight : (mesh.userData.color as Color), 1 - Math.exp(-10 * delta))
      mesh.visible = base > 0.01
    }
  })

  return (
    <group>
      {parts.map((p, i) => (
        <mesh
          key={p.code}
          ref={(el) => {
            if (el) group.current[i] = el
          }}
          geometry={p.geometry}
          userData={{ code: p.code, color: p.color }}
          onPointerOver={(e) => {
            if (view.t < at('departements') - 0.8) return
            e.stopPropagation()
            setHovered(p.code)
          }}
          onPointerOut={() => {
            if (getHovered() !== p.code) return
            setHovered(null)
          }}
        >
          <meshBasicMaterial color={p.color} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      <lineSegments geometry={borders}>
        <lineBasicMaterial ref={borderMat} color={COLORS.ink} transparent depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/* ------------------------------------------------------------------ étiquettes */

type PinProps = {
  lat: number
  lon: number
  name: string
  role?: string
  variant: 'city' | 'country'
  align?: 'left' | 'right'
  nudge?: [number, number]
  /** Bornes d'apparition, en index de section. */
  from: number
  to: number
}

function Pin({ lat, lon, name, role, variant, align = 'right', nudge, from, to }: PinProps) {
  const el = useRef<HTMLDivElement>(null)
  const point = useMemo(() => latLonToVec3(lat, lon, RADIUS.pin), [lat, lon])
  const probe = useMemo(() => new Vector3(), [])

  useFrame(({ camera }) => {
    if (!el.current) return
    // Test d'horizon : le point n'est visible que s'il fait face à la caméra.
    probe.copy(point).normalize()
    const facing = probe.dot(camera.position) > 1
    const o = facing ? clamp01(smoothstep(from, to, view.t)) : 0
    el.current.style.opacity = String(o)
  })

  const [dx, dy] = nudge ?? [0, 0]

  return (
    <Html position={point} style={{ pointerEvents: 'none' }} zIndexRange={[8, 0]}>
      <div ref={el} className={`pin pin--${variant} pin--${align}`} style={{ opacity: 0 }}>
        <i className="pin__dot" aria-hidden />
        <span className="pin__text" style={{ translate: `${dx}px ${dy}px` }}>
          {name}
          {role ? <em>{role}</em> : null}
        </span>
      </div>
    </Html>
  )
}

function Labels() {
  return (
    <group>
      {GEO.neighbours.map((n) => (
        <Pin
          key={n.iso}
          lat={n.label[1]}
          lon={n.label[0]}
          name={n.name}
          variant="country"
          from={at('voisins') - 0.6}
          to={at('voisins') + 0.2}
        />
      ))}
      {CITIES.map((c) => (
        <Pin
          key={c.name}
          lat={c.lat}
          lon={c.lon}
          name={c.name}
          role={c.role}
          variant="city"
          align={c.align}
          nudge={c.nudge}
          from={c.tier === 0 ? at('population') - 0.7 : at('departements') - 0.8}
          to={c.tier === 0 ? at('population') + 0.1 : at('departements')}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ assemblage */

export function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Rig reduced={reduced} />
      <Globe />
      <Neighbours />
      <BeninBody />
      <Departments />
      <Labels />
    </>
  )
}
