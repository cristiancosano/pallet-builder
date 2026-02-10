/**
 * Warehouse — Almacén con estancias
 */

import type { Room } from './Room'

export interface Warehouse {
  id: string
  name: string
  rooms: Room[]
  metadata: Record<string, unknown>
}
