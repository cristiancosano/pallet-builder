/**
 * Constantes del sistema — presets de palets y camiones estándar
 */

import { PalletMaterial, TruckType } from './types'
import type { PalletPreset, TruckPreset } from './types'

// ─── Palet Presets ───────────────────────────────────────────────
/**
 * STANDARD_PALLETS — Dimensiones de palets estándar internacionales
 * 
 * Incluye los tipos más comunes utilizados en logística mundial:
 * - EUR/EPAL: Palet europeo (Europa, ISO 6780)
 * - GMA/AMERICAN: Palet americano estándar (Norteamérica, 48"×40")
 * - UK: Palet estándar Reino Unido (1200×1000)
 * - ASIA: Palet estándar asiático (1100×1100, ISO 6780)
 * - AUSTRALIAN: Palet estándar australiano (1165×1165)
 * - HALF_EUR: Medio palet europeo (800×600)
 * - QUARTER_EUR: Cuarto de palet europeo (600×400)
 * - ISO_1: Palet ISO 1200×1000 (ISO 6780)
 * - ISO_2: Palet ISO 1200×800 (equivalente a EUR)
 */
export const STANDARD_PALLETS: Record<string, PalletPreset> = {
  /** Palet EUR/EPAL — Estándar europeo (1200×800×144mm, ISO 6780) */
  EUR: {
    dimensions: { width: 1200, height: 144, depth: 800 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 25,
  },
  /** Palet GMA/Americano — Estándar norteamericano (1219×1016×145mm, 48"×40") */
  GMA: {
    dimensions: { width: 1219, height: 145, depth: 1016 },
    material: PalletMaterial.WOOD,
    maxWeight: 1200,
    maxStackHeight: 2200,
    weight: 30,
  },
  /** Palet UK Standard — Reino Unido (1200×1000×150mm) */
  UK: {
    dimensions: { width: 1200, height: 150, depth: 1000 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 28,
  },
  /** Palet asiático estándar — Asia Pallet (1100×1100×150mm, ISO 6780) */
  ASIA: {
    dimensions: { width: 1100, height: 150, depth: 1100 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 28,
  },
  /** Palet australiano estándar — Australia (1165×1165×150mm) */
  AUSTRALIAN: {
    dimensions: { width: 1165, height: 150, depth: 1165 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 29,
  },
  /** Medio palet EUR — Half European Pallet (800×600×144mm) */
  HALF_EUR: {
    dimensions: { width: 800, height: 144, depth: 600 },
    material: PalletMaterial.WOOD,
    maxWeight: 500,
    maxStackHeight: 2200,
    weight: 12,
  },
  /** Cuarto de palet EUR — Quarter European Pallet (600×400×144mm) */
  QUARTER_EUR: {
    dimensions: { width: 600, height: 144, depth: 400 },
    material: PalletMaterial.WOOD,
    maxWeight: 250,
    maxStackHeight: 2200,
    weight: 6,
  },
  /** Palet ISO 1 — ISO 6780 (1200×1000×150mm) */
  ISO_1: {
    dimensions: { width: 1200, height: 150, depth: 1000 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 28,
  },
  /** Palet ISO 2 — ISO 6780 (1200×800×144mm, equivalente a EUR) */
  ISO_2: {
    dimensions: { width: 1200, height: 144, depth: 800 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 25,
  },
} as const

// Alias para compatibilidad con código existente
/** @deprecated Use GMA instead */
export const AMERICAN_PALLET = STANDARD_PALLETS.GMA

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
