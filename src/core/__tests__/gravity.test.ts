/**
 * Tests — Gravity validation (BR-004)
 */

import { describe, it, expect } from 'vitest'
import { validateSupport } from '../validation/gravity'
import { makePlacedBox, dims, pos } from './helpers'

describe('BR-004: validateSupport (gravedad)', () => {
  it('acepta caja en el suelo (y=0)', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(0, 0, 0), box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateSupport(boxes)
    expect(result.isValid).toBe(true)
  })

  it('acepta caja soportada por otra caja debajo', () => {
    const boxes = [
      makePlacedBox({ id: 'bottom', position: pos(0, 0, 0), box: { dimensions: dims(400, 300, 400) } }),
      makePlacedBox({ id: 'top', position: pos(0, 300, 0), box: { dimensions: dims(400, 200, 400) } }),
    ]
    // El top está en y=300, el bottom termina en y=300 → soporte total
    const result = validateSupport(boxes)
    expect(result.isValid).toBe(true)
  })

  it('rechaza caja flotando sin soporte', () => {
    const boxes = [
      makePlacedBox({ id: 'floating', position: pos(0, 500, 0), box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateSupport(boxes)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-004')
    expect(result.violations[0].involvedIds).toContain('floating')
  })

  it('rechaza caja con soporte insuficiente (<60%)', () => {
    const boxes = [
      // Caja base pequeña
      makePlacedBox({ id: 'base', position: pos(0, 0, 0), box: { dimensions: dims(100, 300, 100) } }),
      // Caja grande encima con solo 1/16 de soporte
      makePlacedBox({ id: 'big', position: pos(0, 300, 0), box: { dimensions: dims(400, 200, 400) } }),
    ]
    // supportedArea = 100*100 = 10000, boxArea = 400*400 = 160000 → 6.25% < 60%
    const result = validateSupport(boxes)
    expect(result.isValid).toBe(false)
  })

  it('acepta caja con soporte ≥60%', () => {
    const boxes = [
      // Caja base que cubre 70% del área de la de arriba
      makePlacedBox({ id: 'base', position: pos(0, 0, 0), box: { dimensions: dims(400, 300, 400) } }),
      makePlacedBox({ id: 'top', position: pos(50, 300, 50), box: { dimensions: dims(350, 200, 350) } }),
    ]
    // overlap X: min(400, 400) - max(0, 50) = 350
    // overlap Z: min(400, 400) - max(0, 50) = 350
    // supportedArea = 350*350 = 122500
    // boxArea = 350*350 = 122500 → 100% > 60%
    const result = validateSupport(boxes)
    expect(result.isValid).toBe(true)
  })

  it('lista vacía es válida', () => {
    expect(validateSupport([]).isValid).toBe(true)
  })
})
