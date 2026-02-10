/**
 * Separator — Componente primitivo 3D para un separador entre pisos
 */

import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { Separator } from '@/core/entities/Separator'
import type { Position3D } from '@/core/types'
import { UNITS } from '@/core/constants'
import { SeparatorMaterial } from '@/core/types'

const MATERIAL_COLORS: Record<SeparatorMaterial, string> = {
  [SeparatorMaterial.CARDBOARD]: '#b5926b',
  [SeparatorMaterial.WOOD]: '#c4a26e',
  [SeparatorMaterial.PLASTIC]: '#90a4ae',
}

export interface SeparatorComponentProps {
  separator: Separator
  position?: Position3D
}

export const SeparatorComponent = memo<SeparatorComponentProps>(function SeparatorComponent({
  separator,
  position = { x: 0, y: 0, z: 0 },
}) {
  const s = UNITS.MM_TO_M
  const dims = separator.dimensions

  const scaledDims = useMemo(
    () => [dims.width * s, dims.height * s, dims.depth * s] as [number, number, number],
    [dims, s],
  )

  const pos = useMemo(
    () =>
      new THREE.Vector3(
        position.x * s + scaledDims[0] / 2,
        position.y * s + scaledDims[1] / 2,
        position.z * s + scaledDims[2] / 2,
      ),
    [position, scaledDims, s],
  )

  const color = MATERIAL_COLORS[separator.material]

  return (
    <mesh position={pos} receiveShadow>
      <boxGeometry args={scaledDims} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
})
