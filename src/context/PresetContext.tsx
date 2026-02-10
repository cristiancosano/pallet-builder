/**
 * PresetContext — Provee el ScenePreset activo a todos los componentes del árbol.
 *
 * Uso:
 *  <PresetProvider preset="industrial">
 *    <WarehouseScene ... />
 *  </PresetProvider>
 *
 * O con un preset custom:
 *  <PresetProvider preset={myCustomPreset}>
 *    <TruckScene ... />
 *  </PresetProvider>
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_PRESET, SCENE_PRESETS } from '@/core/presets'
import type { ScenePreset } from '@/core/presets'

const PresetContext = createContext<ScenePreset>(DEFAULT_PRESET)

export interface PresetProviderProps {
  /** ID de un preset incluido ('unstyled' | 'industrial') o un ScenePreset custom */
  preset?: string | ScenePreset
  children: ReactNode
}

export function PresetProvider({ preset, children }: PresetProviderProps) {
  const resolved = useMemo<ScenePreset>(() => {
    if (!preset) return DEFAULT_PRESET
    if (typeof preset === 'string') return SCENE_PRESETS[preset] ?? DEFAULT_PRESET
    return preset
  }, [preset])

  return (
    <PresetContext.Provider value={resolved}>
      {children}
    </PresetContext.Provider>
  )
}

/** Hook para acceder al preset activo */
export function usePreset(): ScenePreset {
  return useContext(PresetContext)
}
