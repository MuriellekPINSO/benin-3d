'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Volume de croisière : la bande sonore accompagne la descente, elle ne la couvre pas. */
const LEVEL = 0.32
const FADE_IN_MS = 1200
const FADE_OUT_MS = 420
const PREF_KEY = 'benin3d:sound'

const readPref = () => {
  try {
    return localStorage.getItem(PREF_KEY)
  } catch {
    return null
  }
}

const writePref = (value: 'on' | 'off') => {
  try {
    localStorage.setItem(PREF_KEY, value)
  } catch {
    // Navigation privée ou stockage bloqué : la préférence ne survit pas, tant pis.
  }
}

/**
 * Bande sonore d'ambiance.
 *
 * Elle démarre d'elle-même au chargement. Aucun navigateur n'autorise le son
 * automatique sans activation préalable de la page : la tentative est donc faite
 * immédiatement, et si elle est refusée, la lecture s'amorce au tout premier geste
 * du visiteur (clic, touche, contact tactile). Qui a coupé le son une fois ne se le
 * voit pas réimposer à la visite suivante.
 */
export function SoundToggle() {
  const root = useRef<HTMLDivElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const fade = useRef(0)
  const [playing, setPlaying] = useState(false)

  // L'état affiché suit l'élément audio, pas l'inverse : il reste juste même quand
  // le système interrompt la lecture de son côté.
  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => () => cancelAnimationFrame(fade.current), [])

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const el = audio.current
    if (!el) return
    cancelAnimationFrame(fade.current)
    const from = el.volume
    const start = performance.now()
    const step = (now: number) => {
      // requestAnimationFrame livre l'horodatage du DÉBUT de la frame courante, qui peut
      // précéder l'instant de programmation : sans borne basse, t part en négatif et
      // l'affectation d'un volume < 0 lève une IndexSizeError qui tue le fondu.
      const t = Math.min(1, Math.max(0, (now - start) / ms))
      el.volume = Math.min(1, Math.max(0, from + (target - from) * t))
      if (t < 1) fade.current = requestAnimationFrame(step)
      else done?.()
    }
    fade.current = requestAnimationFrame(step)
  }, [])

  const start = useCallback(async () => {
    const el = audio.current
    if (!el) return false
    el.preload = 'auto'
    el.volume = 0
    try {
      await el.play()
      fadeTo(LEVEL, FADE_IN_MS)
      return true
    } catch {
      return false
    }
  }, [fadeTo])

  const stop = useCallback(() => {
    const el = audio.current
    if (!el) return
    fadeTo(0, FADE_OUT_MS, () => el.pause())
  }, [fadeTo])

  // Démarrage automatique, avec repli sur le premier geste du visiteur.
  useEffect(() => {
    if (readPref() === 'off') return

    let cancelled = false
    const events = ['pointerdown', 'keydown', 'touchstart'] as const

    const disarm = () => {
      for (const type of events) window.removeEventListener(type, onGesture)
    }

    function onGesture(event: Event) {
      // Un clic sur le bouton lui-même : on le laisse faire, sinon on démarre deux fois.
      if (root.current?.contains(event.target as Node)) return
      disarm()
      void start()
    }

    const arm = (ok: boolean) => {
      if (ok || cancelled) return
      for (const type of events) window.addEventListener(type, onGesture, { passive: true })
    }

    void start().then(arm)

    return () => {
      cancelled = true
      disarm()
    }
  }, [start])

  const toggle = () => {
    if (playing) {
      stop()
      writePref('off')
      return
    }
    void start().then((ok) => {
      if (ok) writePref('on')
    })
  }

  return (
    <div className={`sound${playing ? ' is-on' : ''}`} ref={root}>
      <button type="button" className="sound__btn" onClick={toggle} aria-pressed={playing}>
        <span className="sound__label">Sound</span>
        <span className="sound__bars" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="sr-only">{playing ? 'Couper le son' : 'Activer le son'}</span>
      </button>
      {/* preload none au départ : le fichier n'est cherché qu'au moment de jouer. */}
      <audio ref={audio} loop preload="none">
        <source src="/audio/ambience.m4a" type="audio/mp4" />
        <source src="/audio/ambience.mp3" type="audio/mpeg" />
      </audio>
    </div>
  )
}
