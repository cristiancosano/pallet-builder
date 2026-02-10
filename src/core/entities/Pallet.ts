/**
 * Pallet — Plataforma física sobre la que se colocan cajas
 */

import type { Dimensions3D, PalletMaterial } from '../types'

export interface Pallet {
  id: string
  dimensions: Dimensions3D
  material: PalletMaterial
  maxWeight: number        // kg
  maxStackHeight: number   // mm
  weight: number           // kg (peso vacío)
  metadata: Record<string, unknown>
}
