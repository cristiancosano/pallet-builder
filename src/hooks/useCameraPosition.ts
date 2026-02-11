/**
 * useCameraPosition — Hook para rastrear la posición de la cámara en tiempo real
 */

import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'

export interface CameraPosition {
  x: number
  y: number
  z: number
}

export function useCameraPosition(): CameraPosition {
  const { camera } = useThree()
  const [position, setPosition] = useState<CameraPosition>({
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  })

  useEffect(() => {
    let frameId: number

    const updatePosition = () => {
      setPosition({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      })
      frameId = requestAnimationFrame(updatePosition)
    }

    frameId = requestAnimationFrame(updatePosition)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [camera])

  return position
}
