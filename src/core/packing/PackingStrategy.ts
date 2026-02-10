/**
 * PackingStrategy — Interfaz adapter para algoritmos de empaquetado
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { PackingMetrics } from '../types'

export interface PackingResult {
  placements: PlacedBox[]
  metrics: PackingMetrics
  unplacedBoxes: Box[]
}

export interface PackingStrategy {
  readonly id: string
  readonly name: string
  pack(boxes: Box[], pallet: Pallet): PackingResult
}
