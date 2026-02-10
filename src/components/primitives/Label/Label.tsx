/**
 * Label — Etiqueta flotante con <Html> de drei
 */

import { memo } from 'react'
import { Html } from '@react-three/drei'
import type { Position3D } from '@/core/types'
import { UNITS } from '@/core/constants'

export interface LabelProps {
  text: string
  position: Position3D
  visible?: boolean
  fontSize?: number
  color?: string
  background?: string
}

export const Label = memo<LabelProps>(function Label({
  text,
  position,
  visible = true,
  fontSize = 12,
  color = 'white',
  background = 'rgba(0,0,0,0.75)',
}) {
  if (!visible) return null

  const s = UNITS.MM_TO_M

  return (
    <Html
      position={[position.x * s, position.y * s, position.z * s]}
      center
      style={{
        background,
        color,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: `${fontSize}px`,
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {text}
    </Html>
  )
})
