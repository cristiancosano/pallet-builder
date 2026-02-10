/**
 * Stacking validation
 * BR-201: Caja apilable
 * BR-202: Capacidad de soporte de caja
 * BR-203: Pirámide invertida
 * BR-301: Mismas dimensiones de planta en stack
 * BR-302: Separador obligatorio
 * BR-303: Altura total del stack
 * BR-304: Peso acumulado del stack
 */

import type { ValidationResult, Violation } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import type { StackedPallet } from '../entities/StackedPallet'
import { getStackedPalletTotalHeight, getStackedPalletTotalWeight } from '../entities/StackedPallet'
import { getBoxBoundingBox } from './collision'

// ─── Apilamiento de cajas ────────────────────────────────────────

/** BR-201: Valida que solo cajas apilables tienen otras encima */
export function validateBoxStackability(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []

  for (const pb of boxes) {
    if (pb.box.stackable) continue

    // Comprobar si hay algo encima
    const bb = getBoxBoundingBox(pb)
    for (const other of boxes) {
      if (other.id === pb.id) continue
      const obb = getBoxBoundingBox(other)
      if (
        obb.minY >= bb.maxY - 1 &&
        obb.minX < bb.maxX && obb.maxX > bb.minX &&
        obb.minZ < bb.maxZ && obb.maxZ > bb.minZ
      ) {
        violations.push({
          code: 'BR-201',
          severity: 'error',
          message: `Caja ${other.id} apilada sobre caja no apilable ${pb.id}`,
          involvedIds: [pb.id, other.id],
        })
      }
    }
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-203: Pirámide invertida — caja pesada sobre caja ligera */
export function validateInvertedPyramid(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []

  for (const bottom of boxes) {
    const bbb = getBoxBoundingBox(bottom)
    const bottomArea = (bbb.maxX - bbb.minX) * (bbb.maxZ - bbb.minZ)

    for (const top of boxes) {
      if (top.id === bottom.id) continue
      const tbb = getBoxBoundingBox(top)
      if (tbb.minY < bbb.maxY - 1) continue
      // Overlap check
      if (tbb.minX >= bbb.maxX || tbb.maxX <= bbb.minX || tbb.minZ >= bbb.maxZ || tbb.maxZ <= bbb.minZ) continue

      const topArea = (tbb.maxX - tbb.minX) * (tbb.maxZ - tbb.minZ)
      if (top.box.weight > bottom.box.weight * 1.5 && topArea > bottomArea * 1.2) {
        violations.push({
          code: 'BR-203',
          severity: 'warning',
          message: `Pirámide invertida: caja ${top.id} (${top.box.weight}kg) sobre caja ${bottom.id} (${bottom.box.weight}kg)`,
          involvedIds: [bottom.id, top.id],
        })
      }
    }
  }

  return { isValid: true, violations }
}

// ─── Apilamiento de palets ───────────────────────────────────────

/** BR-301: Todos los palets en un stack deben tener mismas dimensiones de planta */
export function validateStackDimensions(stack: StackedPallet): ValidationResult {
  const violations: Violation[] = []
  if (stack.floors.length <= 1) return { isValid: true, violations }

  const base = stack.floors[0].pallet
  for (let i = 1; i < stack.floors.length; i++) {
    const p = stack.floors[i].pallet
    if (p.dimensions.width !== base.dimensions.width || p.dimensions.depth !== base.dimensions.depth) {
      violations.push({
        code: 'BR-301',
        severity: 'error',
        message: `Piso ${i}: dimensiones (${p.dimensions.width}×${p.dimensions.depth}) distintas a la base (${base.dimensions.width}×${base.dimensions.depth})`,
        involvedIds: [base.id, p.id],
      })
    }
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-302: Separador obligatorio entre pisos */
export function validateSeparators(stack: StackedPallet): ValidationResult {
  const violations: Violation[] = []
  for (let i = 0; i < stack.floors.length - 1; i++) {
    if (!stack.floors[i].separatorAbove) {
      violations.push({
        code: 'BR-302',
        severity: 'error',
        message: `Falta separador entre piso ${i} y piso ${i + 1}`,
        involvedIds: [stack.id],
      })
    }
  }
  return { isValid: violations.length === 0, violations }
}

/** BR-303: Altura total del stack ≤ altura del contenedor */
export function validateStackHeight(stack: StackedPallet, containerHeight: number): ValidationResult {
  const violations: Violation[] = []
  const totalH = getStackedPalletTotalHeight(stack)

  if (totalH > containerHeight) {
    violations.push({
      code: 'BR-303',
      severity: 'error',
      message: `Altura del stack (${totalH}mm) excede la del contenedor (${containerHeight}mm)`,
      involvedIds: [stack.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-304: Peso total del stack ≤ maxWeight del palet base */
export function validateStackWeight(stack: StackedPallet): ValidationResult {
  const violations: Violation[] = []
  const totalWeight = getStackedPalletTotalWeight(stack)
  const baseMaxWeight = stack.floors[0].pallet.maxWeight

  // Descontar el peso del palet base, ya que maxWeight es la capacidad de carga
  const loadWeight = totalWeight - stack.floors[0].pallet.weight
  if (loadWeight > baseMaxWeight) {
    violations.push({
      code: 'BR-304',
      severity: 'error',
      message: `Peso de carga del stack (${loadWeight.toFixed(1)}kg) excede la capacidad del palet base (${baseMaxWeight}kg)`,
      involvedIds: [stack.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}
