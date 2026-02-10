/**
 * PalletFactory — Factories para crear palets estándar y custom
 * 
 * Proporciona métodos para instanciar los principales tipos de palets
 * utilizados en logística internacional (EUR, GMA, UK, Asia, etc.)
 */

import type { Pallet } from '../entities/Pallet'
import type { Dimensions3D } from '../types'
import { PalletMaterial } from '../types'
import { STANDARD_PALLETS } from '../constants'

let _palletCounter = 0

function nextPalletId(): string {
  return `pallet-${++_palletCounter}`
}

export class PalletFactory {
  // ═══ Palets estándar internacionales ═══════════════════════════

  /** Palet EUR/EPAL — Estándar europeo (1200×800×144mm, ISO 6780, madera, 1000kg) */
  static euro(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('EUR', overrides)
  }

  /** Palet GMA — Estándar norteamericano (1219×1016×145mm, 48"×40", madera, 1200kg) */
  static gma(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('GMA', overrides)
  }

  /** @deprecated Use gma() instead. Alias para compatibilidad. */
  static american(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.gma(overrides)
  }

  /** Palet UK Standard — Reino Unido (1200×1000×150mm, madera, 1000kg) */
  static uk(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('UK', overrides)
  }

  /** Palet Asia — Estándar asiático (1100×1100×150mm, ISO 6780, madera, 1000kg) */
  static asia(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('ASIA', overrides)
  }

  /** Palet australiano — Estándar de Australia (1165×1165×150mm, madera, 1000kg) */
  static australian(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('AUSTRALIAN', overrides)
  }

  /** Medio palet EUR — Half European Pallet (800×600×144mm, madera, 500kg) */
  static halfEuro(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('HALF_EUR', overrides)
  }

  /** Cuarto de palet EUR — Quarter European Pallet (600×400×144mm, madera, 250kg) */
  static quarterEuro(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('QUARTER_EUR', overrides)
  }

  /** Palet ISO 1 — ISO 6780 (1200×1000×150mm, igual que UK) */
  static iso1(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('ISO_1', overrides)
  }

  /** Palet ISO 2 — ISO 6780 (1200×800×144mm, equivalente a EUR) */
  static iso2(overrides?: Partial<Pallet>): Pallet {
    return PalletFactory.fromPreset('ISO_2', overrides)
  }

  // ═══ Método genérico desde preset ═════════════════════════════

  /**
   * Crea un palet desde un preset por su clave
   * @param presetKey - Clave del preset (EUR, GMA, UK, ASIA, etc.)
   * @param overrides - Propiedades a sobrescribir
   */
  static fromPreset(
    presetKey: keyof typeof STANDARD_PALLETS,
    overrides?: Partial<Pallet>,
  ): Pallet {
    const preset = STANDARD_PALLETS[presetKey]
    if (!preset) {
      throw new Error(`Unknown pallet preset: ${presetKey}`)
    }
    return {
      id: nextPalletId(),
      dimensions: { ...preset.dimensions },
      material: preset.material,
      maxWeight: preset.maxWeight,
      maxStackHeight: preset.maxStackHeight,
      weight: preset.weight,
      metadata: { preset: presetKey },
      ...overrides,
    }
  }

  // ═══ Palet custom ══════════════════════════════════════════════

  /** Palet custom con dimensiones arbitrarias */
  static custom(dims: Dimensions3D, opts?: Partial<Pallet>): Pallet {
    return {
      id: nextPalletId(),
      dimensions: { ...dims },
      material: PalletMaterial.WOOD,
      maxWeight: 1000,
      maxStackHeight: 2200,
      weight: 25,
      metadata: {},
      ...opts,
    }
  }

  // ═══ Utilidades ════════════════════════════════════════════════

  /**
   * Lista todos los presets disponibles con sus características
   */
  static listPresets(): Array<{
    key: string
    dimensions: Dimensions3D
    maxWeight: number
    weight: number
  }> {
    return Object.entries(STANDARD_PALLETS).map(([key, preset]) => ({
      key,
      dimensions: preset.dimensions,
      maxWeight: preset.maxWeight,
      weight: preset.weight,
    }))
  }
}
