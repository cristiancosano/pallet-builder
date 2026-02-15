/**
 * MaterialGroupingStrategy — Layer-based packing with material weight ordering and product grouping
 *
 * This strategy combines multiple algorithms to create stable, well-organized pallets:
 * - Multi-criteria sorting (material resistance → product grouping → dimensions)
 * - Layer-based construction (horizontal layers from bottom to top)
 * - Maximal Rectangles algorithm for 2D bin packing per layer
 * - Product column grouping (same product in vertical columns for easy picking)
 *
 * ## Algorithm Overview
 *
 * 1. **Pre-processing**: Sort boxes by materialWeight (desc) → product → area (desc)
 * 2. **Layer Construction**: Build horizontal layers from bottom to top
 *    - Prioritize uniform height layers with 100% coverage
 *    - Allow mixed heights if necessary to fill space
 *    - Maintain product grouping in vertical columns
 * 3. **2D Packing**: Use Maximal Rectangles for each layer
 * 4. **Scoring**: Prioritize positions that continue product columns
 *
 * ## Material Weight System
 *
 * Boxes with higher `materialWeight` are more resistant and placed lower:
 * - materialWeight: 10 → Maximum resistance → Bottom layers
 * - materialWeight: 5  → Medium resistance → Middle layers
 * - materialWeight: 0  → Fragile → Top layers
 *
 * ## Product Grouping
 *
 * Boxes with the same `product` value are grouped in vertical columns.
 * This facilitates picking: all boxes of Product A can be extracted as a column.
 *
 * @example
 * ```typescript
 * const strategy = new MaterialGroupingStrategy()
 * const boxes = [
 *   BoxFactory.create({ width: 600, height: 400, depth: 400 }, {
 *     product: 'PROD-A',
 *     materialWeight: 6
 *   }),
 *   BoxFactory.create({ width: 600, height: 400, depth: 400 }, {
 *     product: 'PROD-B',
 *     materialWeight: 0
 *   }),
 * ]
 * const pallet = PalletFactory.euro()
 * const result = strategy.pack(boxes, pallet)
 * // Result: PROD-A on bottom (materialWeight=6), PROD-B on top (materialWeight=0)
 * ```
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PackingStrategy, PackingResult } from './PackingStrategy'
import { calculateCenterOfGravity, calculateStabilityScore } from '../validation/stability'

// ─── Auxiliary Interfaces ────────────────────────────────────────────

/**
 * Represents a horizontal layer in the pallet
 */
interface Layer {
  /** Vertical position (Y coordinate) where this layer starts */
  y: number
  /** Height of this layer (max height of boxes in it) */
  height: number
  /** Boxes placed in this layer */
  placements: PlacedBox[]
  /** Coverage percentage of pallet area (0-100) */
  coverage: number
}

/**
 * Represents a free rectangular space where a box can be placed
 * Used by the Maximal Rectangles algorithm
 */
interface Rectangle {
  /** X coordinate of bottom-left corner */
  x: number
  /** Z coordinate of bottom-left corner */
  z: number
  /** Width of the rectangle */
  width: number
  /** Depth of the rectangle */
  depth: number
}

/**
 * Box orientation (rotation around Y axis)
 */
interface Orientation {
  /** Effective width after rotation */
  width: number
  /** Effective depth after rotation */
  depth: number
  /** Rotation angle in degrees (0 or 90) */
  rotation: 0 | 90
}

// ─── MaterialGroupingStrategy ────────────────────────────────────────

export class MaterialGroupingStrategy implements PackingStrategy {
  readonly id = 'material-grouping'
  readonly name = 'Material & Product Grouping'

  /**
   * Packs boxes into a pallet using layer-based approach with material ordering
   *
   * @param boxes - Boxes to pack
   * @param pallet - Target pallet
   * @returns Packing result with placements and metrics
   */
  pack(boxes: Box[], pallet: Pallet): PackingResult {
    if (boxes.length === 0) {
      return this.emptyResult(pallet)
    }

    // Phase 1: Sort boxes by material weight, product, and dimensions
    const sortedBoxes = this.sortBoxes(boxes)

    // Phase 2: Group by material weight
    const materialGroups = this.groupByMaterialWeight(sortedBoxes)

    // Phase 3: Build layers from bottom to top
    const layers = this.buildLayers(materialGroups, pallet)

    // Phase 4: Convert layers to placements
    const placements = layers.flatMap(layer => layer.placements)

    // Phase 5: Calculate metrics
    const unplacedBoxes = boxes.filter(
      box => !placements.some(p => p.box.id === box.id),
    )

    const metrics = this.calculateMetrics(placements, pallet)

    return {
      placements,
      metrics,
      unplacedBoxes,
    }
  }

  // ─── Phase 1: Sorting ──────────────────────────────────────────────

  /**
   * Sorts boxes by multiple criteria:
   * 1. Material weight (descending) - more resistant boxes first
   * 2. Product (alphabetical) - group same products together
   * 3. Base area (descending) - larger boxes first for stable base
   * 4. Height (descending) - taller boxes first for better layer filling
   *
   * @param boxes - Boxes to sort
   * @returns Sorted boxes array
   */
  private sortBoxes(boxes: Box[]): Box[] {
    return [...boxes].sort((a, b) => {
      // 1. Material weight (descending) - more resistant = lower in pallet
      const weightA = a.materialWeight ?? 5
      const weightB = b.materialWeight ?? 5
      if (weightA !== weightB) {
        return weightB - weightA
      }

      // 2. Product (alphabetical grouping)
      const productA = a.product ?? ''
      const productB = b.product ?? ''
      if (productA !== productB) {
        return productA.localeCompare(productB)
      }

      // 3. Base area (descending) - larger boxes first
      const areaA = a.dimensions.width * a.dimensions.depth
      const areaB = b.dimensions.width * b.dimensions.depth
      if (areaA !== areaB) {
        return areaB - areaA
      }

      // 4. Height (descending) - taller boxes first
      return b.dimensions.height - a.dimensions.height
    })
  }

  /**
   * Groups boxes by material weight for layer construction
   *
   * @param boxes - Sorted boxes
   * @returns Map of material weight → boxes with that weight
   */
  private groupByMaterialWeight(boxes: Box[]): Map<number, Box[]> {
    const groups = new Map<number, Box[]>()

    for (const box of boxes) {
      const weight = box.materialWeight ?? 5
      if (!groups.has(weight)) {
        groups.set(weight, [])
      }
      groups.get(weight)!.push(box)
    }

    // Sort groups by material weight (descending)
    return new Map([...groups.entries()].sort((a, b) => b[0] - a[0]))
  }

  // ─── Phase 2: Layer Construction ──────────────────────────────────

  /**
   * Builds layers from bottom to top, processing each material weight group
   *
   * @param materialGroups - Boxes grouped by material weight
   * @param pallet - Target pallet
   * @returns Array of layers
   */
  private buildLayers(materialGroups: Map<number, Box[]>, pallet: Pallet): Layer[] {
    const layers: Layer[] = []
    const occupiedColumns = new Map<string, string>() // "x,z" → product
    const allPlacements: PlacedBox[] = [] // All placements from all layers
    let currentY = 0

    // Process each material group (from highest weight to lowest)
    for (const [, boxes] of materialGroups) {
      let remainingBoxes = [...boxes]

      // Build layers until all boxes of this material are placed
      while (remainingBoxes.length > 0) {
        const layer = this.buildNextLayer(
          remainingBoxes,
          pallet,
          currentY,
          occupiedColumns,
          allPlacements,
        )

        if (layer.placements.length === 0) {
          // No boxes could be placed, stop trying
          break
        }

        layers.push(layer)
        allPlacements.push(...layer.placements) // Add new placements to history
        currentY += layer.height

        // Remove placed boxes from remaining
        const placedIds = new Set(layer.placements.map(p => p.box.id))
        remainingBoxes = remainingBoxes.filter(b => !placedIds.has(b.id))

        // Check if we exceeded pallet height
        if (currentY >= pallet.maxStackHeight) {
          break
        }
      }
    }

    return layers
  }

  /**
   * Builds the next layer using available boxes
   *
   * Strategy:
   * 1. Try uniform height layer with 100% coverage
   * 2. If not possible, try mixed height layer
   * 3. If still not possible, use partial coverage (last resort)
   *
   * @param availableBoxes - Boxes available for this layer
   * @param pallet - Target pallet
   * @param currentY - Current vertical position
   * @param occupiedColumns - Track which (x,z) positions have which product
   * @param allPreviousPlacements - All placements from previous layers (for support calculation)
   * @returns Constructed layer
   */
  private buildNextLayer(
    availableBoxes: Box[],
    pallet: Pallet,
    currentY: number,
    occupiedColumns: Map<string, string>,
    allPreviousPlacements: PlacedBox[],
  ): Layer {
    // Strategy 1: Uniform height layer
    const uniformLayer = this.tryUniformHeightLayer(
      availableBoxes,
      pallet,
      currentY,
      occupiedColumns,
      allPreviousPlacements,
    )

    if (uniformLayer && uniformLayer.coverage >= 95) {
      return uniformLayer
    }

    // Strategy 2: Mixed height layer (fallback)
    const mixedLayer = this.tryMixedHeightLayer(
      availableBoxes,
      pallet,
      currentY,
      occupiedColumns,
      allPreviousPlacements,
    )

    if (mixedLayer && mixedLayer.coverage >= 95) {
      return mixedLayer
    }

    // Strategy 3: Use best available (even if partial coverage)
    const bestLayer =
      (uniformLayer?.coverage ?? 0) > (mixedLayer?.coverage ?? 0)
        ? uniformLayer
        : mixedLayer

    return bestLayer ?? this.emptyLayer(currentY)
  }

  /**
   * Attempts to create a layer with boxes of uniform height
   *
   * @param boxes - Available boxes
   * @param pallet - Target pallet
   * @param currentY - Current vertical position
   * @param occupiedColumns - Occupied column tracker
   * @param allPreviousPlacements - All placements from previous layers
   * @returns Layer or null if not possible
   */
  private tryUniformHeightLayer(
    boxes: Box[],
    pallet: Pallet,
    currentY: number,
    occupiedColumns: Map<string, string>,
    allPreviousPlacements: PlacedBox[],
  ): Layer | null {
    // Group boxes by height
    const heightGroups = new Map<number, Box[]>()
    for (const box of boxes) {
      const h = box.dimensions.height
      if (!heightGroups.has(h)) {
        heightGroups.set(h, [])
      }
      heightGroups.get(h)!.push(box)
    }

    // Try each height group, starting with most common
    const sortedHeights = [...heightGroups.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    )

    for (const [height, boxesOfHeight] of sortedHeights) {
      // Check if layer would exceed pallet height
      if (currentY + height > pallet.maxStackHeight) {
        continue
      }

      const layer = this.placeBoxesInLayer(
        boxesOfHeight,
        pallet,
        currentY,
        height,
        occupiedColumns,
        allPreviousPlacements,
      )

      if (layer.coverage >= 95) {
        return layer
      }
    }

    return null
  }

  /**
   * Attempts to create a layer with boxes of mixed heights
   *
   * @param boxes - Available boxes
   * @param pallet - Target pallet
   * @param currentY - Current vertical position
   * @param occupiedColumns - Occupied column tracker
   * @param allPreviousPlacements - All placements from previous layers
   * @returns Layer or null if not possible
   */
  private tryMixedHeightLayer(
    boxes: Box[],
    pallet: Pallet,
    currentY: number,
    occupiedColumns: Map<string, string>,
    allPreviousPlacements: PlacedBox[],
  ): Layer | null {
    // Allow any height (no filtering)
    return this.placeBoxesInLayer(boxes, pallet, currentY, null, occupiedColumns, allPreviousPlacements)
  }

  // ─── Phase 3: Maximal Rectangles 2D Packing ───────────────────────

  /**
   * Places boxes in a layer using Maximal Rectangles algorithm
   *
   * @param boxes - Boxes to place
   * @param pallet - Target pallet
   * @param currentY - Y coordinate of this layer
   * @param targetHeight - If specified, only use boxes of this height
   * @param occupiedColumns - Track product columns
   * @param allPreviousPlacements - All placements from previous layers (for support calculation)
   * @returns Constructed layer
   */
  private placeBoxesInLayer(
    boxes: Box[],
    pallet: Pallet,
    currentY: number,
    targetHeight: number | null,
    occupiedColumns: Map<string, string>,
    allPreviousPlacements: PlacedBox[],
  ): Layer {
    // Initialize with full pallet as single free rectangle
    const freeRectangles: Rectangle[] = [
      {
        x: 0,
        z: 0,
        width: pallet.dimensions.width,
        depth: pallet.dimensions.depth,
      },
    ]

    const placements: PlacedBox[] = []

    // Group boxes by product for grouping priority
    const productGroups = this.groupByProduct(boxes)

    // Sort product groups by count (more boxes = higher priority)
    const sortedGroups = [...productGroups.entries()].sort(
      (a, b) => b[1].length - a[1].length,
    )

    let placementId = 0

    // For each product group
    for (const [product, productBoxes] of sortedGroups) {
      // Filter by target height if specified
      const validBoxes = targetHeight
        ? productBoxes.filter(b => b.dimensions.height === targetHeight)
        : productBoxes

      // Try to place each box
      for (const box of validBoxes) {
        // Check if layer would exceed pallet height
        if (currentY + box.dimensions.height > pallet.maxStackHeight) {
          continue
        }

        // Try both orientations (0° and 90°)
        const orientations: Orientation[] = [
          {
            width: box.dimensions.width,
            depth: box.dimensions.depth,
            rotation: 0,
          },
          {
            width: box.dimensions.depth,
            depth: box.dimensions.width,
            rotation: 90,
          },
        ]

        let placed = false

        for (const orientation of orientations) {
          // Combine previous placements with current layer placements for support calculation
          const allPlacementsForSupport = [...allPreviousPlacements, ...placements]

          const bestRect = this.findBestRectangle(
            orientation,
            freeRectangles,
            occupiedColumns,
            product,
            currentY,
            allPlacementsForSupport,
            pallet,
          )

          if (bestRect) {
            // Place the box
            const placement: PlacedBox = {
              id: `placed-${++placementId}`,
              box,
              position: { x: bestRect.x, y: currentY, z: bestRect.z },
              rotation: { x: 0, y: orientation.rotation, z: 0 },
              supportedBy: [],
              supporting: [],
            }

            placements.push(placement)
            placed = true

            // Update occupied columns
            this.updateOccupiedColumns(
              occupiedColumns,
              bestRect.x,
              bestRect.z,
              orientation.width,
              orientation.depth,
              product,
            )

            // Update free rectangles (Maximal Rectangles algorithm)
            this.updateFreeRectangles(
              freeRectangles,
              bestRect,
              orientation.width,
              orientation.depth,
            )

            break // Box placed, try next box
          }
        }
      }
    }

    // Calculate layer metrics
    const palletArea = pallet.dimensions.width * pallet.dimensions.depth
    const usedArea = placements.reduce((sum, p) => {
      const w =
        p.rotation.y === 90 ? p.box.dimensions.depth : p.box.dimensions.width
      const d =
        p.rotation.y === 90 ? p.box.dimensions.width : p.box.dimensions.depth
      return sum + w * d
    }, 0)

    const maxHeight =
      placements.length > 0
        ? Math.max(...placements.map(p => p.box.dimensions.height))
        : 0

    return {
      y: currentY,
      height: maxHeight,
      placements,
      coverage: (usedArea / palletArea) * 100,
    }
  }

  /**
   * Finds the best free rectangle for a box using scoring
   *
   * @param boxDims - Box dimensions (with rotation applied)
   * @param freeRectangles - Available free spaces
   * @param occupiedColumns - Product column tracker
   * @param product - Product identifier
   * @param currentY - Current layer Y position
   * @param existingPlacements - Already placed boxes in this layer and below
   * @param pallet - Pallet dimensions
   * @returns Best rectangle or null if none fit
   */
  private findBestRectangle(
    boxDims: Orientation,
    freeRectangles: Rectangle[],
    occupiedColumns: Map<string, string>,
    product: string,
    currentY: number,
    existingPlacements: PlacedBox[],
    pallet: Pallet,
  ): Rectangle | null {
    let bestRect: Rectangle | null = null
    let bestScore = -Infinity

    for (const rect of freeRectangles) {
      // Check if box fits
      if (boxDims.width <= rect.width && boxDims.depth <= rect.depth) {
        // Validate support
        const supportArea = this.calculateSupportArea(
          rect.x,
          rect.z,
          boxDims.width,
          boxDims.depth,
          currentY,
          existingPlacements,
          pallet,
        )

        const boxBaseArea = boxDims.width * boxDims.depth
        const supportPercentage = supportArea / boxBaseArea

        // Require at least 70% support (unless on ground level which returns 100%)
        if (supportPercentage < 0.7) {
          continue // Skip this position - insufficient support
        }

        // Check if box would extend beyond the lower layer footprint
        // This ensures we always use the lower layer as a base and don't stack
        // boxes that hang over edges when space is available in the lower layer
        if (
          this.boxExtendsBeyondLowerLayer(
            rect.x,
            rect.z,
            boxDims.width,
            boxDims.depth,
            currentY,
            existingPlacements,
          )
        ) {
          continue // Skip this position - extends beyond lower layer
        }

        const score = this.scoreRectangle(rect, boxDims, occupiedColumns, product)

        if (score > bestScore) {
          bestScore = score
          bestRect = rect
        }
      }
    }

    return bestRect
  }

  /**
   * Calculates the area of support a box would have at a given position
   *
   * @param x - X position of box
   * @param z - Z position of box
   * @param width - Width of box
   * @param depth - Depth of box
   * @param currentY - Y position where box will be placed
   * @param existingPlacements - Boxes already placed in current and previous layers
   * @param pallet - Pallet dimensions
   * @returns Supported area in mm²
   */
  private calculateSupportArea(
    x: number,
    z: number,
    width: number,
    depth: number,
    currentY: number,
    existingPlacements: PlacedBox[],
    pallet: Pallet,
  ): number {
    let supportedArea = 0

    // If on ground level (Y=0), full support from pallet
    if (currentY === 0) {
      return width * depth
    }

    // Calculate intersection with boxes in layers below
    for (const placement of existingPlacements) {
      const boxW =
        placement.rotation.y === 90
          ? placement.box.dimensions.depth
          : placement.box.dimensions.width
      const boxD =
        placement.rotation.y === 90
          ? placement.box.dimensions.width
          : placement.box.dimensions.depth

      const boxTop = placement.position.y + placement.box.dimensions.height

      // Only consider boxes whose top surface is at currentY (directly below)
      // Allow small tolerance for floating point errors
      const tolerance = 1 // 1mm tolerance
      if (Math.abs(boxTop - currentY) > tolerance) {
        continue // Not directly below
      }

      const intersection = this.calculateRectangleIntersection(
        x,
        z,
        width,
        depth,
        placement.position.x,
        placement.position.z,
        boxW,
        boxD,
      )
      supportedArea += intersection
    }

    return supportedArea
  }

  /**
   * Calculates intersection area between two rectangles
   *
   * @returns Intersection area in mm²
   */
  private calculateRectangleIntersection(
    x1: number,
    z1: number,
    w1: number,
    d1: number,
    x2: number,
    z2: number,
    w2: number,
    d2: number,
  ): number {
    const overlapX = Math.max(
      0,
      Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2),
    )
    const overlapZ = Math.max(
      0,
      Math.min(z1 + d1, z2 + d2) - Math.max(z1, z2),
    )

    return overlapX * overlapZ
  }

  /**
   * Checks if a box would extend beyond the footprint of boxes in the layer directly below
   *
   * This ensures that boxes in upper layers are always stacked on top of lower boxes,
   * preventing boxes from "hanging" over edges when there's available space in the lower layer.
   *
   * @param x - X position of box
   * @param z - Z position of box
   * @param width - Width of box
   * @param depth - Depth of box
   * @param currentY - Y position where box will be placed
   * @param existingPlacements - Boxes already placed in current and previous layers
   * @returns true if box extends beyond lower layer footprint
   */
  private boxExtendsBeyondLowerLayer(
    x: number,
    z: number,
    width: number,
    depth: number,
    currentY: number,
    existingPlacements: PlacedBox[],
  ): boolean {
    // Ground level - no issue
    if (currentY === 0) {
      return false
    }

    // Find all boxes in the layer directly below
    const boxesDirectlyBelow = existingPlacements.filter(p => {
      const boxTop = p.position.y + p.box.dimensions.height
      const tolerance = 1 // 1mm tolerance
      return Math.abs(boxTop - currentY) <= tolerance
    })

    // No boxes below - this shouldn't happen if support was validated
    if (boxesDirectlyBelow.length === 0) {
      return true // Reject - no base to stack on
    }

    // Calculate the bounding box of all boxes in the layer directly below
    let minX = Infinity
    let maxX = -Infinity
    let minZ = Infinity
    let maxZ = -Infinity

    for (const p of boxesDirectlyBelow) {
      const boxW =
        p.rotation.y === 90
          ? p.box.dimensions.depth
          : p.box.dimensions.width
      const boxD =
        p.rotation.y === 90
          ? p.box.dimensions.width
          : p.box.dimensions.depth

      minX = Math.min(minX, p.position.x)
      maxX = Math.max(maxX, p.position.x + boxW)
      minZ = Math.min(minZ, p.position.z)
      maxZ = Math.max(maxZ, p.position.z + boxD)
    }

    // Check if our box would extend beyond this bounding box
    const boxRight = x + width
    const boxBack = z + depth
    const tolerance = 1 // 1mm tolerance

    const extendsBeyond =
      x < minX - tolerance ||
      boxRight > maxX + tolerance ||
      z < minZ - tolerance ||
      boxBack > maxZ + tolerance

    return extendsBeyond
  }

  /**
   * Scores a rectangle position based on multiple criteria
   *
   * Higher score = better position
   *
   * @param rect - Free rectangle
   * @param boxDims - Box dimensions
   * @param occupiedColumns - Product column tracker
   * @param product - Product identifier
   * @returns Score value
   */
  private scoreRectangle(
    rect: Rectangle,
    boxDims: Orientation,
    occupiedColumns: Map<string, string>,
    product: string,
  ): number {
    let score = 0

    const columnKey = `${rect.x},${rect.z}`

    // +100: Column continuation (same product in vertical column)
    if (occupiedColumns.get(columnKey) === product) {
      score += 100
    }

    // -50: Column mixing (different product in same column)
    if (
      occupiedColumns.has(columnKey) &&
      occupiedColumns.get(columnKey) !== product
    ) {
      score -= 50
    }

    // +50: Best fit (minimize wasted area)
    const wastedArea =
      rect.width * rect.depth - boxDims.width * boxDims.depth
    score += 50 / (1 + wastedArea / 10000)

    // +30: Bottom-left preference (more stable)
    score += 30 / (1 + rect.x / 1000 + rect.z / 1000)

    return score
  }

  /**
   * Updates free rectangles after placing a box (Maximal Rectangles algorithm)
   *
   * @param freeRects - Current free rectangles
   * @param usedRect - Rectangle being used by the new box
   * @param boxWidth - Width of placed box
   * @param boxDepth - Depth of placed box
   */
  private updateFreeRectangles(
    freeRects: Rectangle[],
    usedRect: Rectangle,
    boxWidth: number,
    boxDepth: number,
  ): void {
    const newRects: Rectangle[] = []

    for (let i = freeRects.length - 1; i >= 0; i--) {
      const rect = freeRects[i]

      // Check if this rectangle intersects with the placed box
      if (this.rectanglesIntersect(rect, usedRect, boxWidth, boxDepth)) {
        // Remove this rectangle
        freeRects.splice(i, 1)

        // Generate new rectangles from the split

        // Left rectangle
        if (usedRect.x > rect.x) {
          newRects.push({
            x: rect.x,
            z: rect.z,
            width: usedRect.x - rect.x,
            depth: rect.depth,
          })
        }

        // Right rectangle
        if (usedRect.x + boxWidth < rect.x + rect.width) {
          newRects.push({
            x: usedRect.x + boxWidth,
            z: rect.z,
            width: rect.x + rect.width - (usedRect.x + boxWidth),
            depth: rect.depth,
          })
        }

        // Top rectangle
        if (usedRect.z > rect.z) {
          newRects.push({
            x: rect.x,
            z: rect.z,
            width: rect.width,
            depth: usedRect.z - rect.z,
          })
        }

        // Bottom rectangle
        if (usedRect.z + boxDepth < rect.z + rect.depth) {
          newRects.push({
            x: rect.x,
            z: usedRect.z + boxDepth,
            width: rect.width,
            depth: rect.z + rect.depth - (usedRect.z + boxDepth),
          })
        }
      }
    }

    // Add new rectangles
    freeRects.push(...newRects)

    // Remove rectangles that are contained within others (optimization)
    this.removeContainedRectangles(freeRects)
  }

  /**
   * Checks if two rectangles intersect
   */
  private rectanglesIntersect(
    rect: Rectangle,
    usedRect: Rectangle,
    boxWidth: number,
    boxDepth: number,
  ): boolean {
    return !(
      usedRect.x + boxWidth <= rect.x ||
      usedRect.x >= rect.x + rect.width ||
      usedRect.z + boxDepth <= rect.z ||
      usedRect.z >= rect.z + rect.depth
    )
  }

  /**
   * Removes rectangles that are fully contained within other rectangles
   */
  private removeContainedRectangles(rectangles: Rectangle[]): void {
    for (let i = rectangles.length - 1; i >= 0; i--) {
      const rect = rectangles[i]

      for (let j = 0; j < rectangles.length; j++) {
        if (i === j) continue

        const other = rectangles[j]

        // Check if rect is contained in other
        if (
          rect.x >= other.x &&
          rect.z >= other.z &&
          rect.x + rect.width <= other.x + other.width &&
          rect.z + rect.depth <= other.z + other.depth
        ) {
          rectangles.splice(i, 1)
          break
        }
      }
    }
  }

  /**
   * Updates the occupied columns map after placing a box
   */
  private updateOccupiedColumns(
    occupiedColumns: Map<string, string>,
    x: number,
    z: number,
    width: number,
    depth: number,
    product: string,
  ): void {
    // Mark this position as occupied by this product
    const columnKey = `${x},${z}`
    if (!occupiedColumns.has(columnKey)) {
      occupiedColumns.set(columnKey, product)
    }
  }

  // ─── Utility Methods ───────────────────────────────────────────────

  /**
   * Groups boxes by product identifier
   */
  private groupByProduct(boxes: Box[]): Map<string, Box[]> {
    const groups = new Map<string, Box[]>()

    for (const box of boxes) {
      const product = box.product ?? 'default'
      if (!groups.has(product)) {
        groups.set(product, [])
      }
      groups.get(product)!.push(box)
    }

    return groups
  }

  /**
   * Creates an empty layer
   */
  private emptyLayer(y: number): Layer {
    return {
      y,
      height: 0,
      placements: [],
      coverage: 0,
    }
  }

  /**
   * Creates an empty packing result
   */
  private emptyResult(pallet: Pallet): PackingResult {
    return {
      placements: [],
      metrics: {
        volumeUtilization: 0,
        weightUtilization: 0,
        centerOfGravity: { x: 0, y: 0, z: 0 },
        stabilityScore: 100,
      },
      unplacedBoxes: [],
    }
  }

  /**
   * Calculates packing metrics
   */
  private calculateMetrics(placements: PlacedBox[], pallet: Pallet) {
    const palletVolume =
      pallet.dimensions.width *
      pallet.maxStackHeight *
      pallet.dimensions.depth

    const usedVolume = placements.reduce((sum, p) => {
      const d = p.box.dimensions
      return sum + d.width * d.height * d.depth
    }, 0)

    const totalWeight = placements.reduce((sum, p) => sum + p.box.weight, 0)

    return {
      volumeUtilization: palletVolume > 0 ? usedVolume / palletVolume : 0,
      weightUtilization:
        pallet.maxWeight > 0 ? totalWeight / pallet.maxWeight : 0,
      centerOfGravity: calculateCenterOfGravity(placements),
      stabilityScore: calculateStabilityScore(pallet, placements),
    }
  }
}
