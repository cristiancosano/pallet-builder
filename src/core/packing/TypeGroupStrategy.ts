/**
 * TypeGroupStrategy — Agrupación por tipo, relleno capa a capa
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PackingStrategy, PackingResult } from './PackingStrategy'
import { calculateCenterOfGravity, calculateStabilityScore } from '../validation/stability'

export class TypeGroupStrategy implements PackingStrategy {
  readonly id = 'type-group'
  readonly name = 'Agrupación por tipo'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    const placements: PlacedBox[] = []
    const unplacedBoxes: Box[] = []

    // Ordenar por tipo, y dentro de tipo por peso desc (frágiles al final/arriba)
    const sorted = [...boxes].sort((a, b) => {
      const typeA = a.type ?? a.sku ?? 'z'
      const typeB = b.type ?? b.sku ?? 'z'
      if (typeA !== typeB) return typeA.localeCompare(typeB)
      // Frágiles después (irán arriba)
      if (a.fragile !== b.fragile) return a.fragile ? 1 : -1
      return b.weight - a.weight
    })

    let cursorX = 0
    let cursorZ = 0
    let cursorY = 0
    let layerMaxHeight = 0
    let placementId = 0

    for (const box of sorted) {
      const w = box.dimensions.width
      const h = box.dimensions.height
      const d = box.dimensions.depth

      // ¿Cabe en X?
      if (cursorX + w > pallet.dimensions.width) {
        cursorX = 0
        cursorZ += layerMaxHeight > 0 ? d : 0
        // Use previous depth if available
      }

      // ¿Cabe en Z?
      if (cursorZ + d > pallet.dimensions.depth) {
        // Nueva capa vertical
        cursorX = 0
        cursorZ = 0
        cursorY += layerMaxHeight
        layerMaxHeight = 0
      }

      // ¿Cabe en Y?
      if (cursorY + h > pallet.maxStackHeight) {
        unplacedBoxes.push(box)
        continue
      }

      // ¿Cabe en X después del reset?
      if (cursorX + w > pallet.dimensions.width) {
        unplacedBoxes.push(box)
        continue
      }

      if (cursorZ + d > pallet.dimensions.depth) {
        unplacedBoxes.push(box)
        continue
      }

      placements.push({
        id: `placed-${++placementId}`,
        box,
        position: { x: cursorX, y: cursorY, z: cursorZ },
        rotation: { x: 0, y: 0, z: 0 },
        supportedBy: [],
        supporting: [],
      })

      cursorX += w
      layerMaxHeight = Math.max(layerMaxHeight, h)
    }

    // Métricas
    const palletVolume = pallet.dimensions.width * pallet.maxStackHeight * pallet.dimensions.depth
    const usedVolume = placements.reduce((s, pb) => {
      const d = pb.box.dimensions
      return s + d.width * d.height * d.depth
    }, 0)
    const totalWeight = placements.reduce((s, pb) => s + pb.box.weight, 0)

    return {
      placements,
      metrics: {
        volumeUtilization: palletVolume > 0 ? usedVolume / palletVolume : 0,
        weightUtilization: pallet.maxWeight > 0 ? totalWeight / pallet.maxWeight : 0,
        centerOfGravity: calculateCenterOfGravity(placements),
        stabilityScore: calculateStabilityScore(pallet, placements),
      },
      unplacedBoxes,
    }
  }
}
