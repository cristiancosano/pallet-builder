/**
 * Constantes del sistema — presets de palets y camiones estándar
 */

import { PalletMaterial, TruckType } from './types'
import type { PalletPreset, TruckPreset } from './types'

// ─── Palet Presets ───────────────────────────────────────────────

export const STANDARD_PALLETS: Record<string, PalletPreset> = {
  EUR: {
    dimensions: { width: 1200, height: 144, depth: 800 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 25,
  },
  AMERICAN: {
    dimensions: { width: 1219, height: 145, depth: 1016 },
    material: PalletMaterial.WOOD,
    maxWeight: 1200,
    maxStackHeight: 2200,
    weight: 30,
  },
  ASIA: {
    dimensions: { width: 1100, height: 150, depth: 1100 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 28,
  },
} as const

// ─── Truck Presets ───────────────────────────────────────────────

export const TRUCK_PRESETS: Record<Exclude<TruckType, 'CUSTOM'>, TruckPreset> = {
  [TruckType.BOX]: {
    dimensions: { width: 2480, height: 2700, depth: 13600 },
    maxWeight: 24000,
  },
  [TruckType.REFRIGERATED]: {
    dimensions: { width: 2440, height: 2590, depth: 13100 },
    maxWeight: 22000,
  },
  [TruckType.FLATBED]: {
    dimensions: { width: 2480, height: 2700, depth: 13600 },
    maxWeight: 25000,
  },
  [TruckType.TAUTLINER]: {
    dimensions: { width: 2480, height: 2700, depth: 13600 },
    maxWeight: 24000,
  },
} as const

// ─── Separator Defaults ─────────────────────────────────────────

export const SEPARATOR_DEFAULTS = {
  thickness: 10,  // mm
  weight: 2,      // kg
} as const

// ─── Conversiones ────────────────────────────────────────────────

export const UNITS = {
  MM_TO_M: 0.001,
  M_TO_MM: 1000,
} as const

// ─── Validation ──────────────────────────────────────────────────

/** Tolerancia en mm para detección AABB */
export const COLLISION_TOLERANCE = 1

/** % mínimo de soporte bajo una caja */
export const MIN_SUPPORT_PERCENTAGE = 0.6

/** Factor de seguridad de peso (warning a partir de este %) */
export const WEIGHT_WARNING_THRESHOLD = 0.9
