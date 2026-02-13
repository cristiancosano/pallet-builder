/**
 * Tests — Entities: StackedPallet helpers
 * Cubre getStackedPalletTotalHeight, getStackedPalletTotalWeight, ensureUniqueBoxIds
 */

import { describe, it, expect } from 'vitest'
import {
  getStackedPalletTotalHeight,
  getStackedPalletTotalWeight,
  ensureUniqueBoxIds,
} from '../entities/StackedPallet'
import { makeBox, makeFloor, makePallet, makePlacedBox, makeSeparator, makeStackedPallet } from './helpers'

describe('getStackedPalletTotalHeight', () => {
  it('calcula la altura de un stack con un solo piso sin cajas', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({ pallet: makePallet({ dimensions: { width: 1200, height: 144, depth: 800 } }) })],
    })
    // Pallet height (144) + max box Y (0) + no separator
    expect(getStackedPalletTotalHeight(stack)).toBe(144)
  })

  it('calcula la altura con cajas', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({
        pallet: makePallet({ dimensions: { width: 1200, height: 144, depth: 800 } }),
        boxes: [
          makePlacedBox({ position: { x: 0, y: 0, z: 0 }, box: { dimensions: { width: 400, height: 300, depth: 300 } } }),
          makePlacedBox({ id: 'pb-2', position: { x: 400, y: 0, z: 0 }, box: { dimensions: { width: 400, height: 500, depth: 300 } } }),
        ],
      })],
    })
    // 144 (palet) + 500 (caja más alta)
    expect(getStackedPalletTotalHeight(stack)).toBe(644)
  })

  it('calcula la altura con múltiples pisos y separadores', () => {
    const pallet = makePallet({ dimensions: { width: 1200, height: 144, depth: 800 } })
    const sep = makeSeparator({ dimensions: { width: 1200, height: 10, depth: 800 } })
    const box = makePlacedBox({ position: { x: 0, y: 0, z: 0 }, box: { dimensions: { width: 400, height: 300, depth: 300 } } })

    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0, pallet, boxes: [box], separatorAbove: sep }),
        makeFloor({ level: 1, pallet, boxes: [box] }),
      ],
    })
    // Piso 0: 144 + 300 + 10 (sep) = 454
    // Piso 1: 144 + 300 = 444
    // Total: 898
    expect(getStackedPalletTotalHeight(stack)).toBe(898)
  })
})

describe('getStackedPalletTotalWeight', () => {
  it('calcula el peso de un stack vacío (solo palet)', () => {
    const stack = makeStackedPallet({
      floors: [makeFloor({ pallet: makePallet({ weight: 25 }) })],
    })
    expect(getStackedPalletTotalWeight(stack)).toBe(25)
  })

  it('suma peso de cajas, palets y separadores', () => {
    const pallet = makePallet({ weight: 25 })
    const sep = makeSeparator({ weight: 2 })
    const box1 = makePlacedBox({ box: { weight: 10 } })
    const box2 = makePlacedBox({ id: 'pb-2', box: { weight: 15 } })

    const stack = makeStackedPallet({
      floors: [
        makeFloor({ level: 0, pallet, boxes: [box1], separatorAbove: sep }),
        makeFloor({ level: 1, pallet, boxes: [box2] }),
      ],
    })
    // 25 + 10 + 2 + 25 + 15 = 77
    expect(getStackedPalletTotalWeight(stack)).toBe(77)
  })
})

describe('ensureUniqueBoxIds', () => {
  it('genera IDs únicos para todas las cajas del stack', () => {
    const stack = makeStackedPallet({
      id: 'stack-test',
      floors: [
        makeFloor({
          level: 0,
          boxes: [
            makePlacedBox({ id: 'dup' }),
            makePlacedBox({ id: 'dup' }),
          ],
        }),
      ],
    })

    const result = ensureUniqueBoxIds(stack)
    const ids = result.floors[0].boxes.map(b => b.id)
    expect(ids[0]).toBe('stack-test:f0:b0')
    expect(ids[1]).toBe('stack-test:f0:b1')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('usa contextId cuando se provee', () => {
    const stack = makeStackedPallet({
      id: 'stack-test',
      floors: [makeFloor({ boxes: [makePlacedBox()] })],
    })

    const result = ensureUniqueBoxIds(stack, 'ctx-42')
    expect(result.floors[0].boxes[0].id).toBe('ctx-42:f0:b0')
  })

  it('no muta el stack original', () => {
    const stack = makeStackedPallet({
      id: 'orig',
      floors: [makeFloor({ boxes: [makePlacedBox({ id: 'original-id' })] })],
    })
    ensureUniqueBoxIds(stack)
    expect(stack.floors[0].boxes[0].id).toBe('original-id')
  })
})
