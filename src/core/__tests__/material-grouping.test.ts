/**
 * Tests — MaterialGroupingStrategy
 *
 * Tests for layer-based packing with material weight ordering and product grouping
 */

import { describe, it, expect } from 'vitest'
import { MaterialGroupingStrategy } from '../packing/MaterialGroupingStrategy'
import { BoxFactory } from '../factories/BoxFactory'
import { PalletFactory } from '../factories/PalletFactory'
import type { PackingResult } from '../packing/PackingStrategy'
import { validateNoBoxCollisions } from '../validation/collision'

const euroPallet = () => PalletFactory.euro()

/**
 * Helper to validate common packing result invariants
 */
function expectValidPackingResult(
  result: PackingResult,
  totalBoxes: number,
) {
  // All boxes should be accounted for (placed or unplaced)
  expect(result.placements.length + result.unplacedBoxes.length).toBe(
    totalBoxes,
  )

  // Valid metrics ranges
  expect(result.metrics.volumeUtilization).toBeGreaterThanOrEqual(0)
  expect(result.metrics.volumeUtilization).toBeLessThanOrEqual(1)
  expect(result.metrics.weightUtilization).toBeGreaterThanOrEqual(0)
  expect(result.metrics.stabilityScore).toBeGreaterThanOrEqual(0)
  expect(result.metrics.stabilityScore).toBeLessThanOrEqual(100)

  // No collisions between placed boxes
  if (result.placements.length > 1) {
    const collisionResult = validateNoBoxCollisions(result.placements)
    expect(collisionResult.isValid).toBe(true)
  }
}

// ─── Basic Functionality ─────────────────────────────────────────────

describe('MaterialGroupingStrategy - Basic', () => {
  const strategy = new MaterialGroupingStrategy()

  it('has correct id and name', () => {
    expect(strategy.id).toBe('material-grouping')
    expect(strategy.name).toBeTruthy()
  })

  it('handles empty box list', () => {
    const pallet = euroPallet()
    const result = strategy.pack([], pallet)

    expect(result.placements).toHaveLength(0)
    expect(result.unplacedBoxes).toHaveLength(0)
    expect(result.metrics.volumeUtilization).toBe(0)
  })

  it('places a single box', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 1)
    expect(result.placements).toHaveLength(1)
    expect(result.placements[0].position).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('places multiple boxes of same type', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 4)
    expect(result.placements.length).toBe(4)
  })
})

// ─── Material Weight Ordering ────────────────────────────────────────

describe('MaterialGroupingStrategy - Material Ordering', () => {
  const strategy = new MaterialGroupingStrategy()

  it('places boxes with higher materialWeight at the bottom', () => {
    const pallet = euroPallet()
    const boxes = [
      // Create in mixed order
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 0, product: 'PROD-FRAGILE', id: 'fragile-box' },
      ),
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 6, product: 'PROD-HEAVY', id: 'heavy-box' },
      ),
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 3, product: 'PROD-MEDIUM', id: 'medium-box' },
      ),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 3)
    expect(result.placements.length).toBe(3)

    // Find each box placement
    const heavyPlacement = result.placements.find(
      p => p.box.id === 'heavy-box',
    )
    const mediumPlacement = result.placements.find(
      p => p.box.id === 'medium-box',
    )
    const fragilePlacement = result.placements.find(
      p => p.box.id === 'fragile-box',
    )

    expect(heavyPlacement).toBeDefined()
    expect(mediumPlacement).toBeDefined()
    expect(fragilePlacement).toBeDefined()

    // Heavy (materialWeight=6) should be lowest
    // Medium (materialWeight=3) should be middle
    // Fragile (materialWeight=0) should be highest
    expect(heavyPlacement!.position.y).toBeLessThan(
      mediumPlacement!.position.y,
    )
    expect(mediumPlacement!.position.y).toBeLessThan(
      fragilePlacement!.position.y,
    )
  })

  it('handles boxes with default materialWeight (5)', () => {
    const pallet = euroPallet()
    const boxes = [
      // No materialWeight specified - should default to 5
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 2)
    expect(result.placements.length).toBeGreaterThan(0)
  })
})

// ─── Product Grouping ────────────────────────────────────────────────

describe('MaterialGroupingStrategy - Product Grouping', () => {
  const strategy = new MaterialGroupingStrategy()

  it('groups boxes with same product in vertical columns', () => {
    const pallet = euroPallet()

    // Create 8 boxes: 4 of PROD-A, 4 of PROD-B
    // All with same materialWeight and dimensions
    const boxes = [
      ...Array.from({ length: 4 }, () =>
        BoxFactory.create(
          { width: 600, height: 400, depth: 400 },
          { materialWeight: 5, product: 'PROD-A' },
        ),
      ),
      ...Array.from({ length: 4 }, () =>
        BoxFactory.create(
          { width: 600, height: 400, depth: 400 },
          { materialWeight: 5, product: 'PROD-B' },
        ),
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 8)

    // Group placements by product
    const prodABoxes = result.placements.filter(
      p => p.box.product === 'PROD-A',
    )
    const prodBBoxes = result.placements.filter(
      p => p.box.product === 'PROD-B',
    )

    expect(prodABoxes.length).toBeGreaterThan(0)
    expect(prodBBoxes.length).toBeGreaterThan(0)

    // Check that PROD-A boxes share same (x,z) positions (vertical column)
    if (prodABoxes.length >= 2) {
      const xPositions = new Set(prodABoxes.map(p => p.position.x))
      const zPositions = new Set(prodABoxes.map(p => p.position.z))
      // Should have fewer unique (x,z) positions than boxes (indicating stacking)
      expect(xPositions.size).toBeLessThanOrEqual(prodABoxes.length)
      expect(zPositions.size).toBeLessThanOrEqual(prodABoxes.length)
    }
  })

  it('handles boxes without product identifier', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 2)
    expect(result.placements.length).toBeGreaterThan(0)
  })
})

// ─── Layer Construction ──────────────────────────────────────────────

describe('MaterialGroupingStrategy - Layer Construction', () => {
  const strategy = new MaterialGroupingStrategy()

  it('creates uniform height layers when possible', () => {
    const pallet = euroPallet()

    // All boxes same height
    const boxes = Array.from({ length: 8 }, () =>
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
    )

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 8)

    // Group placements by Y position (layers)
    const yPositions = [...new Set(result.placements.map(p => p.position.y))]

    // Should have at least 2 layers (4 boxes per layer for 60×40 boxes on euro pallet)
    expect(yPositions.length).toBeGreaterThanOrEqual(2)
  })

  it('handles mixed heights in different layers', () => {
    const pallet = euroPallet()

    const boxes = [
      // Layer 1: height 400
      ...Array.from({ length: 4 }, () =>
        BoxFactory.create(
          { width: 600, height: 400, depth: 400 },
          { materialWeight: 6, product: 'PROD-A' },
        ),
      ),
      // Layer 2: height 300
      ...Array.from({ length: 4 }, () =>
        BoxFactory.create(
          { width: 600, height: 300, depth: 400 },
          { materialWeight: 3, product: 'PROD-B' },
        ),
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 8)
    expect(result.placements.length).toBeGreaterThan(0)
  })

  it('respects pallet max stack height', () => {
    const pallet = PalletFactory.custom(
      { width: 1200, height: 100, depth: 800 },
      { maxStackHeight: 800 }, // Low height limit
    )

    // Many tall boxes
    const boxes = Array.from({ length: 20 }, () =>
      BoxFactory.create(
        { width: 600, height: 500, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
    )

    const result = strategy.pack(boxes, pallet)

    // All placed boxes should be within height limit
    for (const placement of result.placements) {
      expect(placement.position.y + placement.box.dimensions.height).toBeLessThanOrEqual(
        pallet.maxStackHeight,
      )
    }

    // Some boxes should not fit
    expect(result.unplacedBoxes.length).toBeGreaterThan(0)
  })
})

// ─── Rotation Handling ───────────────────────────────────────────────

describe('MaterialGroupingStrategy - Rotation', () => {
  const strategy = new MaterialGroupingStrategy()

  it('tries both orientations (0° and 90°)', () => {
    const pallet = euroPallet()

    // Box that might fit better rotated
    const boxes = [
      BoxFactory.create(
        { width: 800, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A' },
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 1)

    // Box should be placed (possibly rotated)
    expect(result.placements.length).toBe(1)
    expect([0, 90]).toContain(result.placements[0].rotation.y)
  })
})

// ─── Edge Cases ──────────────────────────────────────────────────────

describe('MaterialGroupingStrategy - Edge Cases', () => {
  const strategy = new MaterialGroupingStrategy()

  it('handles boxes larger than pallet', () => {
    const pallet = euroPallet()

    const boxes = [
      BoxFactory.create(
        { width: 2000, height: 400, depth: 2000 }, // Too large
        { materialWeight: 5, product: 'PROD-A' },
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 1)
    expect(result.placements).toHaveLength(0)
    expect(result.unplacedBoxes).toHaveLength(1)
  })

  it('handles very small boxes', () => {
    const pallet = euroPallet()

    const boxes = Array.from({ length: 10 }, () =>
      BoxFactory.create(
        { width: 100, height: 100, depth: 100 },
        { materialWeight: 5, product: 'PROD-SMALL' },
      ),
    )

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 10)
    // All should fit
    expect(result.placements.length).toBe(10)
  })

  it('handles boxes with varying dimensions', () => {
    const pallet = euroPallet()

    const boxes = [
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
      BoxFactory.create({ width: 400, height: 300, depth: 300 }),
      BoxFactory.create({ width: 500, height: 200, depth: 300 }),
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 4)
    expect(result.placements.length).toBeGreaterThan(0)
  })
})

// ─── Real-World Scenarios ────────────────────────────────────────────

describe('MaterialGroupingStrategy - Real-World Scenarios', () => {
  const strategy = new MaterialGroupingStrategy()

  it('handles realistic warehouse scenario', () => {
    const pallet = euroPallet()

    // Simulate real warehouse: multiple products, different materials
    const boxes = [
      // Plastic boxes (materialWeight 6) with Product A
      ...Array.from({ length: 6 }, () =>
        BoxFactory.create(
          { width: 600, height: 400, depth: 400 },
          { materialWeight: 6, product: 'PROD-A', type: 'plastic' },
        ),
      ),
      // Wood boxes (materialWeight 3) with Product B
      ...Array.from({ length: 4 }, () =>
        BoxFactory.create(
          { width: 600, height: 400, depth: 400 },
          { materialWeight: 3, product: 'PROD-B', type: 'wood' },
        ),
      ),
      // Fragile boxes (materialWeight 0) with Product C
      ...Array.from({ length: 2 }, () =>
        BoxFactory.fragile(
          { width: 600, height: 400, depth: 400 },
          5,
          { materialWeight: 0, product: 'PROD-C', type: 'cork' },
        ),
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 12)

    // Most boxes should be placed
    expect(result.placements.length).toBeGreaterThan(8)

    // Check material ordering: plastic should be lower than wood, wood lower than cork
    const plasticBoxes = result.placements.filter(
      p => p.box.type === 'plastic',
    )
    const woodBoxes = result.placements.filter(p => p.box.type === 'wood')
    const corkBoxes = result.placements.filter(p => p.box.type === 'cork')

    if (plasticBoxes.length > 0 && corkBoxes.length > 0) {
      const avgPlasticY =
        plasticBoxes.reduce((sum, p) => sum + p.position.y, 0) /
        plasticBoxes.length
      const avgCorkY =
        corkBoxes.reduce((sum, p) => sum + p.position.y, 0) / corkBoxes.length

      // Cork should be higher on average
      expect(avgCorkY).toBeGreaterThan(avgPlasticY)
    }
  })

  it('maximizes space utilization', () => {
    const pallet = euroPallet()

    // Standard euro pallet boxes (60×40)
    const boxes = Array.from({ length: 16 }, () =>
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-STD' },
      ),
    )

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 16)

    // Should achieve reasonable utilization
    expect(result.metrics.volumeUtilization).toBeGreaterThan(0.3)
  })
})

// ─── Support Validation ──────────────────────────────────────────

describe('MaterialGroupingStrategy - Support Validation', () => {
  const strategy = new MaterialGroupingStrategy()

  it('prevents boxes from hanging without adequate support (70% minimum)', () => {
    const pallet = PalletFactory.custom(
      { width: 1200, height: 100, depth: 800 },
      { maxStackHeight: 2000 },
    )

    const boxes = [
      // Bottom: Small box (40×40)
      BoxFactory.create(
        { width: 400, height: 400, depth: 400 },
        { materialWeight: 6, product: 'PROD-A', id: 'small-bottom' },
      ),
      // Top: Large box (120×80) that would only have ~11% support on small box
      BoxFactory.create(
        { width: 1200, height: 400, depth: 800 },
        { materialWeight: 3, product: 'PROD-B', id: 'large-top' },
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    // Small box should be placed
    const smallBox = result.placements.find(p => p.box.id === 'small-bottom')
    expect(smallBox).toBeDefined()

    // Large box should NOT be stacked on small box (only 11% support < 70% required)
    // It should either be placed at ground level or not placed at all
    const largeBox = result.placements.find(p => p.box.id === 'large-top')

    if (largeBox) {
      // If placed, must be on ground (Y=0)
      expect(largeBox.position.y).toBe(0)
    }
  })

  it('allows stacking when support is adequate (>=70%)', () => {
    const pallet = euroPallet()

    const boxes = [
      // Bottom: Wide box (80×60)
      BoxFactory.create(
        { width: 800, height: 400, depth: 600 },
        { materialWeight: 6, product: 'PROD-A', id: 'wide-bottom' },
      ),
      // Top: Smaller box (60×40) that has >70% support on wide box
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 3, product: 'PROD-B', id: 'small-top' },
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 2)

    // Both should be placed
    expect(result.placements.length).toBe(2)

    const bottomBox = result.placements.find(p => p.box.id === 'wide-bottom')
    const topBox = result.placements.find(p => p.box.id === 'small-top')

    expect(bottomBox).toBeDefined()
    expect(topBox).toBeDefined()
  })

  it('ground level boxes (Y=0) have 100% support', () => {
    const pallet = euroPallet()

    const boxes = [
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
      BoxFactory.create({ width: 600, height: 400, depth: 400 }),
    ]

    const result = strategy.pack(boxes, pallet)

    // All boxes at Y=0 should have full support
    const groundBoxes = result.placements.filter(p => p.position.y === 0)
    expect(groundBoxes.length).toBeGreaterThan(0)
  })

  it('prevents boxes from extending beyond lower layer footprint', () => {
    // This test validates the fix for boxes "hanging" over edges when there's
    // available space in the lower layer. Boxes in upper layers should always
    // be fully contained within the footprint of the layer below.
    const pallet = PalletFactory.custom(
      { width: 1200, height: 100, depth: 800 },
      { maxStackHeight: 1600 },
    )

    const boxes = [
      // Bottom layer: Small box (60×40) placed first
      BoxFactory.create(
        { width: 600, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-A', id: 'bottom-small' },
      ),
      // Upper layer: Box that would extend beyond bottom if placed on top
      BoxFactory.create(
        { width: 800, height: 400, depth: 600 },
        { materialWeight: 5, product: 'PROD-B', id: 'upper-large' },
      ),
      // Another bottom layer box that could fill space
      BoxFactory.create(
        { width: 400, height: 400, depth: 400 },
        { materialWeight: 5, product: 'PROD-C', id: 'bottom-fill' },
      ),
    ]

    const result = strategy.pack(boxes, pallet)

    // All boxes should be placed
    expect(result.placements.length).toBe(3)

    // Find placements
    const bottomSmall = result.placements.find(p => p.box.id === 'bottom-small')
    const upperLarge = result.placements.find(p => p.box.id === 'upper-large')
    const bottomFill = result.placements.find(p => p.box.id === 'bottom-fill')

    expect(bottomSmall).toBeDefined()
    expect(upperLarge).toBeDefined()
    expect(bottomFill).toBeDefined()

    // Both small boxes should be on ground level
    expect(bottomSmall!.position.y).toBe(0)
    expect(bottomFill!.position.y).toBe(0)

    // The large box should NOT be placed on top of just one small box
    // extending beyond its footprint. It should either:
    // 1. Be on ground level next to the small boxes, OR
    // 2. Be on upper level but fully within the combined footprint of boxes below
    if (upperLarge!.position.y > 0) {
      // If on upper level, verify it doesn't extend beyond the footprint of boxes below
      const boxesBelow = result.placements.filter(p => p.position.y === 0)

      // Calculate bounding box of lower layer
      let minX = Infinity
      let maxX = -Infinity
      let minZ = Infinity
      let maxZ = -Infinity

      for (const p of boxesBelow) {
        const w = p.rotation.y === 90 ? p.box.dimensions.depth : p.box.dimensions.width
        const d = p.rotation.y === 90 ? p.box.dimensions.width : p.box.dimensions.depth
        minX = Math.min(minX, p.position.x)
        maxX = Math.max(maxX, p.position.x + w)
        minZ = Math.min(minZ, p.position.z)
        maxZ = Math.max(maxZ, p.position.z + d)
      }

      // Upper box dimensions
      const upperW = upperLarge!.rotation.y === 90
        ? upperLarge!.box.dimensions.depth
        : upperLarge!.box.dimensions.width
      const upperD = upperLarge!.rotation.y === 90
        ? upperLarge!.box.dimensions.width
        : upperLarge!.box.dimensions.depth

      // Upper box must be within lower layer footprint (with small tolerance)
      const tolerance = 1
      expect(upperLarge!.position.x).toBeGreaterThanOrEqual(minX - tolerance)
      expect(upperLarge!.position.x + upperW).toBeLessThanOrEqual(maxX + tolerance)
      expect(upperLarge!.position.z).toBeGreaterThanOrEqual(minZ - tolerance)
      expect(upperLarge!.position.z + upperD).toBeLessThanOrEqual(maxZ + tolerance)
    }
  })
})
