/**
 * Test helpers — Factories de datos para tests
 */

import type { Box } from '../entities/Box'
import type { Pallet } from '../entities/Pallet'
import type { PlacedBox } from '../entities/PlacedBox'
import type { Separator } from '../entities/Separator'
import type { PalletFloor } from '../entities/PalletFloor'
import type { StackedPallet } from '../entities/StackedPallet'
import type { PlacedPallet } from '../entities/PlacedPallet'
import type { Room } from '../entities/Room'
import type { Truck } from '../entities/Truck'
import type { Dimensions3D, DiscreteRotation, Position3D } from '../types'
import { PalletMaterial, SeparatorMaterial, TruckType } from '../types'

// ─── Box helpers ─────────────────────────────────────────────────

export function makeBox(overrides?: Partial<Box>): Box {
  return {
    id: 'box-1',
    dimensions: { width: 400, height: 300, depth: 300 },
    weight: 10,
    fragile: false,
    stackable: true,
    metadata: {},
    ...overrides,
  }
}

export function makePlacedBox(overrides?: Partial<PlacedBox & { box?: Partial<Box> }>): PlacedBox {
  const { box: boxOverrides, ...rest } = overrides ?? {}
  return {
    id: 'pb-1',
    box: makeBox(boxOverrides),
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    supportedBy: [],
    supporting: [],
    ...rest,
  }
}

// ─── Pallet helpers ──────────────────────────────────────────────

export function makePallet(overrides?: Partial<Pallet>): Pallet {
  return {
    id: 'pallet-1',
    dimensions: { width: 1200, height: 144, depth: 800 },
    material: PalletMaterial.WOOD,
    maxWeight: 1000,
    maxStackHeight: 2200,
    weight: 25,
    metadata: {},
    ...overrides,
  }
}

// ─── Separator helpers ───────────────────────────────────────────

export function makeSeparator(overrides?: Partial<Separator>): Separator {
  return {
    id: 'sep-1',
    dimensions: { width: 1200, height: 10, depth: 800 },
    material: SeparatorMaterial.CARDBOARD,
    weight: 2,
    metadata: {},
    ...overrides,
  }
}

// ─── PalletFloor helpers ────────────────────────────────────────

export function makeFloor(overrides?: Partial<PalletFloor>): PalletFloor {
  return {
    level: 0,
    pallet: makePallet(),
    boxes: [],
    ...overrides,
  }
}

// ─── StackedPallet helpers ───────────────────────────────────────

export function makeStackedPallet(overrides?: Partial<StackedPallet>): StackedPallet {
  return {
    id: 'stack-1',
    floors: [makeFloor()],
    metadata: {},
    ...overrides,
  }
}

// ─── PlacedPallet helpers ────────────────────────────────────────

export function makePlacedPallet(overrides?: Partial<PlacedPallet>): PlacedPallet {
  return {
    id: 'pp-1',
    stackedPallet: makeStackedPallet(),
    position: { x: 0, y: 0, z: 0 },
    yRotation: 0,
    ...overrides,
  }
}

// ─── Room helpers ────────────────────────────────────────────────

/** Room rectangular 10m × 8m con techo a 5m */
export function makeRoom(overrides?: Partial<Room>): Room {
  return {
    id: 'room-1',
    name: 'Estancia A',
    floorPolygon: [
      { x: 0, z: 0 },
      { x: 10000, z: 0 },
      { x: 10000, z: 8000 },
      { x: 0, z: 8000 },
    ],
    ceilingHeight: 5000,
    pallets: [],
    metadata: {},
    ...overrides,
  }
}

// ─── Truck helpers ───────────────────────────────────────────────

export function makeTruck(overrides?: Partial<Truck>): Truck {
  return {
    id: 'truck-1',
    name: 'Camión Test',
    truckType: TruckType.BOX,
    dimensions: { width: 2480, height: 2700, depth: 13600 },
    maxWeight: 24000,
    pallets: [],
    metadata: {},
    ...overrides,
  }
}

// ─── Utility ────────────────────────────────────────────────────

export function pos(x: number, y: number, z: number): Position3D {
  return { x, y, z }
}

export function dims(w: number, h: number, d: number): Dimensions3D {
  return { width: w, height: h, depth: d }
}

export function rot(x: 0 | 90 | 180 | 270 = 0, y: 0 | 90 | 180 | 270 = 0, z: 0 | 90 | 180 | 270 = 0): DiscreteRotation {
  return { x, y, z }
}
