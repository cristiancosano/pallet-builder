/**
 * Tests — Weight validation (BR-101, BR-102, BR-103, BR-104)
 */

import { describe, it, expect } from 'vitest'
import {
  validatePalletWeight,
  validateTruckWeight,
  validateFragileLoad,
  validateWeightDistribution,
} from '../validation/weight'
import { makeFloor, makePallet, makePlacedBox, makeTruck, makePlacedPallet, makeStackedPallet, dims, pos } from './helpers'

// ─── BR-101: Peso máximo de palet ────────────────────────────────

describe('BR-101: validatePalletWeight', () => {
  it('acepta carga dentro del límite', () => {
    const floor = makeFloor({
      pallet: makePallet({ maxWeight: 1000 }),
      boxes: [
        makePlacedBox({ id: 'a', box: { weight: 200 } }),
        makePlacedBox({ id: 'b', box: { weight: 300 } }),
      ],
    })
    const result = validatePalletWeight(floor)
    expect(result.isValid).toBe(true)
    expect(result.violations.filter(v => v.severity === 'error')).toHaveLength(0)
  })

  it('genera warning al superar 90% del peso máximo', () => {
    const floor = makeFloor({
      pallet: makePallet({ maxWeight: 1000 }),
      boxes: [
        makePlacedBox({ id: 'a', box: { weight: 920 } }),
      ],
    })
    const result = validatePalletWeight(floor)
    expect(result.isValid).toBe(true) // Warning, no error
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].severity).toBe('warning')
    expect(result.violations[0].code).toBe('BR-101')
  })

  it('genera error al exceder peso máximo', () => {
    const floor = makeFloor({
      pallet: makePallet({ maxWeight: 1000 }),
      boxes: [
        makePlacedBox({ id: 'a', box: { weight: 600 } }),
        makePlacedBox({ id: 'b', box: { weight: 500 } }),
      ],
    })
    const result = validatePalletWeight(floor)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].severity).toBe('error')
  })

  it('acepta peso exacto al límite', () => {
    const floor = makeFloor({
      pallet: makePallet({ maxWeight: 1000 }),
      boxes: [makePlacedBox({ box: { weight: 1000 } })],
    })
    // 1000 = 1000 → no excede pero está > 90% → warning
    const result = validatePalletWeight(floor)
    expect(result.isValid).toBe(true) // no es error
  })
})

// ─── BR-102: Peso máximo de camión ───────────────────────────────

describe('BR-102: validateTruckWeight', () => {
  it('acepta carga dentro del límite del camión', () => {
    const truck = makeTruck({
      maxWeight: 24000,
      pallets: [
        makePlacedPallet({
          stackedPallet: makeStackedPallet({
            floors: [makeFloor({
              pallet: makePallet({ weight: 25 }),
              boxes: [makePlacedBox({ box: { weight: 500 } })],
            })],
          }),
        }),
      ],
    })
    const result = validateTruckWeight(truck)
    expect(result.isValid).toBe(true)
  })

  it('genera error al exceder peso del camión', () => {
    const truck = makeTruck({
      maxWeight: 100,
      pallets: [
        makePlacedPallet({
          stackedPallet: makeStackedPallet({
            floors: [makeFloor({
              pallet: makePallet({ weight: 25 }),
              boxes: [makePlacedBox({ box: { weight: 200 } })],
            })],
          }),
        }),
      ],
    })
    const result = validateTruckWeight(truck)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-102')
  })
})

// ─── BR-103: Peso sobre caja frágil ─────────────────────────────

describe('BR-103: validateFragileLoad', () => {
  it('acepta caja frágil sin nada encima', () => {
    const boxes = [
      makePlacedBox({
        id: 'fragile',
        position: pos(0, 0, 0),
        box: { fragile: true, fragilityMaxWeight: 10, dimensions: dims(400, 300, 300) },
      }),
    ]
    const result = validateFragileLoad(boxes)
    expect(result.isValid).toBe(true)
  })

  it('rechaza peso excesivo sobre caja frágil', () => {
    const boxes = [
      makePlacedBox({
        id: 'fragile',
        position: pos(0, 0, 0),
        box: { fragile: true, fragilityMaxWeight: 5, dimensions: dims(400, 300, 400), weight: 2 },
      }),
      makePlacedBox({
        id: 'heavy',
        position: pos(0, 300, 0),
        box: { fragile: false, dimensions: dims(400, 300, 400), weight: 20 },
      }),
    ]
    const result = validateFragileLoad(boxes)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-103')
    expect(result.violations[0].involvedIds).toContain('fragile')
  })

  it('acepta peso dentro del límite de fragilidad', () => {
    const boxes = [
      makePlacedBox({
        id: 'fragile',
        position: pos(0, 0, 0),
        box: { fragile: true, fragilityMaxWeight: 50, dimensions: dims(400, 300, 400) },
      }),
      makePlacedBox({
        id: 'light',
        position: pos(0, 300, 0),
        box: { fragile: false, dimensions: dims(400, 200, 400), weight: 5 },
      }),
    ]
    const result = validateFragileLoad(boxes)
    expect(result.isValid).toBe(true)
  })

  it('caja frágil sin fragilityMaxWeight rechaza cualquier peso encima', () => {
    const boxes = [
      makePlacedBox({
        id: 'fragile',
        position: pos(0, 0, 0),
        box: { fragile: true, dimensions: dims(400, 300, 400) },
      }),
      makePlacedBox({
        id: 'on-top',
        position: pos(0, 300, 0),
        box: { fragile: false, dimensions: dims(400, 200, 400), weight: 1 },
      }),
    ]
    const result = validateFragileLoad(boxes)
    expect(result.isValid).toBe(false)
  })
})

// ─── BR-104: Distribución de peso ────────────────────────────────

describe('BR-104: validateWeightDistribution', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800) })

  it('acepta distribución centrada', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(400, 0, 200), box: { dimensions: dims(400, 300, 400), weight: 10 } }),
    ]
    const result = validateWeightDistribution(pallet, boxes)
    expect(result.violations.filter(v => v.code === 'BR-104')).toHaveLength(0)
  })

  it('genera warning con todo el peso en un extremo', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(0, 0, 0), box: { dimensions: dims(100, 300, 100), weight: 100 } }),
    ]
    // Centro de la caja: (50, _, 50), centro del palet: (600, _, 400)
    // |50 - 600| = 550 > 1200/6 = 200 → warning
    const result = validateWeightDistribution(pallet, boxes)
    expect(result.violations.some(v => v.code === 'BR-104')).toBe(true)
    expect(result.violations[0].severity).toBe('warning')
  })

  it('lista vacía es válida', () => {
    const result = validateWeightDistribution(pallet, [])
    expect(result.isValid).toBe(true)
  })
})
