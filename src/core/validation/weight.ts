/**
 * Weight validation
 * BR-101: Peso máximo de palet
 * BR-102: Peso máximo de camión
 * BR-103: Peso sobre caja frágil
 * BR-104: Distribución de peso en palet
 */

import type { ValidationResult, Violation } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import type { Pallet } from '../entities/Pallet'
import type { Truck } from '../entities/Truck'
import type { PalletFloor } from '../entities/PalletFloor'
import { getStackedPalletTotalWeight } from '../entities/StackedPallet'
import { WEIGHT_WARNING_THRESHOLD } from '../constants'
import { getBoxBoundingBox } from './collision'

// ─── BR-101: Peso máximo de palet ────────────────────────────────

export function validatePalletWeight(floor: PalletFloor): ValidationResult {
  const violations: Violation[] = []
  const totalBoxWeight = floor.boxes.reduce((sum, pb) => sum + pb.box.weight, 0)
  const maxWeight = floor.pallet.maxWeight

  if (totalBoxWeight > maxWeight) {
    violations.push({
      code: 'BR-101',
      severity: 'error',
      message: `Peso de cajas (${totalBoxWeight.toFixed(1)}kg) excede el máximo del palet (${maxWeight}kg)`,
      involvedIds: [floor.pallet.id],
    })
  } else if (totalBoxWeight > maxWeight * WEIGHT_WARNING_THRESHOLD) {
    violations.push({
      code: 'BR-101',
      severity: 'warning',
      message: `Peso de cajas (${totalBoxWeight.toFixed(1)}kg) supera el 90% del máximo del palet (${maxWeight}kg)`,
      involvedIds: [floor.pallet.id],
    })
  }

  return { isValid: violations.filter(v => v.severity === 'error').length === 0, violations }
}

// ─── BR-102: Peso máximo de camión ───────────────────────────────

export function validateTruckWeight(truck: Truck): ValidationResult {
  const violations: Violation[] = []
  const totalWeight = truck.pallets.reduce(
    (sum, pp) => sum + getStackedPalletTotalWeight(pp.stackedPallet),
    0,
  )

  if (totalWeight > truck.maxWeight) {
    violations.push({
      code: 'BR-102',
      severity: 'error',
      message: `Peso total (${totalWeight.toFixed(1)}kg) excede el máximo del camión (${truck.maxWeight}kg)`,
      involvedIds: [truck.id],
    })
  } else if (totalWeight > truck.maxWeight * WEIGHT_WARNING_THRESHOLD) {
    violations.push({
      code: 'BR-102',
      severity: 'warning',
      message: `Peso total (${totalWeight.toFixed(1)}kg) supera el 90% del máximo del camión (${truck.maxWeight}kg)`,
      involvedIds: [truck.id],
    })
  }

  return { isValid: violations.filter(v => v.severity === 'error').length === 0, violations }
}

// ─── BR-103: Peso sobre caja frágil ─────────────────────────────

export function validateFragileLoad(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []

  for (const pb of boxes) {
    if (!pb.box.fragile) continue
    const maxAbove = pb.box.fragilityMaxWeight ?? 0
    const weightAbove = calculateWeightAboveBox(pb, boxes)
    if (weightAbove > maxAbove) {
      violations.push({
        code: 'BR-103',
        severity: 'error',
        message: `Caja frágil ${pb.id} soporta ${weightAbove.toFixed(1)}kg (máx: ${maxAbove}kg)`,
        involvedIds: [pb.id],
      })
    }
  }

  return { isValid: violations.length === 0, violations }
}

/** Calcula el peso soportado encima de una caja */
function calculateWeightAboveBox(target: PlacedBox, allBoxes: PlacedBox[]): number {
  const tbb = getBoxBoundingBox(target)
  let weight = 0

  for (const other of allBoxes) {
    if (other.id === target.id) continue
    const obb = getBoxBoundingBox(other)
    // La otra caja está encima y se solapa horizontalmente
    if (
      obb.minY >= tbb.maxY - 1 &&
      obb.minX < tbb.maxX &&
      obb.maxX > tbb.minX &&
      obb.minZ < tbb.maxZ &&
      obb.maxZ > tbb.minZ
    ) {
      weight += other.box.weight
    }
  }

  return weight
}

// ─── BR-104: Distribución de peso ────────────────────────────────

export function validateWeightDistribution(pallet: Pallet, boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []
  if (boxes.length === 0) return { isValid: true, violations }

  const totalWeight = boxes.reduce((s, pb) => s + pb.box.weight, 0)
  if (totalWeight === 0) return { isValid: true, violations }

  // Centro de gravedad ponderado por peso
  let cogX = 0, cogZ = 0
  for (const pb of boxes) {
    const bb = getBoxBoundingBox(pb)
    const cx = (bb.minX + bb.maxX) / 2
    const cz = (bb.minZ + bb.maxZ) / 2
    cogX += cx * pb.box.weight
    cogZ += cz * pb.box.weight
  }
  cogX /= totalWeight
  cogZ /= totalWeight

  const centerX = pallet.dimensions.width / 2
  const centerZ = pallet.dimensions.depth / 2

  if (
    Math.abs(cogX - centerX) > pallet.dimensions.width / 6 ||
    Math.abs(cogZ - centerZ) > pallet.dimensions.depth / 6
  ) {
    violations.push({
      code: 'BR-104',
      severity: 'warning',
      message: `Centro de gravedad descentrado (${cogX.toFixed(0)}, ${cogZ.toFixed(0)}) respecto al centro del palet`,
      involvedIds: [pallet.id],
    })
  }

  return { isValid: true, violations }
}
