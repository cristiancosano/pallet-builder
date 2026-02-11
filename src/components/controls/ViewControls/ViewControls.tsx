/**
 * ViewControls — Botones flotantes para cambio rápido de vista de cámara
 */

import { memo } from 'react'
import type { CameraPreset } from '../CameraControls'
import './ViewControls.css'

export interface ViewControlsProps {
  currentPreset: CameraPreset
  onPresetChange: (preset: CameraPreset) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

const PRESET_LABELS: Record<CameraPreset, { label: string; icon: string }> = {
  perspective: { label: 'Perspectiva', icon: '📐' },
  isometric: { label: 'Isométrica', icon: '🔲' },
  top: { label: 'Superior', icon: '⬇️' },
  front: { label: 'Frontal', icon: '➡️' },
  side: { label: 'Lateral', icon: '⬅️' },
}

export const ViewControls = memo<ViewControlsProps>(function ViewControls({
  currentPreset,
  onPresetChange,
  position = 'top-right',
}) {
  const presets: CameraPreset[] = ['perspective', 'isometric', 'top', 'front', 'side']

  return (
    <div className={`view-controls view-controls--${position}`}>
      <div className="view-controls__title">Vista</div>
      <div className="view-controls__buttons">
        {presets.map((preset) => {
          const { label, icon } = PRESET_LABELS[preset]
          const isActive = currentPreset === preset

          return (
            <button
              key={preset}
              className={`view-controls__button ${isActive ? 'view-controls__button--active' : ''}`}
              onClick={() => onPresetChange(preset)}
              title={label}
              aria-label={label}
            >
              <span className="view-controls__icon" role="img" aria-hidden="true">
                {icon}
              </span>
              <span className="view-controls__label">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
