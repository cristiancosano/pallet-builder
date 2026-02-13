/**
 * Tests — PackingRegistry (RF-016: Registro de estrategias custom)
 */

import { describe, it, expect } from 'vitest'
import { PackingRegistry, defaultRegistry } from '../packing/registry'
import type { PackingStrategy, PackingResult } from '../packing/PackingStrategy'
import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'

// Estrategia custom de prueba
class DummyStrategy implements PackingStrategy {
  readonly id = 'dummy'
  readonly name = 'Dummy Strategy'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    return {
      placements: [],
      metrics: {
        volumeUtilization: 0,
        weightUtilization: 0,
        centerOfGravity: { x: 0, y: 0, z: 0 },
        stabilityScore: 100,
      },
      unplacedBoxes: [...boxes],
    }
  }
}

describe('PackingRegistry', () => {
  it('registra las 3 estrategias built-in por defecto', () => {
    const registry = new PackingRegistry()
    const ids = registry.listIds()
    expect(ids).toContain('column')
    expect(ids).toContain('bin-packing-3d')
    expect(ids).toContain('type-group')
    expect(ids).toHaveLength(3)
  })

  it('permite registrar una estrategia custom', () => {
    const registry = new PackingRegistry()
    registry.register(new DummyStrategy())
    expect(registry.has('dummy')).toBe(true)
    expect(registry.get('dummy').name).toBe('Dummy Strategy')
  })

  it('get() devuelve la estrategia correcta', () => {
    const registry = new PackingRegistry()
    const column = registry.get('column')
    expect(column.id).toBe('column')
  })

  it('get() lanza error para estrategia inexistente', () => {
    const registry = new PackingRegistry()
    expect(() => registry.get('nonexistent')).toThrow('not found')
  })

  it('list() devuelve todas las estrategias', () => {
    const registry = new PackingRegistry()
    const strategies = registry.list()
    expect(strategies.length).toBe(3)
    expect(strategies.every(s => s.id && s.name)).toBe(true)
  })

  it('has() verifica existencia', () => {
    const registry = new PackingRegistry()
    expect(registry.has('column')).toBe(true)
    expect(registry.has('nonexistent')).toBe(false)
  })

  it('permite sobrescribir una estrategia existente', () => {
    const registry = new PackingRegistry()

    class CustomColumn implements PackingStrategy {
      readonly id = 'column'
      readonly name = 'Custom Column'
      pack() {
        return { placements: [], metrics: { volumeUtilization: 0, weightUtilization: 0, centerOfGravity: { x: 0, y: 0, z: 0 }, stabilityScore: 0 }, unplacedBoxes: [] }
      }
    }

    registry.register(new CustomColumn())
    expect(registry.get('column').name).toBe('Custom Column')
  })
})

describe('defaultRegistry (singleton)', () => {
  it('está preconfigurado con las estrategias built-in', () => {
    expect(defaultRegistry.has('column')).toBe(true)
    expect(defaultRegistry.has('bin-packing-3d')).toBe(true)
    expect(defaultRegistry.has('type-group')).toBe(true)
  })
})
