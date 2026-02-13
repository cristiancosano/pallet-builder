/**
 * Tests — Factories: PalletFactory, BoxFactory, TruckFactory
 * RF-007, RF-010, RF-002 (presets de camión)
 */

import { describe, it, expect } from 'vitest'
import { PalletFactory } from '../factories/PalletFactory'
import { BoxFactory } from '../factories/BoxFactory'
import { TruckFactory } from '../factories/TruckFactory'
import { PalletMaterial, TruckType } from '../types'

// ─── PalletFactory ───────────────────────────────────────────────

describe('PalletFactory', () => {
  it('crea palet EUR con dimensiones estándar', () => {
    const p = PalletFactory.euro()
    expect(p.dimensions).toEqual({ width: 1200, height: 144, depth: 800 })
    expect(p.material).toBe(PalletMaterial.WOOD)
    expect(p.maxWeight).toBe(1000)
    expect(p.weight).toBe(25)
    expect(p.id).toBeTruthy()
  })

  it('crea palet GMA con dimensiones estándar', () => {
    const p = PalletFactory.gma()
    expect(p.dimensions).toEqual({ width: 1219, height: 145, depth: 1016 })
    expect(p.maxWeight).toBe(1200)
  })

  it('crea palet Asia con dimensiones estándar', () => {
    const p = PalletFactory.asia()
    expect(p.dimensions).toEqual({ width: 1100, height: 150, depth: 1100 })
  })

  it('permite sobrescribir propiedades con overrides', () => {
    const p = PalletFactory.euro({ maxWeight: 2000, material: PalletMaterial.PLASTIC })
    expect(p.maxWeight).toBe(2000)
    expect(p.material).toBe(PalletMaterial.PLASTIC)
    // Mantiene los campos base
    expect(p.dimensions.width).toBe(1200)
  })

  it('crea palet custom con dimensiones arbitrarias', () => {
    const p = PalletFactory.custom(
      { width: 500, height: 100, depth: 500 },
      { maxWeight: 300 },
    )
    expect(p.dimensions).toEqual({ width: 500, height: 100, depth: 500 })
    expect(p.maxWeight).toBe(300)
  })

  it('genera IDs únicos para cada palet', () => {
    const p1 = PalletFactory.euro()
    const p2 = PalletFactory.euro()
    expect(p1.id).not.toBe(p2.id)
  })

  it('lanza error para presets inexistentes', () => {
    // @ts-expect-error — test runtime error
    expect(() => PalletFactory.fromPreset('INVALID')).toThrow('Unknown pallet preset')
  })

  it('listPresets devuelve todos los presets disponibles', () => {
    const presets = PalletFactory.listPresets()
    expect(presets.length).toBeGreaterThanOrEqual(9) // EUR, GMA, UK, ASIA, AUSTRALIAN, HALF_EUR, QUARTER_EUR, ISO_1, ISO_2
    const keys = presets.map(p => p.key)
    expect(keys).toContain('EUR')
    expect(keys).toContain('GMA')
    expect(keys).toContain('ASIA')
  })

  it('halfEuro tiene la mitad de dimensiones del EUR', () => {
    const half = PalletFactory.halfEuro()
    expect(half.dimensions.width).toBe(800)
    expect(half.dimensions.depth).toBe(600)
    expect(half.maxWeight).toBe(500)
  })
})

// ─── BoxFactory ──────────────────────────────────────────────────

describe('BoxFactory', () => {
  it('crea caja con defaults razonables', () => {
    const b = BoxFactory.create({ width: 400, height: 300, depth: 300 })
    expect(b.dimensions).toEqual({ width: 400, height: 300, depth: 300 })
    expect(b.weight).toBe(5)
    expect(b.fragile).toBe(false)
    expect(b.stackable).toBe(true)
    expect(b.id).toBeTruthy()
  })

  it('crea caja frágil con peso máximo de soporte', () => {
    const b = BoxFactory.fragile({ width: 300, height: 200, depth: 300 }, 20)
    expect(b.fragile).toBe(true)
    expect(b.fragilityMaxWeight).toBe(20)
  })

  it('crea caja pesada no apilable', () => {
    const b = BoxFactory.heavy({ width: 500, height: 500, depth: 500 }, 80)
    expect(b.weight).toBe(80)
    expect(b.stackable).toBe(false)
  })

  it('permite metadatos extensibles', () => {
    const b = BoxFactory.create(
      { width: 400, height: 300, depth: 300 },
      { metadata: { producto: 'Laptop', lote: 'L-2025-01' } },
    )
    expect(b.metadata).toEqual({ producto: 'Laptop', lote: 'L-2025-01' })
  })

  it('genera IDs únicos', () => {
    const b1 = BoxFactory.create({ width: 100, height: 100, depth: 100 })
    const b2 = BoxFactory.create({ width: 100, height: 100, depth: 100 })
    expect(b1.id).not.toBe(b2.id)
  })
})

// ─── TruckFactory ────────────────────────────────────────────────

describe('TruckFactory', () => {
  it('crea camión BOX con preset estándar', () => {
    const t = TruckFactory.fromPreset(TruckType.BOX)
    expect(t.dimensions).toEqual({ width: 2480, height: 2700, depth: 13600 })
    expect(t.maxWeight).toBe(24000)
    expect(t.truckType).toBe(TruckType.BOX)
    expect(t.pallets).toEqual([])
  })

  it('crea camión REFRIGERATED con peso reducido', () => {
    const t = TruckFactory.fromPreset(TruckType.REFRIGERATED)
    expect(t.maxWeight).toBe(22000)
    expect(t.dimensions.depth).toBe(13100) // más corto
  })

  it('crea camión custom con dimensiones arbitrarias', () => {
    const t = TruckFactory.custom(
      { width: 2000, height: 2000, depth: 10000 },
      15000,
    )
    expect(t.truckType).toBe(TruckType.CUSTOM)
    expect(t.dimensions).toEqual({ width: 2000, height: 2000, depth: 10000 })
    expect(t.maxWeight).toBe(15000)
  })

  it('presets FLATBED y TAUTLINER tienen dimensiones correctas', () => {
    const fb = TruckFactory.fromPreset(TruckType.FLATBED)
    const tl = TruckFactory.fromPreset(TruckType.TAUTLINER)
    expect(fb.maxWeight).toBe(25000)
    expect(tl.maxWeight).toBe(24000)
  })

  it('genera IDs únicos', () => {
    const t1 = TruckFactory.fromPreset(TruckType.BOX)
    const t2 = TruckFactory.fromPreset(TruckType.BOX)
    expect(t1.id).not.toBe(t2.id)
  })
})
