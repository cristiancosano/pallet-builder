/**
 * Box — Componente primitivo 3D para una caja
 * Controlado, memo, conversión mm→metros interna
 */

import { memo, useCallback, useRef, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { PlacedBox } from '@/core/entities/PlacedBox'
import { UNITS } from '@/core/constants'
import { usePreset } from '@/context/PresetContext'

export interface BoxProps {
  placedBox: PlacedBox
  selected?: boolean
  highlighted?: boolean
  showLabel?: boolean
  color?: string
  opacity?: number
  selectedColor?: string
  highlightedColor?: string
  onClick?: (id: string) => void
  onHover?: (id: string | null) => void
}

export const BoxComponent = memo<BoxProps>(function BoxComponent({
  placedBox,
  selected = false,
  highlighted = false,
  showLabel = false,
  color,
  opacity,
  selectedColor,
  highlightedColor,
  onClick,
  onHover,
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const preset = usePreset()

  const { box, position, rotation } = placedBox
  const s = UNITS.MM_TO_M

  // Resolver estilos: prop > preset
  const resolvedColor = color ?? box.color ?? preset.box.color
  const resolvedOpacity = opacity ?? preset.box.opacity
  const resolvedSelectedColor = selectedColor ?? preset.selection.selectedColor
  const resolvedHighlightedColor = highlightedColor ?? preset.selection.highlightedColor

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

  const borderColor = selected ? resolvedSelectedColor : highlighted ? resolvedHighlightedColor : null

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
          color={resolvedColor}
          transparent={resolvedOpacity < 1}
          opacity={resolvedOpacity}
          roughness={preset.box.roughness}
          metalness={preset.box.metalness}
        />
      </mesh>

      {/* Borde de señalización (selección o highlight) — mesh escalado para grosor visible */}
      {borderColor && (
        <mesh position={pos}>
          <boxGeometry args={scaledDims} />
          <meshBasicMaterial
            color={borderColor}
            wireframe
            wireframeLinewidth={1}
            transparent
            opacity={0.9}
            depthTest={false}
          />
        </mesh>
      )}
      {borderColor && (
        <lineSegments position={pos} renderOrder={999}>
          <edgesGeometry args={[new THREE.BoxGeometry(...scaledDims)]} />
          <lineBasicMaterial color={borderColor} />
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
