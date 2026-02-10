/**
 * Core types — Tipos base, interfaces y enums compartidos
 * TypeScript puro, sin dependencias de React ni Three.js
 */

// ─── Value Objects ───────────────────────────────────────────────

/** Dimensiones 3D en milímetros */
export interface Dimensions3D {
  width: number   // mm (X)
  height: number  // mm (Y)
  depth: number   // mm (Z)
}

/** Posición 3D en milímetros */
export interface Position3D {
  x: number  // mm — ancho
  y: number  // mm — alto (vertical)
  z: number  // mm — profundidad
}

/** Punto 2D en milímetros (planta) */
export interface Point2D {
  x: number  // mm
  z: number  // mm
}

/** Bounding box axis-aligned */
export interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
}

/** Rotación discreta: solo múltiplos de 90° */
export interface DiscreteRotation {
  x: 0 | 90 | 180 | 270
  y: 0 | 90 | 180 | 270
  z: 0 | 90 | 180 | 270
}

// ─── Validation ──────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean
  violations: Violation[]
}

export interface Violation {
  code: string
  severity: 'error' | 'warning'
  message: string
  involvedIds: string[]
}

// ─── Enums (const objects for erasableSyntaxOnly) ────────────────

export const PalletMaterial = {
  WOOD: 'WOOD',
  PLASTIC: 'PLASTIC',
  METAL: 'METAL',
  COMPOSITE: 'COMPOSITE',
} as const
export type PalletMaterial = (typeof PalletMaterial)[keyof typeof PalletMaterial]

export const SeparatorMaterial = {
  CARDBOARD: 'CARDBOARD',
  WOOD: 'WOOD',
  PLASTIC: 'PLASTIC',
} as const
export type SeparatorMaterial = (typeof SeparatorMaterial)[keyof typeof SeparatorMaterial]

export const TruckType = {
  BOX: 'BOX',
  REFRIGERATED: 'REFRIGERATED',
  FLATBED: 'FLATBED',
  TAUTLINER: 'TAUTLINER',
  CUSTOM: 'CUSTOM',
} as const
export type TruckType = (typeof TruckType)[keyof typeof TruckType]

// ─── Packing ─────────────────────────────────────────────────────

export interface PackingMetrics {
  volumeUtilization: number   // 0–1
  weightUtilization: number   // 0–1
  centerOfGravity: Position3D
  stabilityScore: number      // 0–100
}

// ─── Presets ─────────────────────────────────────────────────────

export interface PalletPreset {
  dimensions: Dimensions3D
  material: PalletMaterial
  maxWeight: number
  maxStackHeight: number
  weight: number
}

export interface TruckPreset {
  dimensions: Dimensions3D
  maxWeight: number
}
