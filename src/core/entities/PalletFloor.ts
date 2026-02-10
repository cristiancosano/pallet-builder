/**
 * PalletFloor — Un nivel individual dentro de un StackedPallet
 */

import type { Pallet } from './Pallet'
import type { PlacedBox } from './PlacedBox'
import type { Separator } from './Separator'

export interface PalletFloor {
  /** Índice del piso (0 = base) */
  level: number
  pallet: Pallet
  boxes: PlacedBox[]
  /** Separador situado ENCIMA de este piso (nulo si es el último) */
  separatorAbove?: Separator
}
