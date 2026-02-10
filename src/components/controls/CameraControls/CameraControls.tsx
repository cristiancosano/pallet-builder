/**
 * CameraControls — Wrapper de OrbitControls con presets de posición
 */

import { memo, useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export type CameraPreset = 'perspective' | 'top' | 'front' | 'side'

export interface CameraControlsProps {
  preset?: CameraPreset
  autoRotate?: boolean
  enablePan?: boolean
  enableZoom?: boolean
  target?: [number, number, number]
  minDistance?: number
  maxDistance?: number
}

const PRESET_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  perspective: [3, 3, 3],
  top: [0, 5, 0],
  front: [0, 1.5, 5],
  side: [5, 1.5, 0],
}

export const CameraControlsComponent = memo<CameraControlsProps>(function CameraControlsComponent({
  preset = 'perspective',
  autoRotate = false,
  enablePan = true,
  enableZoom = true,
  target = [0, 0, 0],
  minDistance = 0.5,
  maxDistance = 50,
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Solo actualizar la posición de la cámara cuando cambia el preset
  useEffect(() => {
    const pos = PRESET_POSITIONS[preset]
    const targetVec = new THREE.Vector3(...target)
    
    // Posicionar la cámara relativa al target
    camera.position.set(
      targetVec.x + pos[0],
      targetVec.y + pos[1],
      targetVec.z + pos[2],
    )
    
    // Actualizar el target de los controles
    if (controlsRef.current) {
      controlsRef.current.target.set(...target)
      controlsRef.current.update()
    }
  }, [preset]) // Solo depender del preset, no del target

  return (
    <OrbitControls
      ref={controlsRef}
      target={target}
      autoRotate={autoRotate}
      enablePan={enablePan}
      enableZoom={enableZoom}
      minDistance={minDistance}
      maxDistance={maxDistance}
      makeDefault
    />
  )
})
