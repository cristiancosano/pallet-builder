/**
 * Box — Componente primitivo 3D para una caja
 * Controlado, memo, conversión mm→metros interna
 */

import { memo, useCallback, useRef, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PlacedBox } from '@/core/entities/PlacedBox'
import { UNITS } from '@/core/constants'

export interface BoxProps {
  placedBox: PlacedBox
  selected?: boolean
  highlighted?: boolean
  showLabel?: boolean
  color?: string
  opacity?: number
  onClick?: (id: string) => void
  onHover?: (id: string | null) => void
}

export const BoxComponent = memo<BoxProps>(function BoxComponent({
  placedBox,
  selected = false,
  highlighted = false,
  showLabel = false,
  color,
  opacity = 1,
  onClick,
  onHover,
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const { box, position, rotation } = placedBox
  const s = UNITS.MM_TO_M

  // Dimensiones (teniendo en cuenta rotación en Y)
  let w = box.dimensions.width
  let d = box.dimensions.depth
  if (rotation.y === 90 || rotation.y === 270) {
    ;[w, d] = [d, w]
  }

  const scaledDims = useMemo(
    () => [w * s, box.dimensions.height * s, d * s] as [number, number, number],
    [w, d, box.dimensions.height, s],
  )

  // Posición: convertir mm→m, centrar geometría en Y
  const pos = useMemo(
    () =>
      new THREE.Vector3(
        position.x * s + scaledDims[0] / 2,
        position.y * s + scaledDims[1] / 2,
        position.z * s + scaledDims[2] / 2,
      ),
    [position, scaledDims, s],
  )

  const resolvedColor = color ?? box.color ?? '#e07b39'
  const finalColor = selected ? '#ff9800' : highlighted ? '#42a5f5' : resolvedColor

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onClick?.(placedBox.id)
    },
    [onClick, placedBox.id],
  )

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onHover?.(placedBox.id)
    },
    [onHover, placedBox.id],
  )

  const handlePointerOut = useCallback(() => {
    onHover?.(null)
  }, [onHover])

  return (
    <group>
      <mesh
        ref={meshRef}
        position={pos}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={scaledDims} />
        <meshStandardMaterial
          color={finalColor}
          transparent={opacity < 1}
          opacity={opacity}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Borde de selección */}
      {selected && (
        <lineSegments position={pos}>
          <edgesGeometry args={[new THREE.BoxGeometry(...scaledDims)]} />
          <lineBasicMaterial color="#ffffff" linewidth={2} />
        </lineSegments>
      )}

      {/* Label */}
      {showLabel && (
        <Html
          position={[pos.x, pos.y + scaledDims[1] / 2 + 0.05, pos.z]}
          center
          style={{
            background: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {box.sku ?? box.type ?? box.id}
        </Html>
      )}
    </group>
  )
})
