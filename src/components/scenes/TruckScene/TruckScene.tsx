/**
 * TruckScene — Escena completa de un camión con palets cargados
 */

import { memo, useMemo, useState, useCallback, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Truck } from '@/core/entities/Truck'
import type { PlacedPallet } from '@/core/entities/PlacedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent, MiniMap, CameraTracker } from '@/components/controls'
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
  /** Opacidad de las paredes (0-1). Por defecto: 0.3 */
  wallOpacity?: number
  /** Mostrar/ocultar el techo. Por defecto: false */
  showRoof?: boolean
  /** Mostrar/ocultar paredes laterales. Por defecto: true */
  showSideWalls?: boolean
  cameraPreset?: CameraPreset
  /** Mostrar mini-mapa (por defecto: false) */
  showMiniMap?: boolean
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
  wallOpacity = 0.3,
  showRoof = false,
  showSideWalls = true,
  cameraPreset = 'perspective',
  showMiniMap = false,
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const [cameraPosition, setCameraPosition] = useState<{ x: number; z: number }>({ x: 0, z: 0 })

  const handleCameraPositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
    setCameraPosition({ x: pos.x, z: pos.z })
  }, [])
  const s = UNITS.MM_TO_M
  const w = truck.dimensions.width * s
  const h = truck.dimensions.height * s
  const d = truck.dimensions.depth * s
  
  // Memorizar el target (centro de la zona de carga)
  const target = useMemo<[number, number, number]>(
    () => [w / 2, h / 2, d / 2],
    [w, h, d],
  )
  
  // Tamaño de la escena para cálculo de cámara adaptativa
  const sceneSize = useMemo(
    () => ({ width: w, height: h, depth: d }),
    [w, h, d],
  )
  
  // Calcular posición inicial de cámara basada en el tamaño del camión
  const initialCameraPosition = useMemo<[number, number, number]>(() => {
    // Vista elevada ligeramente hacia el interior para mejor visualización
    return [w * 0.8, h * 1.2, d * 0.4]
  }, [w, h, d])

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ 
          position: initialCameraPosition, 
          fov: 45, 
          near: 0.01, 
          far: 200 
        }}
        style={{ width: '100%', height: '100%', ...style }}
      >
        <PresetProvider preset={preset}>
          <CameraControlsComponent
            preset={cameraPreset}
            target={target}
            sceneSize={sceneSize}
            maxDistance={Math.max(w, h, d) * 3}
            minDistance={0.5}
          />
          <CameraTracker onPositionChange={handleCameraPositionChange} />

          <TruckEnvironment 
            truck={truck} 
            showGrid={showGrid}
            wallOpacity={wallOpacity}
            showRoof={showRoof}
            showSideWalls={showSideWalls}
          >
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

      {showMiniMap && (
        <MiniMap
          sceneWidth={w}
          sceneDepth={d}
          sceneType="truck"
          cameraPosition={cameraPosition}
          targetPosition={{ x: target[0], z: target[2] }}
          position="bottom-left"
        />
      )}
    </div>
  )
})
