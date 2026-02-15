/**
 * Box — Individual box that can be placed on a pallet
 *
 * Represents a single container with physical properties, material characteristics,
 * and content information used by packing algorithms.
 */

import type { Dimensions3D } from '../types'

export interface Box {
  /** Unique identifier */
  id: string

  /** Physical dimensions in millimeters (width × height × depth) */
  dimensions: Dimensions3D

  /** Weight in kilograms */
  weight: number

  /** Stock Keeping Unit identifier */
  sku?: string

  /** Box type classification (e.g., 'standard', 'heavy-duty', 'fragile') */
  type?: string

  /**
   * Product identifier for grouping purposes
   *
   * Used by packing algorithms to group boxes with the same product into vertical columns.
   * This facilitates picking operations - boxes with the same product are placed in the
   * same (x,z) position across different layers.
   *
   * @example
   * product: 'PROD-001'  // All boxes with PROD-001 will form a column
   * product: 'SKU-ABC'   // All boxes with SKU-ABC will form another column
   */
  product?: string

  /**
   * Material resistance weight (0-10 scale)
   *
   * Determines vertical stacking order. Higher values = more resistant = placed lower.
   * Lower values = less resistant = placed higher.
   *
   * Common values:
   * - 0: Very fragile (cork, foam) - must be on top
   * - 3: Medium resistance (wood, cardboard)
   * - 6: High resistance (plastic, metal)
   * - 10: Maximum resistance (reinforced containers)
   *
   * @default 5
   * @example
   * materialWeight: 6  // Plastic box - goes at bottom
   * materialWeight: 3  // Wood box - goes in middle
   * materialWeight: 0  // Cork box - goes on top
   */
  materialWeight?: number

  /** Whether the box contains fragile items */
  fragile: boolean

  /** Maximum weight (kg) this box can support on top if fragile=true */
  fragilityMaxWeight?: number

  /** Whether this box can be stacked (have other boxes on top) */
  stackable: boolean

  /** Visual color for 3D rendering (CSS color or hex) */
  color?: string

  /** Texture URL for 3D rendering */
  texture?: string

  /** Custom 3D model URL (GLTF/GLB format) */
  modelUrl?: string

  /** Additional custom metadata */
  metadata: Record<string, unknown>
}
