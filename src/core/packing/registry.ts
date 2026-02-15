/**
 * PackingRegistry — Registry for packing strategies
 *
 * Maintains a collection of available packing strategies and provides
 * methods to register, retrieve, and list them.
 */

import type { PackingStrategy } from './PackingStrategy'
import { ColumnStrategy } from './ColumnStrategy'
import { BinPacking3DStrategy } from './BinPacking3D'
import { TypeGroupStrategy } from './TypeGroupStrategy'
import { MaterialGroupingStrategy } from './MaterialGroupingStrategy'

export class PackingRegistry {
  private strategies = new Map<string, PackingStrategy>()

  constructor() {
    // Register built-in strategies
    this.register(new ColumnStrategy())
    this.register(new BinPacking3DStrategy())
    this.register(new TypeGroupStrategy())
    this.register(new MaterialGroupingStrategy())
  }

  register(strategy: PackingStrategy): void {
    this.strategies.set(strategy.id, strategy)
  }

  get(id: string): PackingStrategy {
    const strategy = this.strategies.get(id)
    if (!strategy) {
      throw new Error(`Packing strategy "${id}" not found. Available: ${this.listIds().join(', ')}`)
    }
    return strategy
  }

  list(): PackingStrategy[] {
    return Array.from(this.strategies.values())
  }

  listIds(): string[] {
    return Array.from(this.strategies.keys())
  }

  has(id: string): boolean {
    return this.strategies.has(id)
  }
}

/** Instancia global del registro (singleton de conveniencia) */
export const defaultRegistry = new PackingRegistry()
