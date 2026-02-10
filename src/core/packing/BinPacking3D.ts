/**
 * BinPacking3D — Optimización volumétrica (First Fit Decreasing Height)
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PackingStrategy, PackingResult } from './PackingStrategy'
import { calculateCenterOfGravity, calculateStabilityScore } from '../validation/stability'
import { getBoxBoundingBox, aabbIntersects } from '../validation/collision'

interface Space {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
}

export class BinPacking3DStrategy implements PackingStrategy {
  readonly id = 'bin-packing-3d'
  readonly name = 'Bin Packing 3D (FFD Height)'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    const placements: PlacedBox[] = []
    const unplacedBoxes: Box[] = []

    // Ordenar por volumen descendente (First Fit Decreasing)
    const sorted = [...boxes].sort((a, b) => {
      const va = a.dimensions.width * a.dimensions.height * a.dimensions.depth
      const vb = b.dimensions.width * b.dimensions.height * b.dimensions.depth
      return vb - va
    })

    // Espacios libres: empezamos con el palet completo
    const spaces: Space[] = [
      {
        x: 0,
        y: 0,
        z: 0,
        width: pallet.dimensions.width,
        height: pallet.maxStackHeight,
        depth: pallet.dimensions.depth,
      },
    ]

    let placementId = 0

    for (const box of sorted) {
      let placed = false

      // Intentar colocar en cada espacio libre
      // Probar orientaciones: normal y rotada 90° en Y
      const orientations = [
        { w: box.dimensions.width, h: box.dimensions.height, d: box.dimensions.depth, rot: 0 as const },
        { w: box.dimensions.depth, h: box.dimensions.height, d: box.dimensions.width, rot: 90 as const },
      ]

      for (let si = 0; si < spaces.length && !placed; si++) {
        const space = spaces[si]

        for (const ori of orientations) {
          if (ori.w <= space.width && ori.h <= space.height && ori.d <= space.depth) {
            const newPlacement: PlacedBox = {
              id: `placed-${++placementId}`,
              box,
              position: { x: space.x, y: space.y, z: space.z },
              rotation: { x: 0, y: ori.rot, z: 0 },
              supportedBy: [],
              supporting: [],
            }

            // Verificar colisiones con colocaciones existentes
            const newBB = getBoxBoundingBox(newPlacement)
            const collides = placements.some(existing =>
              aabbIntersects(getBoxBoundingBox(existing), newBB),
            )

            if (!collides) {
              placements.push(newPlacement)
              placed = true

              // Subdividir espacio restante (3 nuevos espacios)
              spaces.splice(si, 1)

              // Espacio a la derecha
              if (space.width - ori.w > 0) {
                spaces.push({
                  x: space.x + ori.w,
                  y: space.y,
                  z: space.z,
                  width: space.width - ori.w,
                  height: space.height,
                  depth: space.depth,
                })
              }
              // Espacio arriba
              if (space.height - ori.h > 0) {
                spaces.push({
                  x: space.x,
                  y: space.y + ori.h,
                  z: space.z,
                  width: ori.w,
                  height: space.height - ori.h,
                  depth: ori.d,
                })
              }
              // Espacio detrás
              if (space.depth - ori.d > 0) {
                spaces.push({
                  x: space.x,
                  y: space.y,
                  z: space.z + ori.d,
                  width: ori.w,
                  height: space.height,
                  depth: space.depth - ori.d,
                })
              }

              // Ordenar espacios por posición (preferir abajo, izquierda, delante)
              spaces.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z)
              break
            }
          }
        }
      }

      if (!placed) {
        unplacedBoxes.push(box)
      }
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
