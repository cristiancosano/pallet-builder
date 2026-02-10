/**
 * TruckScene — Escena completa de un camión con palets cargados
 */

import { memo, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Truck } from '@/core/entities/Truck'
import type { PlacedPallet } from '@/core/entities/PlacedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent } from '@/components/controls/CameraControls'
import { TruckEnvironment } from '@/components/environments/TruckEnvironment'
import { StackedPalletComponent } from '@/components/primitives/StackedPallet'
import { validatePalletInTruck } from '@/core/validation/bounds'
import { PresetProvider } from '@/context/PresetContext'
import { UNITS } from '@/core/constants'

export interface TruckSceneProps {
  truck: Truck
  /** ID de preset ('unstyled' | 'industrial') o un ScenePreset custom */
  preset?: string | ScenePreset
  selectedBoxId?: string | null
  highlightedBoxId?: string | null
  /** Color del borde de selección (override del preset) */
  selectedColor?: string
  /** Color del borde de highlight/hover (override del preset) */
  highlightedColor?: string
  showLabels?: boolean
  /** Mostrar/ocultar el grid del suelo del remolque */
  showGrid?: boolean
  cameraPreset?: CameraPreset
  onBoxClick?: (id: string) => void
  onBoxHover?: (id: string | null) => void
  children?: ReactNode
  style?: React.CSSProperties
}

export const TruckScene = memo<TruckSceneProps>(function TruckScene({
  truck,
  preset,
  selectedBoxId,
  highlightedBoxId,
  selectedColor,
  highlightedColor,
  showLabels = false,
  showGrid,
  cameraPreset = 'perspective',
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const s = UNITS.MM_TO_M
  const w = truck.dimensions.width * s
  const d = truck.dimensions.depth * s
  
  // Memorizar el target
  const target = useMemo<[number, number, number]>(
    () => [w / 2, 0.5, d / 2],
    [w, d],
  )

  // Filtrar palets válidos - no renderizar los que estén fuera del camión
  const validPallets = useMemo<PlacedPallet[]>(() => {
    return truck.pallets.filter(pp => {
      const validation = validatePalletInTruck(pp, truck)
      if (!validation.isValid) {
        console.error(
          `[TruckScene] Palet "${pp.id}" fuera de los límites del camión.`,
          'Violaciones:',
          validation.violations,
        )
        return false
      }
      return true
    })
  }, [truck])

  return (
    <Canvas
      shadows
      camera={{ position: [w * 2, w * 1.5, d * 0.6], fov: 50, near: 0.01, far: 100 }}
      style={{ width: '100%', height: '100%', ...style }}
    >
      <PresetProvider preset={preset}>
      <CameraControlsComponent
        preset={cameraPreset}
        target={target}
        maxDistance={30}
      />

      <TruckEnvironment truck={truck} showGrid={showGrid}>
        {validPallets.map(pp => (
          <StackedPalletComponent
            key={pp.id}
            stackedPallet={pp.stackedPallet}
            position={pp.position}
            yRotation={pp.yRotation}
            palletId={pp.id}
            selectedBoxId={selectedBoxId}
            highlightedBoxId={highlightedBoxId}
            selectedColor={selectedColor}
            highlightedColor={highlightedColor}
            showLabels={showLabels}
            onBoxClick={onBoxClick}
            onBoxHover={onBoxHover}
          />
        ))}
        {children}
      </TruckEnvironment>
      </PresetProvider>
    </Canvas>
  )
})
