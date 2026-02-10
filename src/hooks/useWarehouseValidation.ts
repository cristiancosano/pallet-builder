/**
 * useWarehouseValidation — Valida palets dentro de habitaciones
 */

import { useMemo } from 'react'
import type { Room } from '@/core/entities/Room'
import type { ValidationResult, Violation } from '@/core/types'
import { validatePalletInRoom } from '@/core/validation/polygon'
import { validateNoPalletCollisions } from '@/core/validation/collision'

export interface WarehouseValidationResult {
  isValid: boolean
  violations: Violation[]
  palletInRoom: ValidationResult
  palletCollisions: ValidationResult
}

export function useWarehouseValidation(room: Room): WarehouseValidationResult {
  return useMemo(() => {
    // Validar que cada palet esté dentro del polígono de la habitación
    const roomViolations: Violation[] = []
    for (const placedPallet of room.pallets) {
      const result = validatePalletInRoom(placedPallet, room)
      roomViolations.push(...result.violations)
    }

    // Validar que no haya colisiones entre palets
    const collisions = validateNoPalletCollisions(room.pallets)

    const allViolations: Violation[] = [
      ...roomViolations,
      ...collisions.violations,
    ]

    return {
      isValid: allViolations.filter(v => v.severity === 'error').length === 0,
      violations: allViolations,
      palletInRoom: {
        isValid: roomViolations.length === 0,
        violations: roomViolations,
      },
      palletCollisions: collisions,
    }
  }, [room])
}
