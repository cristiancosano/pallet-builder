/**
 * Pallet — Componente primitivo 3D para la base física de un palet
 */

import { memo, useMemo } from 'react'
import * as THREE from 'three'
import type { Pallet } from '@/core/entities/Pallet'
import type { Position3D } from '@/core/types'
import { UNITS } from '@/core/constants'

export interface PalletComponentProps {
  pallet: Pallet
  position?: Position3D
  color?: string
}

export const PalletComponent = memo<PalletComponentProps>(function PalletComponent({
  pallet,
  position = { x: 0, y: 0, z: 0 },
  color = '#c4a26e',
}) {
  const s = UNITS.MM_TO_M
  const dims = pallet.dimensions

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

  return (
    <group>
      {/* Tabla superior */}
      <mesh position={pos} castShadow receiveShadow>
        <boxGeometry args={scaledDims} />
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Bordes */}
      <lineSegments position={pos}>
        <edgesGeometry args={[new THREE.BoxGeometry(...scaledDims)]} />
        <lineBasicMaterial color="#8b7355" />
      </lineSegments>
    </group>
  )
})
