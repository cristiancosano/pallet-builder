/**
 * Tests — Polygon validation (BR-401) + point-in-polygon
 */

import { describe, it, expect } from 'vitest'
import { pointInPolygon, validatePalletInRoom } from '../validation/polygon'
import { makePlacedPallet, makeRoom, pos } from './helpers'

// ─── pointInPolygon ──────────────────────────────────────────────

describe('pointInPolygon', () => {
  const rect = [
    { x: 0, z: 0 },
    { x: 1000, z: 0 },
    { x: 1000, z: 1000 },
    { x: 0, z: 1000 },
  ]

  it('detecta punto dentro del rectángulo', () => {
    expect(pointInPolygon({ x: 500, z: 500 }, rect)).toBe(true)
  })

  it('detecta punto fuera del rectángulo', () => {
    expect(pointInPolygon({ x: 1500, z: 500 }, rect)).toBe(false)
  })

  it('detecta punto fuera en negativo', () => {
    expect(pointInPolygon({ x: -100, z: 500 }, rect)).toBe(false)
  })

  it('funciona con forma en L', () => {
    // Forma en L: 
    //   0,0 ──── 600,0
    //   |           |
    //   0,400 ── 600,400
    //   |    300,400
    //   |    300,800
    //   0,800
    const lShape = [
      { x: 0, z: 0 },
      { x: 600, z: 0 },
      { x: 600, z: 400 },
      { x: 300, z: 400 },
      { x: 300, z: 800 },
      { x: 0, z: 800 },
    ]
    expect(pointInPolygon({ x: 100, z: 100 }, lShape)).toBe(true)   // Parte superior
    expect(pointInPolygon({ x: 100, z: 600 }, lShape)).toBe(true)   // Parte inferior izq
    expect(pointInPolygon({ x: 450, z: 600 }, lShape)).toBe(false)  // Fuera del recorte
  })
})

// ─── BR-401: validatePalletInRoom ────────────────────────────────

describe('BR-401: validatePalletInRoom', () => {
  it('acepta palet dentro de la estancia', () => {
    const room = makeRoom()  // 10000×8000, techo 5000
    const pp = makePlacedPallet({ position: pos(100, 0, 100) })
    const result = validatePalletInRoom(pp, room)
    expect(result.isValid).toBe(true)
  })

  it('rechaza palet fuera del polígono', () => {
    const room = makeRoom()
    const pp = makePlacedPallet({ position: pos(9500, 0, 7500) })
    // Palet EUR 1200×800: X max = 9500+1200 = 10700 > 10000
    const result = validatePalletInRoom(pp, room)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.code === 'BR-401')).toBe(true)
  })

  it('rechaza palet que excede la altura del techo (BR-403)', () => {
    const room = makeRoom({ ceilingHeight: 100 })
    const pp = makePlacedPallet({ position: pos(100, 0, 100) })
    // Palet tiene 144mm de alto > 100mm techo
    const result = validatePalletInRoom(pp, room)
    expect(result.isValid).toBe(false)
    expect(result.violations.some(v => v.code === 'BR-403')).toBe(true)
  })
})
