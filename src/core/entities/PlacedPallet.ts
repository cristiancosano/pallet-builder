/**
 * PlacedPallet — Un StackedPallet posicionado dentro de una Room o Truck
 */

import type { StackedPallet } from './StackedPallet'
import type { Position3D } from '../types'

export interface PlacedPallet {
  id: string
  stackedPallet: StackedPallet
  position: Position3D
  yRotation: 0 | 90 | 180 | 270
}
