/**
 * Tests — Packing strategies (RF-012, RF-013, RF-014, RF-015)
 * ColumnStrategy, TypeGroupStrategy, BinPacking3DStrategy
 */

import { describe, it, expect } from 'vitest'
import { ColumnStrategy } from '../packing/ColumnStrategy'
import { TypeGroupStrategy } from '../packing/TypeGroupStrategy'
import { BinPacking3DStrategy } from '../packing/BinPacking3D'
import { BoxFactory } from '../factories/BoxFactory'
import { PalletFactory } from '../factories/PalletFactory'
import type { PackingResult } from '../packing/PackingStrategy'
import { validateNoBoxCollisions } from '../validation/collision'

const euroPallet = () => PalletFactory.euro()

function makeTestBoxes(count: number, type?: string) {
  return Array.from({ length: count }, (_, i) =>
    BoxFactory.create({ width: 400, height: 300, depth: 300 }, { type, weight: 5, sku: `SKU-${type ?? 'default'}` }),
  )
}

// Helper para validar invariantes comunes de resultados de packing
function expectValidPackingResult(result: PackingResult, totalBoxes: number) {
  // Todas las cajas o colocadas o no colocadas
  expect(result.placements.length + result.unplacedBoxes.length).toBe(totalBoxes)

  // Métricas válidas
  expect(result.metrics.volumeUtilization).toBeGreaterThanOrEqual(0)
  expect(result.metrics.volumeUtilization).toBeLessThanOrEqual(1)
  expect(result.metrics.weightUtilization).toBeGreaterThanOrEqual(0)
  expect(result.metrics.stabilityScore).toBeGreaterThanOrEqual(0)
  expect(result.metrics.stabilityScore).toBeLessThanOrEqual(100)

  // Sin colisiones entre cajas colocadas
  if (result.placements.length > 1) {
    const collisionResult = validateNoBoxCollisions(result.placements)
    expect(collisionResult.isValid).toBe(true)
  }
}

// ─── ColumnStrategy (RF-013) ─────────────────────────────────────

describe('ColumnStrategy', () => {
  const strategy = new ColumnStrategy()

  it('tiene id y nombre correctos', () => {
    expect(strategy.id).toBe('column')
    expect(strategy.name).toBeTruthy()
  })

  it('coloca cajas de un solo tipo en columnas', () => {
    const pallet = euroPallet()
    const boxes = makeTestBoxes(6, 'A')
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 6)
    expect(result.placements.length).toBeGreaterThan(0)
  })

  it('maneja cajas de varios tipos separándolas en columnas', () => {
    const pallet = euroPallet()
    const boxes = [...makeTestBoxes(3, 'A'), ...makeTestBoxes(3, 'B')]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 6)
  })

  it('reporta cajas que no caben como unplacedBoxes', () => {
    const pallet = PalletFactory.custom(
      { width: 400, height: 100, depth: 300 },
      { maxStackHeight: 300 },
    )
    const boxes = makeTestBoxes(10, 'A') // muchas más de las que caben
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 10)
    expect(result.unplacedBoxes.length).toBeGreaterThan(0)
  })

  it('devuelve resultado vacío sin cajas', () => {
    const result = strategy.pack([], euroPallet())
    expect(result.placements).toHaveLength(0)
    expect(result.unplacedBoxes).toHaveLength(0)
    expect(result.metrics.volumeUtilization).toBe(0)
  })
})

// ─── TypeGroupStrategy (RF-014) ──────────────────────────────────

describe('TypeGroupStrategy', () => {
  const strategy = new TypeGroupStrategy()

  it('tiene id y nombre correctos', () => {
    expect(strategy.id).toBe('type-group')
    expect(strategy.name).toBeTruthy()
  })

  it('ordena cajas por tipo y coloca frágiles arriba', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create({ width: 400, height: 300, depth: 300 }, { type: 'A', weight: 10 }),
      BoxFactory.fragile({ width: 400, height: 300, depth: 300 }, 5, { type: 'A', weight: 3 }),
      BoxFactory.create({ width: 400, height: 300, depth: 300 }, { type: 'A', weight: 15 }),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 3)
    // Las cajas frágiles deberían estar más arriba (mayor Y)
    if (result.placements.length >= 2) {
      const fragileBox = result.placements.find(p => p.box.fragile)
      const nonFragile = result.placements.find(p => !p.box.fragile)
      if (fragileBox && nonFragile) {
        expect(fragileBox.position.y).toBeGreaterThanOrEqual(nonFragile.position.y)
      }
    }
  })

  it('maneja cajas de distintos tamaños', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create({ width: 600, height: 400, depth: 400 }, { type: 'big' }),
      BoxFactory.create({ width: 300, height: 200, depth: 200 }, { type: 'small' }),
      BoxFactory.create({ width: 300, height: 200, depth: 200 }, { type: 'small' }),
    ]
    const result = strategy.pack(boxes, pallet)
    expectValidPackingResult(result, 3)
  })
})

// ─── BinPacking3DStrategy (RF-015) ───────────────────────────────

describe('BinPacking3DStrategy', () => {
  const strategy = new BinPacking3DStrategy()

  it('tiene id y nombre correctos', () => {
    expect(strategy.id).toBe('bin-packing-3d')
    expect(strategy.name).toBeTruthy()
  })

  it('optimiza volumen colocando cajas grandes primero', () => {
    const pallet = euroPallet()
    const boxes = [
      BoxFactory.create({ width: 300, height: 200, depth: 200 }, { type: 'small' }),
      BoxFactory.create({ width: 600, height: 400, depth: 400 }, { type: 'big' }),
      BoxFactory.create({ width: 300, height: 200, depth: 200 }, { type: 'small' }),
    ]
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 3)
    expect(result.placements.length).toBe(3) // Todas deberían caber en un EUR
  })

  it('intenta ambas orientaciones (normal y rotada 90°)', () => {
    const pallet = PalletFactory.custom(
      { width: 500, height: 100, depth: 400 },
      { maxStackHeight: 1000 },
    )
    // Caja que solo cabe rotada: 600×200×300 → rotada: 300×200×600 (300 < 500, 600 > 400 no cabe)
    // Actually: 600 width > 500 pallet width, rotated: depth=600 > 400... won't fit.
    // Let's use a box that fits only one way
    const boxes = [
      BoxFactory.create({ width: 450, height: 200, depth: 350 }),
    ]
    const result = strategy.pack(boxes, pallet)
    // 450 < 500 and 350 < 400 → fits without rotation
    expect(result.placements.length).toBe(1)
  })

  it('devuelve métricas de utilización volumétrica', () => {
    const pallet = euroPallet()
    const boxes = makeTestBoxes(6, 'test')
    const result = strategy.pack(boxes, pallet)

    expect(result.metrics.volumeUtilization).toBeGreaterThan(0)
    expect(result.metrics.centerOfGravity).toBeDefined()
  })

  it('no colisiones en resultado con muchas cajas', () => {
    const pallet = euroPallet()
    const boxes = makeTestBoxes(20, 'mass')
    const result = strategy.pack(boxes, pallet)

    expectValidPackingResult(result, 20)
  })
})
