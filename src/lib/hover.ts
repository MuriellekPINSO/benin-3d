'use client'

import { useSyncExternalStore } from 'react'

/**
 * Département survolé, partagé entre la carte 3D et la liste HTML.
 * Store externe minimal : survoler la liste éclaire le département, et réciproquement,
 * sans faire remonter l'état à travers l'arbre.
 */
let hovered: string | null = null
const listeners = new Set<() => void>()

export function setHovered(code: string | null) {
  if (code === hovered) return
  hovered = code
  for (const notify of listeners) notify()
}

const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

const getSnapshot = () => hovered
const getServerSnapshot = () => null

export const useHovered = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

/** Lecture hors React, pour la boucle de rendu. */
export const getHovered = () => hovered
