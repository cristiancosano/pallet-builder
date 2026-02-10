/**
 * PlacedBox — Una Box posicionada dentro de un palet
 */

import type { Box } from './Box'
import type { Position3D, DiscreteRotation } from '../types'

export interface PlacedBox {
  id: string
  box: Box
  position: Position3D
  rotation: DiscreteRotation
  supportedBy: string[]
  supporting: string[]
}
