/**
 * usePalletMetrics — Calcula métricas de un StackedPallet
 */

import { useMemo } from 'react'
import type { StackedPallet } from '@/core/entities/StackedPallet'
import { getStackedPalletTotalHeight, getStackedPalletTotalWeight } from '@/core/entities/StackedPallet'
import type { Position3D, PackingMetrics } from '@/core/types'
import { calculateCenterOfGravity, calculateStabilityScore } from '@/core/validation/stability'

export interface PalletMetricsResult extends PackingMetrics {
  totalHeight: number  // mm
  totalWeight: number  // kg
  boxCount: number
  floorCount: number
}

export function usePalletMetrics(stack: StackedPallet | null): PalletMetricsResult {
  return useMemo(() => {
    if (!stack || stack.floors.length === 0) {
      return {
        volumeUtilization: 0,
        weightUtilization: 0,
        centerOfGravity: { x: 0, y: 0, z: 0 } as Position3D,
        stabilityScore: 100,
        totalHeight: 0,
        totalWeight: 0,
        boxCount: 0,
        floorCount: 0,
      }
    }

    const totalHeight = getStackedPalletTotalHeight(stack)
    const totalWeight = getStackedPalletTotalWeight(stack)
    const basePallet = stack.floors[0].pallet
    const allBoxes = stack.floors.flatMap(f => f.boxes)
    const boxCount = allBoxes.length
    const floorCount = stack.floors.length

    // Volumen total disponible
    const totalVolume = basePallet.dimensions.width * basePallet.maxStackHeight * basePallet.dimensions.depth
    const usedVolume = allBoxes.reduce((s, pb) => {
      const d = pb.box.dimensions
      return s + d.width * d.height * d.depth
    }, 0)

    const cog = calculateCenterOfGravity(allBoxes)
    const stability = calculateStabilityScore(basePallet, allBoxes)

    return {
      volumeUtilization: totalVolume > 0 ? usedVolume / totalVolume : 0,
      weightUtilization: basePallet.maxWeight > 0 ? totalWeight / basePallet.maxWeight : 0,
      centerOfGravity: cog,
      stabilityScore: stability,
      totalHeight,
      totalWeight,
      boxCount,
      floorCount,
    }
  }, [stack])
}
