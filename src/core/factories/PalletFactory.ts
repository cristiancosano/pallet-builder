/**
 * PalletFactory — Factories para crear palets estándar y custom
 */

import type { Pallet } from '../entities/Pallet'
import type { Dimensions3D } from '../types'
import { PalletMaterial } from '../types'
import { STANDARD_PALLETS } from '../constants'

let _palletCounter = 0

function nextPalletId(): string {
  return `pallet-${++_palletCounter}`
}

export class PalletFactory {
  /** Palet europeo EUR (1200×800×144mm, madera, 1000kg) */
  static euro(overrides?: Partial<Pallet>): Pallet {
    const preset = STANDARD_PALLETS.EUR
    return {
      id: nextPalletId(),
      dimensions: { ...preset.dimensions },
      material: preset.material,
      maxWeight: preset.maxWeight,
      maxStackHeight: preset.maxStackHeight,
      weight: preset.weight,
      metadata: {},
      ...overrides,
    }
  }

  /** Palet americano (1219×1016×145mm, madera, 1200kg) */
  static american(overrides?: Partial<Pallet>): Pallet {
    const preset = STANDARD_PALLETS.AMERICAN
    return {
      id: nextPalletId(),
      dimensions: { ...preset.dimensions },
      material: preset.material,
      maxWeight: preset.maxWeight,
      maxStackHeight: preset.maxStackHeight,
      weight: preset.weight,
      metadata: {},
      ...overrides,
    }
  }

  /** Palet asiático (1100×1100×150mm, madera, 1000kg) */
  static asia(overrides?: Partial<Pallet>): Pallet {
    const preset = STANDARD_PALLETS.ASIA
    return {
      id: nextPalletId(),
      dimensions: { ...preset.dimensions },
      material: preset.material,
      maxWeight: preset.maxWeight,
      maxStackHeight: preset.maxStackHeight,
      weight: preset.weight,
      metadata: {},
      ...overrides,
    }
  }

  /** Palet custom con dimensiones arbitrarias */
  static custom(dims: Dimensions3D, opts?: Partial<Pallet>): Pallet {
    return {
      id: nextPalletId(),
      dimensions: { ...dims },
      material: PalletMaterial.WOOD,
      maxWeight: 1000,
      maxStackHeight: 2200,
      weight: 25,
      metadata: {},
      ...opts,
    }
  }
}
