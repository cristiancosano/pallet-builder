/**
 * Truck — Espacio de carga de un vehículo
 */

import type { Dimensions3D, TruckType } from '../types'
import type { PlacedPallet } from './PlacedPallet'

export interface Truck {
  id: string
  name: string
  truckType: TruckType
  dimensions: Dimensions3D
  maxWeight: number  // kg
  pallets: PlacedPallet[]
  licensePlate?: string
  metadata: Record<string, unknown>
}
