/**
 * TruckFactory — Factories para crear camiones por preset o custom
 */

import type { Truck } from '../entities/Truck'
import type { Dimensions3D } from '../types'
import { TruckType } from '../types'
import { TRUCK_PRESETS } from '../constants'

let _truckCounter = 0

function nextTruckId(): string {
  return `truck-${++_truckCounter}`
}

export class TruckFactory {
  /** Crea un camión a partir de un preset de tipo */
  static fromPreset(type: Exclude<TruckType, 'CUSTOM'>, overrides?: Partial<Truck>): Truck {
    const preset = TRUCK_PRESETS[type]
    return {
      id: nextTruckId(),
      name: `Camión ${type}`,
      truckType: type,
      dimensions: { ...preset.dimensions },
      maxWeight: preset.maxWeight,
      pallets: [],
      metadata: {},
      ...overrides,
    }
  }

  /** Crea un camión custom con dimensiones y peso arbitrarios */
  static custom(dims: Dimensions3D, maxWeight: number, overrides?: Partial<Truck>): Truck {
    return {
      id: nextTruckId(),
      name: 'Camión Custom',
      truckType: TruckType.CUSTOM,
      dimensions: { ...dims },
      maxWeight,
      pallets: [],
      metadata: {},
      ...overrides,
    }
  }
}
