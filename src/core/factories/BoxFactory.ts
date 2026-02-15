/**
 * BoxFactory — Helper for creating boxes with sensible defaults
 *
 * Provides factory methods for common box configurations.
 */

import type { Box } from '../entities/Box'
import type { Dimensions3D } from '../types'

let _boxCounter = 0

function nextBoxId(): string {
  return `box-${++_boxCounter}`
}

export class BoxFactory {
  /**
   * Creates a box with default values
   *
   * @param dims - Box dimensions in millimeters
   * @param opts - Optional overrides for any Box property
   * @returns A new Box instance with defaults applied
   *
   * @example
   * const box = BoxFactory.create(
   *   { width: 600, height: 400, depth: 400 },
   *   { product: 'PROD-A', materialWeight: 6 }
   * )
   */
  static create(dims: Dimensions3D, opts?: Partial<Box>): Box {
    return {
      id: nextBoxId(),
      dimensions: { ...dims },
      weight: 5,
      materialWeight: 5,  // Default: medium resistance
      fragile: false,
      stackable: true,
      metadata: {},
      ...opts,
    }
  }

  /**
   * Creates a fragile box with maximum weight limit
   *
   * @param dims - Box dimensions in millimeters
   * @param fragilityMaxWeight - Maximum weight (kg) this box can support on top
   * @param opts - Optional overrides
   * @returns A fragile Box instance
   *
   * @example
   * const fragileBox = BoxFactory.fragile(
   *   { width: 400, height: 300, depth: 300 },
   *   10,  // Can support max 10kg on top
   *   { materialWeight: 0, product: 'PROD-FRAGILE' }
   * )
   */
  static fragile(dims: Dimensions3D, fragilityMaxWeight: number, opts?: Partial<Box>): Box {
    return BoxFactory.create(dims, {
      fragile: true,
      fragilityMaxWeight,
      materialWeight: 0,  // Fragile boxes go on top
      ...opts,
    })
  }

  /**
   * Creates a heavy, non-stackable box
   *
   * @param dims - Box dimensions in millimeters
   * @param weight - Box weight in kilograms
   * @param opts - Optional overrides
   * @returns A heavy Box instance
   *
   * @example
   * const heavyBox = BoxFactory.heavy(
   *   { width: 800, height: 600, depth: 600 },
   *   50,  // 50kg
   *   { materialWeight: 8, product: 'PROD-HEAVY' }
   * )
   */
  static heavy(dims: Dimensions3D, weight: number, opts?: Partial<Box>): Box {
    return BoxFactory.create(dims, {
      weight,
      stackable: false,
      materialWeight: 8,  // Heavy boxes have high resistance
      ...opts,
    })
  }
}
