/**
 * usePhysicsValidation — Ejecuta todas las validaciones físicas sobre un piso de palet
 */

import { useMemo } from 'react'
import type { PlacedBox } from '@/core/entities/PlacedBox'
import type { Pallet } from '@/core/entities/Pallet'
import type { ValidationResult, Violation } from '@/core/types'
import { validateNoBoxCollisions } from '@/core/validation/collision'
import { validateAllBoxesInPalletBounds } from '@/core/validation/bounds'
import { validatePalletWeight } from '@/core/validation/weight'
import { validateFragileLoad, validateWeightDistribution } from '@/core/validation/weight'
import { validateSupport } from '@/core/validation/gravity'
import { validateBoxStackability, validateInvertedPyramid } from '@/core/validation/stacking'
import { validateStability, validateCogInsideSupport } from '@/core/validation/stability'
import type { PalletFloor } from '@/core/entities/PalletFloor'

export interface PhysicsValidationResult {
  isValid: boolean
  violations: Violation[]
  collisions: ValidationResult
  bounds: ValidationResult
  weight: ValidationResult
  gravity: ValidationResult
  stacking: ValidationResult
  stability: ValidationResult
  fragile: ValidationResult
  distribution: ValidationResult
}

export function usePhysicsValidation(
  boxes: PlacedBox[],
  pallet: Pallet,
): PhysicsValidationResult {
  return useMemo(() => {
    const collisions = validateNoBoxCollisions(boxes)
    const bounds = validateAllBoxesInPalletBounds(boxes, pallet)
    const floor: PalletFloor = { level: 0, pallet, boxes }
    const weight = validatePalletWeight(floor)
    const gravity = validateSupport(boxes)
    const stackability = validateBoxStackability(boxes)
    const invertedPyramid = validateInvertedPyramid(boxes)
    const stability = validateStability(pallet, boxes)
    const cogValid = validateCogInsideSupport(pallet, boxes)
    const fragile = validateFragileLoad(boxes)
    const distribution = validateWeightDistribution(pallet, boxes)

    const stackingViolations = [...stackability.violations, ...invertedPyramid.violations]
    const stabilityViolations = [...stability.violations, ...cogValid.violations]

    const allViolations: Violation[] = [
      ...collisions.violations,
      ...bounds.violations,
      ...weight.violations,
      ...gravity.violations,
      ...stackingViolations,
      ...stabilityViolations,
      ...fragile.violations,
      ...distribution.violations,
    ]

    return {
      isValid: allViolations.filter(v => v.severity === 'error').length === 0,
      violations: allViolations,
      collisions,
      bounds,
      weight,
      gravity,
      stacking: {
        isValid: stackability.isValid,
        violations: stackingViolations,
      },
      stability: {
        isValid: stability.isValid && cogValid.isValid,
        violations: stabilityViolations,
      },
      fragile,
      distribution,
    }
  }, [boxes, pallet])
}
