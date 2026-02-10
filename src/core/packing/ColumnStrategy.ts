/**
 * ColumnStrategy — Empaquetado en columnas verticales por tipo de caja
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PackingStrategy, PackingResult } from './PackingStrategy'
import { calculateCenterOfGravity, calculateStabilityScore } from '../validation/stability'

export class ColumnStrategy implements PackingStrategy {
  readonly id = 'column'
  readonly name = 'Columnas por tipo'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    const placements: PlacedBox[] = []
    const unplacedBoxes: Box[] = []

    // Agrupar cajas por tipo/SKU
    const groups = new Map<string, Box[]>()
    for (const box of boxes) {
      const key = box.type ?? box.sku ?? 'default'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(box)
    }

    let cursorX = 0
    let placementId = 0

    for (const [, groupBoxes] of groups) {
      if (groupBoxes.length === 0) continue
      const refBox = groupBoxes[0]
      const colWidth = refBox.dimensions.width
      const colDepth = refBox.dimensions.depth
      const boxHeight = refBox.dimensions.height

      // ¿Cabe una nueva columna en X?
      if (cursorX + colWidth > pallet.dimensions.width) {
        unplacedBoxes.push(...groupBoxes)
        continue
      }

      let cursorZ = 0
      let cursorY = 0
      let boxIdx = 0

      while (boxIdx < groupBoxes.length) {
        const box = groupBoxes[boxIdx]

        // ¿Cabe en Z?
        if (cursorZ + colDepth > pallet.dimensions.depth) {
          // Nueva capa vertical
          cursorZ = 0
          cursorY += boxHeight
          if (cursorY + boxHeight > pallet.maxStackHeight) {
            // No cabe más en esta columna
            unplacedBoxes.push(...groupBoxes.slice(boxIdx))
            break
          }
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

        cursorZ += colDepth
        boxIdx++
      }

      cursorX += colWidth
    }

    // Métricas
    const palletVolume = pallet.dimensions.width * pallet.maxStackHeight * pallet.dimensions.depth
    const usedVolume = placements.reduce((s, pb) => {
      const d = pb.box.dimensions
      return s + d.width * d.height * d.depth
    }, 0)
    const totalWeight = placements.reduce((s, pb) => s + pb.box.weight, 0)

    const cog = calculateCenterOfGravity(placements)
    const stability = calculateStabilityScore(pallet, placements)

    return {
      placements,
      metrics: {
        volumeUtilization: palletVolume > 0 ? usedVolume / palletVolume : 0,
        weightUtilization: pallet.maxWeight > 0 ? totalWeight / pallet.maxWeight : 0,
        centerOfGravity: cog,
        stabilityScore: stability,
      },
      unplacedBoxes,
    }
  }
}
