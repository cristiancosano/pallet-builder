/**
 * StackedPallet — Composición vertical de pisos de palet con separadores
 */

import type { PalletFloor } from './PalletFloor'

export interface StackedPallet {
  id: string
  floors: PalletFloor[]  // al menos 1
  metadata: Record<string, unknown>
}

// ─── Helpers puros ───────────────────────────────────────────────

/** Calcula la altura total de un StackedPallet en mm */
export function getStackedPalletTotalHeight(stack: StackedPallet): number {
  let height = 0
  for (const floor of stack.floors) {
    height += floor.pallet.dimensions.height
    // Altura máxima de cajas en este piso
    const maxBoxTop = floor.boxes.reduce((max, pb) => {
      const boxTop = pb.position.y + pb.box.dimensions.height
      return Math.max(max, boxTop)
    }, 0)
    height += maxBoxTop
    if (floor.separatorAbove) {
      height += floor.separatorAbove.dimensions.height
    }
  }
  return height
}

/** Calcula el peso total de un StackedPallet en kg */
export function getStackedPalletTotalWeight(stack: StackedPallet): number {
  let weight = 0
  for (const floor of stack.floors) {
    weight += floor.pallet.weight
    weight += floor.boxes.reduce((sum, pb) => sum + pb.box.weight, 0)
    if (floor.separatorAbove) {
      weight += floor.separatorAbove.weight
    }
  }
  return weight
}
