/**
 * WarehouseScene — Escena completa de un almacén con estancias y palets
 */

import { memo, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Room } from '@/core/entities/Room'
import type { PlacedPallet } from '@/core/entities/PlacedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent } from '@/components/controls/CameraControls'
import { WarehouseEnvironment } from '@/components/environments/WarehouseEnvironment'
import { StackedPalletComponent } from '@/components/primitives/StackedPallet'
import { validatePalletInRoom } from '@/core/validation/polygon'
import { PresetProvider } from '@/context/PresetContext'
import { UNITS } from '@/core/constants'

export interface WarehouseSceneProps {
  room: Room
  /** ID de preset ('unstyled' | 'industrial') o un ScenePreset custom */
  preset?: string | ScenePreset
  selectedBoxId?: string | null
  highlightedBoxId?: string | null
  /** Color del borde de selección (override del preset) */
  selectedColor?: string
  /** Color del borde de highlight/hover (override del preset) */
  highlightedColor?: string
  showLabels?: boolean
  cameraPreset?: CameraPreset
  onBoxClick?: (id: string) => void
  onBoxHover?: (id: string | null) => void
  children?: ReactNode
  style?: React.CSSProperties
}

export const WarehouseScene = memo<WarehouseSceneProps>(function WarehouseScene({
  room,
  preset,
  selectedBoxId,
  highlightedBoxId,
  selectedColor,
  highlightedColor,
  showLabels = false,
  cameraPreset = 'perspective',
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const s = UNITS.MM_TO_M
  
  // Memorizar el target calculado desde el polígono
  const target = useMemo<[number, number, number]>(() => {
    const cx = room.floorPolygon.reduce((sum, p) => sum + p.x, 0) / room.floorPolygon.length * s
    const cz = room.floorPolygon.reduce((sum, p) => sum + p.z, 0) / room.floorPolygon.length * s
    return [cx, 0.5, cz]
  }, [room.floorPolygon, s])
  
  const cx = target[0]
  const cz = target[2]

  // Filtrar palets válidos - no renderizar los que estén fuera de la estancia
  const validPallets = useMemo<PlacedPallet[]>(() => {
    return room.pallets.filter(pp => {
      const validation = validatePalletInRoom(pp, room)
      if (!validation.isValid) {
        console.error(
          `[WarehouseScene] Palet "${pp.id}" fuera de los límites de la estancia "${room.name}".`,
          'Violaciones:',
          validation.violations,
        )
        return false
      }
      return true
    })
  }, [room])

  return (
    <Canvas
      shadows
      camera={{ position: [cx + 5, 4, cz + 5], fov: 50, near: 0.01, far: 100 }}
      style={{ width: '100%', height: '100%', ...style }}
    >
      <PresetProvider preset={preset}>
      <CameraControlsComponent
        preset={cameraPreset}
        target={target}
        maxDistance={40}
      />

      <WarehouseEnvironment room={room}>
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
      </WarehouseEnvironment>
      </PresetProvider>
    </Canvas>
  )
})
