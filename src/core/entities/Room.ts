/**
 * Room — Estancia dentro de un almacén
 */

import type { Point2D } from '../types'
import type { PlacedPallet } from './PlacedPallet'

export interface Room {
  id: string
  name: string
  floorPolygon: Point2D[]
  ceilingHeight: number  // mm
  pallets: PlacedPallet[]
  metadata: Record<string, unknown>
}
