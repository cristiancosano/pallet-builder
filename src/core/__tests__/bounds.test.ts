/**
 * Tests — Bounds validation (BR-001, BR-402, BR-403, BR-404)
 */

import { describe, it, expect } from 'vitest'
import {
  validateBoxInPalletBounds,
  validateAllBoxesInPalletBounds,
  validatePalletInTruck,
  validatePalletHeight,
} from '../validation/bounds'
import { makePlacedBox, makePallet, makePlacedPallet, makeTruck, dims, pos } from './helpers'

// ─── BR-001: Caja dentro de palet ────────────────────────────────

describe('BR-001: validateBoxInPalletBounds', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800), maxStackHeight: 2200 })

  it('acepta caja dentro de los límites', () => {
    const box = makePlacedBox({
      position: pos(0, 0, 0),
      box: { dimensions: dims(400, 300, 300) },
    })
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(true)
  })

  it('acepta caja en el borde exacto del palet', () => {
    const box = makePlacedBox({
      position: pos(800, 0, 500),
      box: { dimensions: dims(400, 300, 300) },
    })
    // 800 + 400 = 1200 (= pallet.width) → exacto → ok
    // 500 + 300 = 800 (= pallet.depth) → exacto → ok
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(true)
  })

  it('rechaza caja que sobresale por eje X', () => {
    const box = makePlacedBox({
      position: pos(1000, 0, 0),
      box: { dimensions: dims(400, 300, 300) },
    })
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-001')
  })

  it('rechaza caja que sobresale por eje Z', () => {
    const box = makePlacedBox({
      position: pos(0, 0, 600),
      box: { dimensions: dims(400, 300, 300) },
    })
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.code === 'BR-001')).toBe(true)
  })

  it('rechaza caja que excede la altura máxima de apilamiento', () => {
    const box = makePlacedBox({
      position: pos(0, 2000, 0),
      box: { dimensions: dims(400, 300, 300) },
    })
    // 2000 + 300 = 2300 > 2200
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(false)
  })

  it('rechaza caja con posición negativa en X', () => {
    const box = makePlacedBox({
      position: pos(-10, 0, 0),
      box: { dimensions: dims(400, 300, 300) },
    })
    const result = validateBoxInPalletBounds(box, pallet)
    expect(result.isValid).toBe(false)
  })
})

describe('validateAllBoxesInPalletBounds', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800), maxStackHeight: 2200 })

  it('acepta todas las cajas válidas', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(0, 0, 0), box: { dimensions: dims(400, 300, 300) } }),
      makePlacedBox({ id: 'b', position: pos(400, 0, 0), box: { dimensions: dims(400, 300, 300) } }),
    ]
    expect(validateAllBoxesInPalletBounds(boxes, pallet).isValid).toBe(true)
  })

  it('reporta múltiples violaciones', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(1100, 0, 0), box: { dimensions: dims(400, 300, 300) } }),
      makePlacedBox({ id: 'b', position: pos(0, 0, 700), box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateAllBoxesInPalletBounds(boxes, pallet)
    expect(result.isValid).toBe(false)
    expect(result.violations.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── BR-402: Palet dentro de camión ──────────────────────────────

describe('BR-402: validatePalletInTruck', () => {
  const truck = makeTruck({ dimensions: dims(2480, 2700, 13600) })

  it('acepta palet dentro del camión', () => {
    const pp = makePlacedPallet({ position: pos(0, 0, 0) })
    const result = validatePalletInTruck(pp, truck)
    expect(result.isValid).toBe(true)
  })

  it('rechaza palet que sobresale por ancho del camión', () => {
    const pp = makePlacedPallet({ position: pos(2000, 0, 0) })
    // Palet 1200mm ancho + 2000 pos = 3200 > 2480
    const result = validatePalletInTruck(pp, truck)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.code === 'BR-402')).toBe(true)
  })

  it('rechaza palet que sobresale por profundidad del camión', () => {
    const pp = makePlacedPallet({ position: pos(0, 0, 13000) })
    const result = validatePalletInTruck(pp, truck)
    expect(result.isValid).toBe(false)
  })
})

// ─── BR-403/404: Altura contenedor ──────────────────────────────

describe('BR-403: validatePalletHeight', () => {
  it('acepta palet por debajo del techo', () => {
    const pp = makePlacedPallet({ position: pos(0, 0, 0) })
    const result = validatePalletHeight(pp, 5000)
    expect(result.isValid).toBe(true)
  })

  it('rechaza palet que excede el techo de la estancia', () => {
    const pp = makePlacedPallet({ position: pos(0, 0, 0) })
    // Palet con 144mm height → totalHeight = 144 → techo 100 → viola
    const result = validatePalletHeight(pp, 100)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-403')
  })
})
