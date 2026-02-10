/**
 * Bounds validation — Límites de contenedor
 * BR-001: Caja dentro de palet
 * BR-402: Palet dentro de camión
 * BR-403/404: Altura dentro de contenedor
 */

import type { ValidationResult, Violation, Dimensions3D } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import type { Pallet } from '../entities/Pallet'
import type { PlacedPallet } from '../entities/PlacedPallet'
import type { Truck } from '../entities/Truck'
import { getBoxBoundingBox, getPalletBoundingBox } from './collision'

// ─── BR-001: Caja dentro de palet ────────────────────────────────

export function validateBoxInPalletBounds(box: PlacedBox, pallet: Pallet): ValidationResult {
  const violations: Violation[] = []
  const bb = getBoxBoundingBox(box)

  if (bb.minX < 0 || bb.maxX > pallet.dimensions.width) {
    violations.push({
      code: 'BR-001',
      severity: 'error',
      message: `Caja ${box.id} sobresale por el eje X del palet`,
      involvedIds: [box.id, pallet.id],
    })
  }
  if (bb.minZ < 0 || bb.maxZ > pallet.dimensions.depth) {
    violations.push({
      code: 'BR-001',
      severity: 'error',
      message: `Caja ${box.id} sobresale por el eje Z del palet`,
      involvedIds: [box.id, pallet.id],
    })
  }
  if (bb.maxY > pallet.maxStackHeight) {
    violations.push({
      code: 'BR-001',
      severity: 'error',
      message: `Caja ${box.id} excede la altura máxima de apilamiento del palet`,
      involvedIds: [box.id, pallet.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}

/** Valida todas las cajas de un piso contra los límites del palet */
export function validateAllBoxesInPalletBounds(boxes: PlacedBox[], pallet: Pallet): ValidationResult {
  const violations: Violation[] = []
  for (const box of boxes) {
    const result = validateBoxInPalletBounds(box, pallet)
    violations.push(...result.violations)
  }
  return { isValid: violations.length === 0, violations }
}

// ─── BR-402: Palet dentro de camión ──────────────────────────────

export function validatePalletInTruck(pallet: PlacedPallet, truck: Truck): ValidationResult {
  const violations: Violation[] = []
  const bb = getPalletBoundingBox(pallet)
  const td: Dimensions3D = truck.dimensions

  if (bb.minX < 0 || bb.maxX > td.width) {
    violations.push({
      code: 'BR-402',
      severity: 'error',
      message: `Palet ${pallet.id} sobresale por el ancho del camión`,
      involvedIds: [pallet.id, truck.id],
    })
  }
  if (bb.minZ < 0 || bb.maxZ > td.depth) {
    violations.push({
      code: 'BR-402',
      severity: 'error',
      message: `Palet ${pallet.id} sobresale por la profundidad del camión`,
      involvedIds: [pallet.id, truck.id],
    })
  }
  // BR-404
  if (bb.maxY > td.height) {
    violations.push({
      code: 'BR-404',
      severity: 'error',
      message: `Palet ${pallet.id} excede la altura del camión`,
      involvedIds: [pallet.id, truck.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-403: Palet dentro de estancia (por altura) */
export function validatePalletHeight(pallet: PlacedPallet, ceilingHeight: number): ValidationResult {
  const violations: Violation[] = []
  const bb = getPalletBoundingBox(pallet)

  if (bb.maxY > ceilingHeight) {
    violations.push({
      code: 'BR-403',
      severity: 'error',
      message: `Palet ${pallet.id} excede el techo de la estancia (${bb.maxY}mm > ${ceilingHeight}mm)`,
      involvedIds: [pallet.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}
