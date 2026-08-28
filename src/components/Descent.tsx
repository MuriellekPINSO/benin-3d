'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'

import { Scene } from '@/components/scene/Scene'
import { Hud } from '@/components/Hud'
import { SoundToggle } from '@/components/SoundToggle'
import { SECTION_ORDER, view } from '@/lib/descent'
import { COLORS } from '@/lib/theme'

/**
 * Enveloppe la page : une toile fixe en fond, le document qui défile par-dessus.
 * Le défilement n'entraîne aucun re-render React — il écrit dans `view`, que la
 * boucle de rendu lit à chaque frame.
 */
export function Descent({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false)
  const [ready, setReady] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let centers: number[] = []

    // Les sections n'ont pas toutes la même hauteur : on cale les stations sur le centre
    // réel de chaque panneau plutôt que sur une fraction du document.
    const layout = () => {
      const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel'))
      centers = panels.map((el) => el.offsetTop + el.offsetHeight / 2)
    }

    const measure = () => {
      if (centers.length < 2) return
      const mid = window.scrollY + window.innerHeight / 2
      const last = centers.length - 1

      let t = last
      if (mid <= centers[0]) {
        t = 0
      } else {
        for (let i = 0; i < last; i++) {
          if (mid <= centers[i + 1]) {
            const span = centers[i + 1] - centers[i]
            t = i + (span > 0 ? (mid - centers[i]) / span : 0)
            break
          }
        }
      }
      view.t = Math.min(t, SECTION_ORDER.length - 1)

      const range = document.documentElement.scrollHeight - window.innerHeight
      view.p = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0
    }

    const onResize = () => {
      layout()
      measure()
    }

    layout()
    measure()

    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', onResize)

    // Les polices et la mise en page se stabilisent après le premier rendu.
    const observer = new ResizeObserver(onResize)
    if (scroller.current) observer.observe(scroller.current)

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div className="stage" aria-hidden>
        <Canvas
          className={ready ? 'stage__canvas is-ready' : 'stage__canvas'}
          camera={{ fov: 32, near: 0.01, far: 30, position: [0, 0, 4.2] }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor(COLORS.ink, 1)
            setReady(true)
          }}
        >
          <Scene reduced={reduced} />
        </Canvas>
      </div>

      <SoundToggle />
      <Hud />

      <div className="scroller" ref={scroller}>
        {children}
      </div>
    </>
  )
}
