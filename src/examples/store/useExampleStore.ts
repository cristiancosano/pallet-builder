/**
 * Store global para los ejemplos — Zustand
 *
 * Gestiona:
 *  - Plantillas de cajas (box templates)
 *  - Pallets construidos (StackedPallet[])
 *  - Warehouse (Room con PlacedPallet[])
 *  - Truck (con PlacedPallet[])
 *  - Estado de edición
 */

import { create } from 'zustand'
import type { Box } from '@/core/entities/Box'
import type { Pallet } from '@/core/entities/Pallet'
import type { StackedPallet } from '@/core/entities/StackedPallet'
import type { PlacedPallet } from '@/core/entities/PlacedPallet'
import type { Truck } from '@/core/entities/Truck'
import type { Room } from '@/core/entities/Room'
import type { PlacedBox } from '@/core/entities/PlacedBox'
import type { Separator } from '@/core/entities/Separator'
import type { PalletFloor } from '@/core/entities/PalletFloor'
import type { Position3D } from '@/core/types'
import { BoxFactory } from '@/core/factories/BoxFactory'
import { PalletFactory } from '@/core/factories/PalletFactory'
import { TruckFactory } from '@/core/factories/TruckFactory'
import { TruckType, SeparatorMaterial } from '@/core/types'

// ── Tipos auxiliares ─────────────────────────────────────────────

export interface BoxTemplate {
  id: string
  name: string
  box: Box
  quantity: number
}

export type ExampleView = 'pallet-builder' | 'truck-viewer' | 'warehouse-viewer'

// ── Estado ───────────────────────────────────────────────────────

export interface ExampleState {
  // Navegación
  activeView: ExampleView

  // Plantillas de cajas
  boxTemplates: BoxTemplate[]

  // Pallet builder
  selectedPalletType: string
  selectedStrategy: string
  builderPalletId: string | null // pallet que se está editando

  // Pallets construidos (listos para warehouse/truck)
  pallets: Record<string, StackedPallet>

  // Warehouse
  warehouse: Room

  // Truck
  truck: Truck

  // Selección/UI
  selectedBoxId: string | null
  selectedPalletPlacementId: string | null
  hoveredBoxId: string | null
}

// ── Acciones ─────────────────────────────────────────────────────

export interface ExampleActions {
  // Navegación
  setActiveView: (view: ExampleView) => void

  // Box templates
  addBoxTemplate: (template: Omit<BoxTemplate, 'id'>) => void
  updateBoxTemplate: (id: string, updates: Partial<BoxTemplate>) => void
  removeBoxTemplate: (id: string) => void

  // Pallet builder
  setSelectedPalletType: (type: string) => void
  setSelectedStrategy: (strategy: string) => void
  buildPallet: (
    name: string,
    placedBoxes: PlacedBox[],
    pallet: Pallet,
    floors?: PalletFloor[],
  ) => string
  updatePallet: (id: string, stackedPallet: StackedPallet) => void
  removePallet: (id: string) => void
  editPalletInBuilder: (palletId: string) => void

  // Warehouse
  addPalletToWarehouse: (palletId: string, position: Position3D) => void
  removePalletFromWarehouse: (placementId: string) => void
  movePalletInWarehouse: (placementId: string, position: Position3D) => void
  rotatePalletInWarehouse: (placementId: string) => void

  // Truck
  addPalletToTruck: (palletId: string, position: Position3D) => void
  removePalletFromTruck: (placementId: string) => void
  movePalletInTruck: (placementId: string, position: Position3D) => void
  rotatePalletInTruck: (placementId: string) => void
  movePalletFromWarehouseToTruck: (warehousePlacementId: string, truckPosition: Position3D) => void

  // Selección
  setSelectedBoxId: (id: string | null) => void
  setSelectedPalletPlacementId: (id: string | null) => void
  setHoveredBoxId: (id: string | null) => void
}

// ── Datos iniciales ──────────────────────────────────────────────

let _counter = 0
const uid = (prefix: string) => `${prefix}-${++_counter}`

function createDefaultBoxTemplates(): BoxTemplate[] {
  return [
    {
      id: uid('tpl'),
      name: 'Caja pesada',
      box: BoxFactory.create(
        { width: 400, height: 300, depth: 600 },
        { type: 'Heavy', weight: 25, color: '#4a90d9' },
      ),
      quantity: 6,
    },
    {
      id: uid('tpl'),
      name: 'Caja mediana',
      box: BoxFactory.create(
        { width: 300, height: 250, depth: 400 },
        { type: 'Medium', weight: 12, color: '#50b86c' },
      ),
      quantity: 8,
    },
    {
      id: uid('tpl'),
      name: 'Caja estándar',
      box: BoxFactory.create(
        { width: 400, height: 200, depth: 600 },
        { type: 'Standard', weight: 15, color: '#8e44ad' },
      ),
      quantity: 6,
    },
    {
      id: uid('tpl'),
      name: 'Caja frágil',
      box: BoxFactory.fragile(
        { width: 250, height: 200, depth: 350 },
        10,
        { type: 'Fragile', weight: 5, color: '#e8a838' },
      ),
      quantity: 4,
    },
  ]
}

function createDefaultWarehouse(): Room {
  return {
    id: 'warehouse-room-1',
    name: 'Zona de carga',
    floorPolygon: [
      { x: 0, z: 0 },
      { x: 8000, z: 0 },
      { x: 8000, z: 6000 },
      { x: 0, z: 6000 },
    ],
    ceilingHeight: 3500,
    pallets: [],
    metadata: {},
  }
}

function createDefaultTruck(): Truck {
  return TruckFactory.fromPreset(TruckType.BOX)
}

// ── Store ────────────────────────────────────────────────────────

export const useExampleStore = create<ExampleState & ExampleActions>((set, get) => ({
  // Estado inicial
  activeView: 'pallet-builder',
  boxTemplates: createDefaultBoxTemplates(),
  selectedPalletType: 'EUR',
  selectedStrategy: 'column',
  builderPalletId: null,
  pallets: {},
  warehouse: createDefaultWarehouse(),
  truck: createDefaultTruck(),
  selectedBoxId: null,
  selectedPalletPlacementId: null,
  hoveredBoxId: null,

  // ── Navegación ─────────────────────────────────────────────────

  setActiveView: (view) => set({ activeView: view, selectedBoxId: null, selectedPalletPlacementId: null }),

  // ── Box templates ──────────────────────────────────────────────

  addBoxTemplate: (template) =>
    set((s) => ({
      boxTemplates: [...s.boxTemplates, { ...template, id: uid('tpl') }],
    })),

  updateBoxTemplate: (id, updates) =>
    set((s) => ({
      boxTemplates: s.boxTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  removeBoxTemplate: (id) =>
    set((s) => ({
      boxTemplates: s.boxTemplates.filter((t) => t.id !== id),
    })),

  // ── Pallet builder ─────────────────────────────────────────────

  setSelectedPalletType: (type) => set({ selectedPalletType: type }),
  setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),

  buildPallet: (name, placedBoxes, pallet, floors) => {
    const palletId = uid('pallet')
    const stackedPallet: StackedPallet = {
      id: palletId,
      floors: floors || [
        {
          level: 0,
          pallet,
          boxes: placedBoxes,
        },
      ],
      metadata: { name },
    }
    set((s) => ({
      pallets: { ...s.pallets, [palletId]: stackedPallet },
      builderPalletId: null,
    }))
    return palletId
  },

  updatePallet: (id, stackedPallet) =>
    set((s) => {
      // Actualizar también las referencias en warehouse y truck
      const warehouse = { ...s.warehouse }
      warehouse.pallets = warehouse.pallets.map((pp) =>
        pp.stackedPallet.id === id ? { ...pp, stackedPallet } : pp,
      )
      const truck = { ...s.truck }
      truck.pallets = truck.pallets.map((pp) =>
        pp.stackedPallet.id === id ? { ...pp, stackedPallet } : pp,
      )
      return {
        pallets: { ...s.pallets, [id]: stackedPallet },
        warehouse,
        truck,
      }
    }),

  removePallet: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.pallets
      return {
        pallets: rest,
        // Remove from warehouse & truck also
        warehouse: {
          ...s.warehouse,
          pallets: s.warehouse.pallets.filter((pp) => pp.stackedPallet.id !== id),
        },
        truck: {
          ...s.truck,
          pallets: s.truck.pallets.filter((pp) => pp.stackedPallet.id !== id),
        },
      }
    }),

  editPalletInBuilder: (palletId) =>
    set({
      activeView: 'pallet-builder',
      builderPalletId: palletId,
      selectedBoxId: null,
    }),

  // ── Warehouse ──────────────────────────────────────────────────

  addPalletToWarehouse: (palletId, position) =>
    set((s) => {
      const sp = s.pallets[palletId]
      if (!sp) return s
      const placement: PlacedPallet = {
        id: uid('wh-pp'),
        stackedPallet: sp,
        position,
        yRotation: 0,
      }
      return {
        warehouse: {
          ...s.warehouse,
          pallets: [...s.warehouse.pallets, placement],
        },
      }
    }),

  removePalletFromWarehouse: (placementId) =>
    set((s) => ({
      warehouse: {
        ...s.warehouse,
        pallets: s.warehouse.pallets.filter((pp) => pp.id !== placementId),
      },
    })),

  movePalletInWarehouse: (placementId, position) =>
    set((s) => ({
      warehouse: {
        ...s.warehouse,
        pallets: s.warehouse.pallets.map((pp) =>
          pp.id === placementId ? { ...pp, position } : pp,
        ),
      },
    })),

  rotatePalletInWarehouse: (placementId) =>
    set((s) => ({
      warehouse: {
        ...s.warehouse,
        pallets: s.warehouse.pallets.map((pp) =>
          pp.id === placementId
            ? { ...pp, yRotation: ((pp.yRotation + 90) % 360) as 0 | 90 | 180 | 270 }
            : pp,
        ),
      },
    })),

  // ── Truck ──────────────────────────────────────────────────────

  addPalletToTruck: (palletId, position) =>
    set((s) => {
      const sp = s.pallets[palletId]
      if (!sp) return s
      const placement: PlacedPallet = {
        id: uid('tr-pp'),
        stackedPallet: sp,
        position,
        yRotation: 0,
      }
      return {
        truck: {
          ...s.truck,
          pallets: [...s.truck.pallets, placement],
        },
      }
    }),

  removePalletFromTruck: (placementId) =>
    set((s) => ({
      truck: {
        ...s.truck,
        pallets: s.truck.pallets.filter((pp) => pp.id !== placementId),
      },
    })),

  movePalletInTruck: (placementId, position) =>
    set((s) => ({
      truck: {
        ...s.truck,
        pallets: s.truck.pallets.map((pp) =>
          pp.id === placementId ? { ...pp, position } : pp,
        ),
      },
    })),

  rotatePalletInTruck: (placementId) =>
    set((s) => ({
      truck: {
        ...s.truck,
        pallets: s.truck.pallets.map((pp) =>
          pp.id === placementId
            ? { ...pp, yRotation: ((pp.yRotation + 90) % 360) as 0 | 90 | 180 | 270 }
            : pp,
        ),
      },
    })),

  movePalletFromWarehouseToTruck: (warehousePlacementId, truckPosition) =>
    set((s) => {
      const whPallet = s.warehouse.pallets.find((pp) => pp.id === warehousePlacementId)
      if (!whPallet) return s

      const truckPlacement: PlacedPallet = {
        id: uid('tr-pp'),
        stackedPallet: whPallet.stackedPallet,
        position: truckPosition,
        yRotation: 0,
      }

      return {
        warehouse: {
          ...s.warehouse,
          pallets: s.warehouse.pallets.filter((pp) => pp.id !== warehousePlacementId),
        },
        truck: {
          ...s.truck,
          pallets: [...s.truck.pallets, truckPlacement],
        },
      }
    }),

  // ── Selección ──────────────────────────────────────────────────

  setSelectedBoxId: (id) => set({ selectedBoxId: id }),
  setSelectedPalletPlacementId: (id) => set({ selectedPalletPlacementId: id }),
  setHoveredBoxId: (id) => set({ hoveredBoxId: id }),
}))
