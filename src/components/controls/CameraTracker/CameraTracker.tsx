/**
 * CameraTracker — Componente interno para rastrear la posición de cámara
 * y pasarla a componentes externos
 */

import { useEffect } from 'react'
import { useCameraPosition } from '@/hooks/useCameraPosition'

export interface CameraTrackerProps {
  onPositionChange: (position: { x: number; y: number; z: number }) => void
}

export function CameraTracker({ onPositionChange }: CameraTrackerProps) {
  const position = useCameraPosition()

  useEffect(() => {
    onPositionChange(position)
  }, [position, onPositionChange])

  return null
}
