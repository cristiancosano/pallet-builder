/**
 * usePackingStrategy — Accede al registry, ejecuta estrategia seleccionada
 */

import { useMemo, useCallback } from 'react'
import type { Box } from '@/core/entities/Box'
import type { Pallet } from '@/core/entities/Pallet'
import type { PackingResult } from '@/core/packing/PackingStrategy'
import { PackingRegistry, defaultRegistry } from '@/core/packing/registry'

export interface UsePackingStrategyReturn {
  availableStrategies: { id: string; name: string }[]
  pack: (boxes: Box[], pallet: Pallet) => PackingResult
}

export function usePackingStrategy(
  strategyId: string,
  registry: PackingRegistry = defaultRegistry,
): UsePackingStrategyReturn {
  const availableStrategies = useMemo(
    () => registry.list().map(s => ({ id: s.id, name: s.name })),
    [registry],
  )

  const pack = useCallback(
    (boxes: Box[], pallet: Pallet): PackingResult => {
      const strategy = registry.get(strategyId)
      return strategy.pack(boxes, pallet)
    },
    [strategyId, registry],
  )

  return { availableStrategies, pack }
}
