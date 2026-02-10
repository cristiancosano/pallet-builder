/**
 * Collision detection — AABB helpers y detección de colisiones
 * BR-002: Sin colisiones entre cajas
 * BR-003: Sin colisiones entre palets
 */

import type { BoundingBox, ValidationResult, Violation } from '../types'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PlacedPallet } from '../entities/PlacedPallet'
import { getStackedPalletTotalHeight } from '../entities/StackedPallet'
import { COLLISION_TOLERANCE } from '../constants'

// ─── Helpers ─────────────────────────────────────────────────────

/** Calcula el bounding box de una PlacedBox (teniendo en cuenta rotación discreta en Y) */
export function getBoxBoundingBox(pb: PlacedBox): BoundingBox {
  let w = pb.box.dimensions.width
  let d = pb.box.dimensions.depth
  const h = pb.box.dimensions.height

  // Rotación en Y: intercambia width y depth a 90° y 270°
  if (pb.rotation.y === 90 || pb.rotation.y === 270) {
    ;[w, d] = [d, w]
  }

  return {
    minX: pb.position.x,
    maxX: pb.position.x + w,
    minY: pb.position.y,
    maxY: pb.position.y + h,
    minZ: pb.position.z,
    maxZ: pb.position.z + d,
  }
}

/** Calcula el bounding box de un PlacedPallet completo */
export function getPalletBoundingBox(pp: PlacedPallet): BoundingBox {
  const stack = pp.stackedPallet
  const basePallet = stack.floors[0].pallet
  const w = basePallet.dimensions.width
  const d = basePallet.dimensions.depth
  const totalH = getStackedPalletTotalHeight(stack)

  // Convertir rotación a radianes
  const rotRad = (pp.yRotation * Math.PI) / 180
  const cos = Math.cos(rotRad)
  const sin = Math.sin(rotRad)

  // Calcular las 4 esquinas en coordenadas locales (sin rotar)
  const localCorners = [
    { x: 0, z: 0 },
    { x: w, z: 0 },
    { x: w, z: d },
    { x: 0, z: d },
  ]

  // Rotar cada esquina usando la convención Three.js (R_y) y trasladar a posición mundial
  // Three.js Y-rotation: x' = x·cos + z·sin, z' = -x·sin + z·cos
  const worldCorners = localCorners.map(corner => ({
    x: pp.position.x + corner.x * cos + corner.z * sin,
    z: pp.position.z - corner.x * sin + corner.z * cos,
  }))

  // Encontrar límites del bounding box
  const minX = Math.min(...worldCorners.map(c => c.x))
  const maxX = Math.max(...worldCorners.map(c => c.x))
  const minZ = Math.min(...worldCorners.map(c => c.z))
  const maxZ = Math.max(...worldCorners.map(c => c.z))

  return {
    minX,
    maxX,
    minY: pp.position.y,
    maxY: pp.position.y + totalH,
    minZ,
    maxZ,
  }
}

/** Comprueba si dos AABBs se intersectan (con tolerancia) */
export function aabbIntersects(a: BoundingBox, b: BoundingBox, tolerance = COLLISION_TOLERANCE): boolean {
  return (
    a.minX < b.maxX - tolerance &&
    a.maxX > b.minX + tolerance &&
    a.minY < b.maxY - tolerance &&
    a.maxY > b.minY + tolerance &&
    a.minZ < b.maxZ - tolerance &&
    a.maxZ > b.minZ + tolerance
  )
}

// ─── Validación ──────────────────────────────────────────────────

/** BR-002: Valida que no hay colisiones entre cajas */
export function validateNoBoxCollisions(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []

  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const bbA = getBoxBoundingBox(boxes[i])
      const bbB = getBoxBoundingBox(boxes[j])
      if (aabbIntersects(bbA, bbB)) {
        violations.push({
          code: 'BR-002',
          severity: 'error',
          message: `Colisión entre cajas ${boxes[i].id} y ${boxes[j].id}`,
          involvedIds: [boxes[i].id, boxes[j].id],
        })
      }
    }
  }

  return { isValid: violations.length === 0, violations }
}

/** BR-003: Valida que no hay colisiones entre palets */
export function validateNoPalletCollisions(pallets: PlacedPallet[]): ValidationResult {
  const violations: Violation[] = []

  for (let i = 0; i < pallets.length; i++) {
    for (let j = i + 1; j < pallets.length; j++) {
      const bbA = getPalletBoundingBox(pallets[i])
      const bbB = getPalletBoundingBox(pallets[j])
      if (aabbIntersects(bbA, bbB)) {
        violations.push({
          code: 'BR-003',
          severity: 'error',
          message: `Colisión entre palets ${pallets[i].id} y ${pallets[j].id}`,
          involvedIds: [pallets[i].id, pallets[j].id],
        })
      }
    }
  }

  return { isValid: violations.length === 0, violations }
}
