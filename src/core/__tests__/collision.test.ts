/**
 * Tests — Collision detection (BR-002, BR-003) + AABB helpers
 */

import { describe, it, expect } from 'vitest'
import {
  getBoxBoundingBox,
  getPalletBoundingBox,
  aabbIntersects,
  validateNoBoxCollisions,
  validateNoPalletCollisions,
} from '../validation/collision'
import { makePlacedBox, makePlacedPallet, makeStackedPallet, makeFloor, makePallet, pos, rot, dims } from './helpers'

// ─── getBoxBoundingBox ───────────────────────────────────────────

describe('getBoxBoundingBox', () => {
  it('calcula BB sin rotación', () => {
    const pb = makePlacedBox({
      position: { x: 100, y: 50, z: 200 },
      box: { dimensions: { width: 400, height: 300, depth: 200 } },
    })
    const bb = getBoxBoundingBox(pb)
    expect(bb).toEqual({
      minX: 100, maxX: 500,
      minY: 50,  maxY: 350,
      minZ: 200, maxZ: 400,
    })
  })

  it('intercambia width/depth al rotar 90° en Y', () => {
    const pb = makePlacedBox({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 90, z: 0 },
      box: { dimensions: { width: 400, height: 300, depth: 200 } },
    })
    const bb = getBoxBoundingBox(pb)
    // width=400, depth=200 → rotado: w=200, d=400
    expect(bb.maxX).toBe(200)
    expect(bb.maxZ).toBe(400)
  })

  it('intercambia width/depth al rotar 270° en Y', () => {
    const pb = makePlacedBox({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 270, z: 0 },
      box: { dimensions: { width: 400, height: 300, depth: 200 } },
    })
    const bb = getBoxBoundingBox(pb)
    expect(bb.maxX).toBe(200)
    expect(bb.maxZ).toBe(400)
  })
})

// ─── aabbIntersects ──────────────────────────────────────────────

describe('aabbIntersects', () => {
  it('detecta colisión entre dos AABBs solapados', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 50, maxX: 150, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(aabbIntersects(a, b)).toBe(true)
  })

  it('no detecta colisión entre AABBs separados', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 200, maxX: 300, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(aabbIntersects(a, b)).toBe(false)
  })

  it('no colisiona en el borde exacto (tolerancia 1mm)', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 100, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    // Exactamente tocándose → no colisiona por tolerancia
    expect(aabbIntersects(a, b, 1)).toBe(false)
  })

  it('detecta colisión con tolerancia custom menor', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 99.5, maxX: 200, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    expect(aabbIntersects(a, b, 0)).toBe(true)
  })

  it('no colisiona si solo se solapan en 2 ejes pero no en el tercero', () => {
    const a = { minX: 0, maxX: 100, minY: 0, maxY: 100, minZ: 0, maxZ: 100 }
    const b = { minX: 50, maxX: 150, minY: 0, maxY: 100, minZ: 200, maxZ: 300 }
    expect(aabbIntersects(a, b)).toBe(false)
  })
})

// ─── BR-002: validateNoBoxCollisions ─────────────────────────────

describe('BR-002: validateNoBoxCollisions', () => {
  it('acepta cajas sin colisión', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: { x: 0, y: 0, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
      makePlacedBox({ id: 'b', position: { x: 400, y: 0, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateNoBoxCollisions(boxes)
    expect(result.isValid).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('detecta colisión entre cajas solapadas', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: { x: 0, y: 0, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
      makePlacedBox({ id: 'b', position: { x: 200, y: 0, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateNoBoxCollisions(boxes)
    expect(result.isValid).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].code).toBe('BR-002')
    expect(result.violations[0].severity).toBe('error')
    expect(result.violations[0].involvedIds).toContain('a')
    expect(result.violations[0].involvedIds).toContain('b')
  })

  it('acepta cajas apiladas verticalmente sin solape horizontal', () => {
    const boxes = [
      makePlacedBox({ id: 'a', position: { x: 0, y: 0, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
      makePlacedBox({ id: 'b', position: { x: 0, y: 300, z: 0 }, box: { dimensions: dims(400, 300, 300) } }),
    ]
    const result = validateNoBoxCollisions(boxes)
    expect(result.isValid).toBe(true)
  })

  it('lista vacía es válida', () => {
    expect(validateNoBoxCollisions([]).isValid).toBe(true)
  })
})

// ─── BR-003: validateNoPalletCollisions ──────────────────────────

describe('BR-003: validateNoPalletCollisions', () => {
  it('acepta palets bien separados', () => {
    const pallets = [
      makePlacedPallet({ id: 'pp-1', position: pos(0, 0, 0) }),
      makePlacedPallet({ id: 'pp-2', position: pos(1500, 0, 0) }),
    ]
    const result = validateNoPalletCollisions(pallets)
    expect(result.isValid).toBe(true)
  })

  it('detecta colisión entre palets solapados', () => {
    const pallets = [
      makePlacedPallet({ id: 'pp-1', position: pos(0, 0, 0) }),
      makePlacedPallet({ id: 'pp-2', position: pos(500, 0, 0) }),
    ]
    const result = validateNoPalletCollisions(pallets)
    expect(result.isValid).toBe(false)
    expect(result.violations[0].code).toBe('BR-003')
  })
})
