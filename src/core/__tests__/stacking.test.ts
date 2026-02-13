/**
 * Tests — Stacking validation
 * BR-201: Caja apilable
 * BR-203: Pirámide invertida
 * BR-301: Dimensiones de planta en stack
 * BR-302: Separador obligatorio
 * BR-303: Altura del stack
 * BR-304: Peso del stack
 */

import { describe, it, expect } from 'vitest'
import {
  validateBoxStackability,
  validateInvertedPyramid,
  validateStackDimensions,
  validateSeparators,
  validateStackHeight,
  validateStackWeight,
} from '../validation/stacking'
import { makePlacedBox, makeFloor, makePallet, makeSeparator, makeStackedPallet, dims, pos } from './helpers'

// ─── BR-201: Caja apilable ──────────────────────────────────────

describe('BR-201: validateBoxStackability', () => {
  it('acepta apilamiento sobre cajas apilables', () => {
    const boxes = [
      makePlacedBox({ id: 'base', position: pos(0, 0, 0), box: { stackable: true, dimensions: dims(400, 300, 400) } }),
      makePlacedBox({ id: 'top', position: pos(0, 300, 0), box: { dimensions: dims(400, 200, 400) } }),
    ]
    const result = validateBoxStackability(boxes)
    expect(result.isValid).toBe(true)
  })

  it('rechaza caja sobre caja no apilable', () => {
    const boxes = [
      makePlacedBox({ id: 'nostack', position: pos(0, 0, 0), box: { stackable: false, dimensions: dims(400, 300, 400) } }),
      makePlacedBox({ id: 'top', position: pos(0, 300, 0), box: { dimensions: dims(400, 200, 400) } }),
    ]
    const result = validateBoxStackability(boxes)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-201')
    expect(result.violations[0].involvedIds).toContain('nostack')
  })

  it('acepta caja no apilable sin nada encima', () => {
    const boxes = [
      makePlacedBox({ id: 'nostack', position: pos(0, 0, 0), box: { stackable: false, dimensions: dims(400, 300, 400) } }),
    ]
    const result = validateBoxStackability(boxes)
    expect(result.isValid).toBe(true)
  })
})

// ─── BR-203: Pirámide invertida ──────────────────────────────────

describe('BR-203: validateInvertedPyramid', () => {
  it('genera warning por pirámide invertida', () => {
    const boxes = [
      makePlacedBox({ id: 'small', position: pos(0, 0, 0), box: { weight: 5, dimensions: dims(200, 300, 200) } }),
      makePlacedBox({ id: 'big', position: pos(0, 300, 0), box: { weight: 50, dimensions: dims(400, 200, 400) } }),
    ]
    // big.weight (50) > small.weight (5) × 1.5 = 7.5 ✓
    // big.area (160000) > small.area (40000) × 1.2 = 48000 ✓
    const result = validateInvertedPyramid(boxes)
    expect(result.isValid).toBe(true) // warnings don't break validity
    expect(result.violations.some(v => v.code === 'BR-203')).toBe(true)
    expect(result.violations[0].severity).toBe('warning')
  })

  it('no genera warning si los pesos son similares', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(0, 0, 0), box: { weight: 10, dimensions: dims(400, 300, 400) } }),
      makePlacedBox({ id: 'b', position: pos(0, 300, 0), box: { weight: 10, dimensions: dims(400, 200, 400) } }),
    ]
    const result = validateInvertedPyramid(boxes)
    expect(result.violations).toHaveLength(0)
  })
})

// ─── BR-301: Dimensiones de planta del stack ─────────────────────

describe('BR-301: validateStackDimensions', () => {
  it('acepta stack con palets del mismo formato', () => {
    const pallet = makePallet({ dimensions: dims(1200, 144, 800) })
    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0, pallet, separatorAbove: makeSeparator() }),
        makeFloor({ level: 1, pallet }),
      ],
    })
    expect(validateStackDimensions(stack).isValid).toBe(true)
  })

  it('rechaza stack con palets de distinto formato', () => {
    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0, pallet: makePallet({ dimensions: dims(1200, 144, 800) }), separatorAbove: makeSeparator() }),
        makeFloor({ level: 1, pallet: makePallet({ id: 'p2', dimensions: dims(1100, 144, 900) }) }),
      ],
    })
    const result = validateStackDimensions(stack)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-301')
  })

  it('un solo piso siempre es válido', () => {
    const stack = makeStackedPallet({ floors: [makeFloor()] })
    expect(validateStackDimensions(stack).isValid).toBe(true)
  })
})

// ─── BR-302: Separador obligatorio ──────────────────────────────

describe('BR-302: validateSeparators', () => {
  it('acepta stack con separadores entre pisos', () => {
    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0, separatorAbove: makeSeparator() }),
        makeFloor({ level: 1 }),
      ],
    })
    expect(validateSeparators(stack).isValid).toBe(true)
  })

  it('rechaza stack sin separador entre pisos', () => {
    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0 }), // sin separatorAbove
        makeFloor({ level: 1 }),
      ],
    })
    const result = validateSeparators(stack)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-302')
  })

  it('un solo piso no requiere separador', () => {
    const stack = makeStackedPallet({ floors: [makeFloor()] })
    expect(validateSeparators(stack).isValid).toBe(true)
  })
})

// ─── BR-303: Altura total del stack ──────────────────────────────

describe('BR-303: validateStackHeight', () => {
  it('acepta stack bajo el límite del contenedor', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({ pallet: makePallet({ dimensions: dims(1200, 144, 800) }) })],
    })
    // Total height = 144
    const result = validateStackHeight(stack, 5000)
    expect(result.isValid).toBe(true)
  })

  it('rechaza stack que excede la altura del contenedor', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({
        pallet: makePallet({ dimensions: dims(1200, 144, 800) }),
        boxes: [makePlacedBox({ position: pos(0, 0, 0), box: { dimensions: dims(400, 2800, 300) } })],
      })],
    })
    // 144 + 2800 = 2944 > 2700
    const result = validateStackHeight(stack, 2700)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-303')
  })
})

// ─── BR-304: Peso acumulado del stack ────────────────────────────

describe('BR-304: validateStackWeight', () => {
  it('acepta stack dentro del límite de peso', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({
        pallet: makePallet({ weight: 25, maxWeight: 1000 }),
        boxes: [makePlacedBox({ box: { weight: 100 } })],
      })],
    })
    // loadWeight = (25 + 100) - 25 = 100 ≤ 1000
    expect(validateStackWeight(stack).isValid).toBe(true)
  })

  it('rechaza stack que excede peso del palet base', () => {
    const stack = makeStackedPallet({
      floors: [
        makeFloor({
          level: 0,
          pallet: makePallet({ weight: 25, maxWeight: 100 }),
          boxes: [makePlacedBox({ box: { weight: 80 } })],
          separatorAbove: makeSeparator({ weight: 2 }),
        }),
        makeFloor({
          level: 1,
          pallet: makePallet({ weight: 25 }),
          boxes: [makePlacedBox({ id: 'pb-2', box: { weight: 50 } })],
        }),
      ],
    })
    // totalWeight = 25 + 80 + 2 + 25 + 50 = 182
    // loadWeight = 182 - 25 = 157 > 100
    const result = validateStackWeight(stack)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-304')
  })
})
