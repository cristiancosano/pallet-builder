/**
 * BoxFactory — Helper para crear cajas con defaults
 */

import type { Box } from '../entities/Box'
import type { Dimensions3D } from '../types'

let _boxCounter = 0

function nextBoxId(): string {
  return `box-${++_boxCounter}`
}

export class BoxFactory {
  /** Crea una caja con valores por defecto razonables */
  static create(dims: Dimensions3D, opts?: Partial<Box>): Box {
    return {
      id: nextBoxId(),
      dimensions: { ...dims },
      weight: 5,
      fragile: false,
      stackable: true,
      metadata: {},
      ...opts,
    }
  }

  /** Caja frágil con peso máximo encima */
  static fragile(dims: Dimensions3D, fragilityMaxWeight: number, opts?: Partial<Box>): Box {
    return BoxFactory.create(dims, {
      fragile: true,
      fragilityMaxWeight,
      ...opts,
    })
  }

  /** Caja pesada y no apilable */
  static heavy(dims: Dimensions3D, weight: number, opts?: Partial<Box>): Box {
    return BoxFactory.create(dims, {
      weight,
      stackable: false,
      ...opts,
    })
  }
}
