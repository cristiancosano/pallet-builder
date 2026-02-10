/**
 * PackingRegistry — Registro de estrategias de empaquetado
 */

import type { PackingStrategy } from './PackingStrategy'
import { ColumnStrategy } from './ColumnStrategy'
import { BinPacking3DStrategy } from './BinPacking3D'
import { TypeGroupStrategy } from './TypeGroupStrategy'

export class PackingRegistry {
  private strategies = new Map<string, PackingStrategy>()

  constructor() {
    // Registrar estrategias built-in
    this.register(new ColumnStrategy())
    this.register(new BinPacking3DStrategy())
    this.register(new TypeGroupStrategy())
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
