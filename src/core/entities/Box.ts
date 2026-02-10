/**
 * Box — Caja individual que se coloca sobre un palet
 */

import type { Dimensions3D } from '../types'

export interface Box {
  id: string
  dimensions: Dimensions3D
  weight: number              // kg
  sku?: string
  type?: string
  fragile: boolean
  fragilityMaxWeight?: number // kg que soporta encima si fragile=true
  stackable: boolean
  color?: string
  texture?: string
  modelUrl?: string           // GLTF/GLB personalizado
  metadata: Record<string, unknown>
}
