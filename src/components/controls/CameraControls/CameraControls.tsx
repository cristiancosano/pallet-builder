/**
 * CameraControls — Wrapper de OrbitControls con presets de posición
 */

import { memo, useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

export type CameraPreset = 'perspective' | 'top' | 'front' | 'side' | 'isometric'

export interface CameraControlsProps {
  preset?: CameraPreset
  autoRotate?: boolean
  enablePan?: boolean
  enableZoom?: boolean
  target?: [number, number, number]
  minDistance?: number
  maxDistance?: number
  /** Tamaño de la escena para calcular posiciones relativas */
  sceneSize?: { width: number; height: number; depth: number }
}

/**
 * Calcula posiciones de cámara relativas al tamaño de la escena.
 * Usa un factor multiplicador basado en la diagonal del bounding box.
 */
function calculatePresetPosition(
  preset: CameraPreset,
  target: [number, number, number],
  sceneSize?: { width: number; height: number; depth: number },
): [number, number, number] {
  // Si no hay tamaño de escena, usar valores por defecto
  if (!sceneSize) {
    const defaults: Record<CameraPreset, [number, number, number]> = {
      perspective: [3, 3, 3],
      isometric: [4, 4, 4],
      top: [0, 5, 0],
      front: [0, 1.5, 5],
      side: [5, 1.5, 0],
    }
    return defaults[preset]
  }

  const { width, height, depth } = sceneSize
  const [tx, ty, tz] = target
  
  // Calcular la diagonal del bounding box para determinar la distancia óptima
  const diagonal = Math.sqrt(width ** 2 + height ** 2 + depth ** 2)
  const distance = diagonal * 3.0 // Factor de distancia para ver toda la escena
  
  switch (preset) {
    case 'perspective':
      // Vista perspectiva ajustada: 45° en horizontal, 30° en vertical
      return [
        tx + distance * 0.6,
        ty + distance * 0.5,
        tz + distance * 0.6,
      ]
    
    case 'isometric':
      // Vista isométrica pura: igual distancia en X, Y, Z
      return [
        tx + distance * 0.577,
        ty + distance * 0.577,
        tz + distance * 0.577,
      ]
    
    case 'top':
      // Vista superior: solo altura
      return [tx, ty + Math.max(distance, height * 2), tz]
    
    case 'front':
      // Vista frontal: desde el frente
      return [tx, ty + height * 0.5, tz + Math.max(distance, depth * 1.5)]
    
    case 'side':
      // Vista lateral: desde el lado
      return [tx + Math.max(distance, width * 1.5), ty + height * 0.5, tz]
  }
}

export const CameraControlsComponent = memo<CameraControlsProps>(function CameraControlsComponent({
  preset = 'perspective',
  autoRotate = false,
  enablePan = true,
  enableZoom = true,
  target = [0, 0, 0],
  minDistance = 0.5,
  maxDistance = 50,
  sceneSize,
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Actualizar la posición de la cámara con animación suave cuando cambia el preset
  useEffect(() => {
    const pos = calculatePresetPosition(preset, target, sceneSize)
    const targetPos = new THREE.Vector3(pos[0], pos[1], pos[2])
    const targetLookAt = new THREE.Vector3(...target)
    
    // Animación suave de transición (usando un simple lerp)
    const startPos = camera.position.clone()
    const duration = 1000 // ms
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease-out cubic para una animación más natural
      const eased = 1 - Math.pow(1 - progress, 3)
      
      camera.position.lerpVectors(startPos, targetPos, eased)
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt, eased)
        controlsRef.current.update()
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }, [preset, sceneSize, camera, target])

  return (
    <OrbitControls
      ref={controlsRef}
      target={target}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate
      minDistance={minDistance}
      maxDistance={maxDistance}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      makeDefault
    />
  )
})
