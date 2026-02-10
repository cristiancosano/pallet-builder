/**
 * Stability validation — Centro de gravedad y estabilidad
 * BR-501: Score de estabilidad mínimo
 * BR-502: Centro de gravedad dentro del polígono de soporte
 * BR-503: Altura del centro de gravedad
 */

import type { Position3D, ValidationResult, Violation } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import type { Pallet } from '../entities/Pallet'
import { getBoxBoundingBox } from './collision'

/** Calcula el centro de gravedad de un conjunto de cajas */
export function calculateCenterOfGravity(boxes: PlacedBox[]): Position3D {
  if (boxes.length === 0) return { x: 0, y: 0, z: 0 }

  let totalWeight = 0
  let cogX = 0, cogY = 0, cogZ = 0

  for (const pb of boxes) {
    const bb = getBoxBoundingBox(pb)
    const cx = (bb.minX + bb.maxX) / 2
    const cy = (bb.minY + bb.maxY) / 2
    const cz = (bb.minZ + bb.maxZ) / 2
    const w = pb.box.weight

    cogX += cx * w
    cogY += cy * w
    cogZ += cz * w
    totalWeight += w
  }

  if (totalWeight === 0) return { x: 0, y: 0, z: 0 }

  return {
    x: cogX / totalWeight,
    y: cogY / totalWeight,
    z: cogZ / totalWeight,
  }
}

/** Calcula el score de estabilidad (0-100) */
export function calculateStabilityScore(pallet: Pallet, boxes: PlacedBox[]): number {
  if (boxes.length === 0) return 100

  const cog = calculateCenterOfGravity(boxes)
  const centerX = pallet.dimensions.width / 2
  const centerZ = pallet.dimensions.depth / 2

  // Distancia normalizada del CoG al centro
  const dx = Math.abs(cog.x - centerX) / (pallet.dimensions.width / 2)
  const dz = Math.abs(cog.z - centerZ) / (pallet.dimensions.depth / 2)
  const horizontalScore = Math.max(0, 100 - (dx + dz) * 50)

  // Penalizar CoG alto
  const maxBoxY = boxes.reduce((max, pb) => {
    const bb = getBoxBoundingBox(pb)
    return Math.max(max, bb.maxY)
  }, 0)
  const heightRatio = maxBoxY > 0 ? cog.y / maxBoxY : 0
  const verticalScore = Math.max(0, 100 - Math.max(0, heightRatio - 0.5) * 100)

  return Math.round((horizontalScore * 0.7 + verticalScore * 0.3))
}

/** BR-502: CoG dentro del polígono de soporte (planta del palet) */
export function validateCogInsideSupport(pallet: Pallet, boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []
  if (boxes.length === 0) return { isValid: true, violations }

  const cog = calculateCenterOfGravity(boxes)

  if (cog.x < 0 || cog.x > pallet.dimensions.width || cog.z < 0 || cog.z > pallet.dimensions.depth) {
    violations.push({
      code: 'BR-502',
      severity: 'error',
      message: `Centro de gravedad (${cog.x.toFixed(0)}, ${cog.z.toFixed(0)}) fuera del palet`,
      involvedIds: [pallet.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-501 + BR-503: Score de estabilidad y CoG alto */
export function validateStability(pallet: Pallet, boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []
  if (boxes.length === 0) return { isValid: true, violations }

  const score = calculateStabilityScore(pallet, boxes)

  if (score < 50) {
    violations.push({
      code: 'BR-501',
      severity: 'error',
      message: `Score de estabilidad bajo (${score}/100, mínimo: 50)`,
      involvedIds: [pallet.id],
    })
  } else if (score < 70) {
    violations.push({
      code: 'BR-501',
      severity: 'warning',
      message: `Score de estabilidad mejorable (${score}/100, recomendado: ≥70)`,
      involvedIds: [pallet.id],
    })
  }

  // BR-503: CoG alto
  const cog = calculateCenterOfGravity(boxes)
  const maxY = boxes.reduce((max, pb) => Math.max(max, getBoxBoundingBox(pb).maxY), 0)
  if (maxY > 0 && cog.y > maxY * 0.6) {
    violations.push({
      code: 'BR-503',
      severity: 'warning',
      message: `Centro de gravedad alto (${cog.y.toFixed(0)}mm, ${((cog.y / maxY) * 100).toFixed(0)}% de la altura)`,
      involvedIds: [pallet.id],
    })
  }

  return { isValid: violations.filter(v => v.severity === 'error').length === 0, violations }
}
