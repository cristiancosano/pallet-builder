/**
 * Gravity validation — BR-004: Objetos no flotan
 */

import type { ValidationResult, Violation } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import { getBoxBoundingBox } from './collision'
import { MIN_SUPPORT_PERCENTAGE } from '../constants'

/**
 * BR-004: Valida que toda caja tiene soporte debajo (suelo del palet u otra caja)
 * Al menos MIN_SUPPORT_PERCENTAGE del área base debe estar soportada
 */
export function validateSupport(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []

  for (const pb of boxes) {
    const bb = getBoxBoundingBox(pb)

    // Si la caja está en el suelo (Y ≈ 0), tiene soporte
    if (bb.minY <= 1) continue

    const boxArea = (bb.maxX - bb.minX) * (bb.maxZ - bb.minZ)
    let supportedArea = 0

    for (const other of boxes) {
      if (other.id === pb.id) continue
      const obb = getBoxBoundingBox(other)

      // La otra caja está justo debajo (su top ≈ nuestra bottom)
      if (Math.abs(obb.maxY - bb.minY) > 2) continue

      // Calcular área de solapamiento en XZ
      const overlapX = Math.max(0, Math.min(bb.maxX, obb.maxX) - Math.max(bb.minX, obb.minX))
      const overlapZ = Math.max(0, Math.min(bb.maxZ, obb.maxZ) - Math.max(bb.minZ, obb.minZ))
      supportedArea += overlapX * overlapZ
    }

    if (boxArea > 0 && supportedArea / boxArea < MIN_SUPPORT_PERCENTAGE) {
      violations.push({
        code: 'BR-004',
        severity: 'error',
        message: `Caja ${pb.id} sin soporte suficiente (${((supportedArea / boxArea) * 100).toFixed(0)}% < ${MIN_SUPPORT_PERCENTAGE * 100}%)`,
        involvedIds: [pb.id],
      })
    }
  }

  return { isValid: violations.length === 0, violations }
}
