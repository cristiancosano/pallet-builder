/**
 * Polygon validation — Point-in-polygon para estancias
 * BR-401: Palet dentro del polígono de la estancia
 */

import type { Point2D, ValidationResult, Violation } from '../types'
import type { PlacedPallet } from '../entities/PlacedPallet'
import type { Room } from '../entities/Room'
import { getPalletBoundingBox } from './collision'

/**
 * Point-in-polygon test (ray casting algorithm)
 */
export function pointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, zi = polygon[i].z
    const xj = polygon[j].x, zj = polygon[j].z

    if (
      ((zi > point.z) !== (zj > point.z)) &&
      (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi)
    ) {
      inside = !inside
    }
  }

  return inside
}

/** BR-401: Valida que un palet está completamente dentro del polígono de la estancia */
export function validatePalletInRoom(pallet: PlacedPallet, room: Room): ValidationResult {
  const violations: Violation[] = []
  const bb = getPalletBoundingBox(pallet)

  // Test las 4 esquinas de la huella 2D del palet
  const corners: Point2D[] = [
    { x: bb.minX, z: bb.minZ },
    { x: bb.maxX, z: bb.minZ },
    { x: bb.maxX, z: bb.maxZ },
    { x: bb.minX, z: bb.maxZ },
  ]

  for (const corner of corners) {
    if (!pointInPolygon(corner, room.floorPolygon)) {
      violations.push({
        code: 'BR-401',
        severity: 'error',
        message: `Palet ${pallet.id} fuera de la estancia ${room.name} en (${corner.x}, ${corner.z})`,
        involvedIds: [pallet.id, room.id],
      })
      break // Una esquina fuera es suficiente
    }
  }

  // BR-403: Altura
  if (bb.maxY > room.ceilingHeight) {
    violations.push({
      code: 'BR-403',
      severity: 'error',
      message: `Palet ${pallet.id} excede el techo de la estancia ${room.name}`,
      involvedIds: [pallet.id, room.id],
    })
  }

  return { isValid: violations.length === 0, violations }
}
