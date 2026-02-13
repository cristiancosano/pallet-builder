/**
 * Tests — Stability validation (BR-501, BR-502, BR-503) + CoG calculation
 */

import { describe, it, expect } from 'vitest'
import {
  calculateCenterOfGravity,
  calculateStabilityScore,
  validateCogInsideSupport,
  validateStability,
} from '../validation/stability'
import { makePlacedBox, makePallet, dims, pos } from './helpers'

// ─── calculateCenterOfGravity ────────────────────────────────────

describe('calculateCenterOfGravity', () => {
  it('devuelve (0,0,0) para lista vacía', () => {
    const cog = calculateCenterOfGravity([])
    expect(cog).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('calcula CoG correcto para una sola caja', () => {
    const boxes = [makePlacedBox({
      position: pos(0, 0, 0),
      box: { dimensions: dims(400, 300, 200), weight: 10 },
    })]
    const cog = calculateCenterOfGravity(boxes)
    // Centro de la caja: (200, 150, 100)
    expect(cog.x).toBeCloseTo(200)
    expect(cog.y).toBeCloseTo(150)
    expect(cog.z).toBeCloseTo(100)
  })

  it('pondera por peso correctamente', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: pos(0, 0, 0), box: { dimensions: dims(200, 200, 200), weight: 10 } }),
      makePlacedBox({ id: 'b', position: pos(800, 0, 0), box: { dimensions: dims(200, 200, 200), weight: 30 } }),
    ]
    const cog = calculateCenterOfGravity(boxes)
    // centroA = 100, centroB = 900
    // cogX = (100*10 + 900*30) / 40 = (1000 + 27000) / 40 = 700
    expect(cog.x).toBeCloseTo(700)
  })
})

// ─── calculateStabilityScore ─────────────────────────────────────

describe('calculateStabilityScore', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800) })

  it('devuelve 100 para palet sin cajas', () => {
    expect(calculateStabilityScore(pallet, [])).toBe(100)
  })

  it('devuelve score alto para carga centrada', () => {
    const boxes = [makePlacedBox({
      position: pos(400, 0, 200),
      box: { dimensions: dims(400, 300, 400), weight: 10 },
    })]
    const score = calculateStabilityScore(pallet, boxes)
    expect(score).toBeGreaterThan(70)
  })

  it('devuelve score bajo para carga en un extremo', () => {
    const boxes = [makePlacedBox({
      position: pos(0, 0, 0),
      box: { dimensions: dims(100, 300, 100), weight: 100 },
    })]
    const score = calculateStabilityScore(pallet, boxes)
    expect(score).toBeLessThan(70)
  })
})

// ─── BR-502: CoG dentro del polígono de soporte ──────────────────

describe('BR-502: validateCogInsideSupport', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800) })

  it('acepta CoG dentro del palet', () => {
    const boxes = [makePlacedBox({
      position: pos(400, 0, 200),
      box: { dimensions: dims(400, 300, 400), weight: 10 },
    })]
    const result = validateCogInsideSupport(pallet, boxes)
    expect(result.isValid).toBe(true)
  })

  it('lista vacía es válida', () => {
    expect(validateCogInsideSupport(pallet, []).isValid).toBe(true)
  })
})

// ─── BR-501 + BR-503: validateStability ──────────────────────────

describe('BR-501/BR-503: validateStability', () => {
  const pallet = makePallet({ dimensions: dims(1200, 144, 800) })

  it('no genera violaciones para carga centrada estable', () => {
    const boxes = [makePlacedBox({
      position: pos(400, 0, 200),
      box: { dimensions: dims(400, 300, 400), weight: 10 },
    })]
    const result = validateStability(pallet, boxes)
    expect(result.isValid).toBe(true)
  })

  it('genera warning de CoG alto cuando la carga está muy elevada', () => {
    const boxes = [makePlacedBox({
      position: pos(400, 1500, 200),
      box: { dimensions: dims(400, 300, 400), weight: 10 },
    })]
    const result = validateStability(pallet, boxes)
    // CoG.y = 1650, maxY = 1800 → 1650/1800 = 91.6% > 60% → BR-503 warning
    expect(result.violations.some(v => v.code === 'BR-503')).toBe(true)
  })

  it('lista vacía es válida', () => {
    expect(validateStability(pallet, []).isValid).toBe(true)
  })
})
