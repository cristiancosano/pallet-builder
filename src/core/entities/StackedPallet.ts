/**
 * StackedPallet — Composición vertical de pisos de palet con separadores
 */

import type { PalletFloor } from './PalletFloor'
import type { PlacedBox } from './PlacedBox'

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

/**
 * Normaliza los IDs de todas las cajas en un StackedPallet para garantizar unicidad global.
 * 
 * La librería debe asegurar que cada caja tenga un ID único, independientemente de cómo 
 * el desarrollador construya el StackedPallet. Esto evita conflictos de selección cuando
 * hay múltiples pisos o cuando se reutilizan las mismas cajas base.
 * 
 * Formato del ID generado: `{stackId}:f{floorIndex}:b{boxIndex}`
 * 
 * @param stack - StackedPallet a normalizar
 * @param contextId - ID opcional de contexto (ej: placedPalletId en truck/warehouse)
 * @returns Nuevo StackedPallet con IDs únicos
 */
export function ensureUniqueBoxIds(
  stack: StackedPallet,
  contextId?: string,
): StackedPallet {
  const baseId = contextId || stack.id
  
  const normalizedFloors: PalletFloor[] = stack.floors.map((floor, floorIdx) => {
    const normalizedBoxes: PlacedBox[] = floor.boxes.map((pb, boxIdx) => {
      // Generar ID único: contextId:f{floor}:b{box}
      const uniqueId = `${baseId}:f${floorIdx}:b${boxIdx}`
      
      // Actualizar referencias supportedBy/supporting para mantener consistencia
      const updateRefs = (refs: string[]) =>
        refs.map(refId => {
          // Si la referencia es un ID antiguo dentro de este floor, actualizarla
          const refBoxIdx = floor.boxes.findIndex(b => b.id === refId)
          return refBoxIdx >= 0 ? `${baseId}:f${floorIdx}:b${refBoxIdx}` : refId
        })

      return {
        ...pb,
        id: uniqueId,
        supportedBy: updateRefs(pb.supportedBy),
        supporting: updateRefs(pb.supporting),
      }
    })

    return {
      ...floor,
      boxes: normalizedBoxes,
    }
  })

  return {
    ...stack,
    floors: normalizedFloors,
  }
}
