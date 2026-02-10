/**
 * Separator — Plano rígido entre pisos de palet
 */

import type { Dimensions3D, SeparatorMaterial } from '../types'

export interface Separator {
  id: string
  dimensions: Dimensions3D
  material: SeparatorMaterial
  weight: number  // kg
  metadata: Record<string, unknown>
}
