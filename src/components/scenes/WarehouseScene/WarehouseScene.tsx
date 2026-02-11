/**
 * WarehouseScene — Escena completa de un almacén con estancias y palets
 */

import { memo, useMemo, useState, useCallback, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { Room } from '@/core/entities/Room'
import type { PlacedPallet } from '@/core/entities/PlacedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent, MiniMap, CameraTracker } from '@/components/controls'
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
  /** Mostrar mini-mapa (por defecto: false) */
  showMiniMap?: boolean
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
  showMiniMap = false,
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const s = UNITS.MM_TO_M
  
  const [cameraPosition, setCameraPosition] = useState<{ x: number; z: number }>({ x: 0, z: 0 })

  const handleCameraPositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
    setCameraPosition({ x: pos.x, z: pos.z })
  }, [])
  
  // Calcular bounding box del almacén
  const { target, sceneSize, initialCameraPosition } = useMemo(() => {
    const pts = room.floorPolygon
    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity
    
    for (const p of pts) {
      minX = Math.min(minX, p.x * s)
      maxX = Math.max(maxX, p.x * s)
      minZ = Math.min(minZ, p.z * s)
      maxZ = Math.max(maxZ, p.z * s)
    }
    
    const width = maxX - minX
    const depth = maxZ - minZ
    const height = room.ceilingHeight * s
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2
    
    // Target en el centro del almacén, a media altura
    const targetPos: [number, number, number] = [cx, height / 2, cz]
    
    // Tamaño de la escena
    const size = { width, height, depth }
    
    // Posición inicial de cámara (vista isométrica)
    const diagonal = Math.sqrt(width ** 2 + height ** 2 + depth ** 2)
    const distance = diagonal * 0.8
    const initialPos: [number, number, number] = [
      cx + distance * 0.6,
      height + distance * 0.5,
      cz + distance * 0.6,
    ]
    
    return {
      target: targetPos,
      sceneSize: size,
      initialCameraPosition: initialPos,
    }
  }, [room.floorPolygon, room.ceilingHeight, s])

  // Convertir polígono para MiniMap (metros a escala del mundo)
  const floorPolygonForMap = useMemo(() => {
    return room.floorPolygon.map(p => ({ x: p.x * s, z: p.z * s }))
  }, [room.floorPolygon, s])

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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ 
          position: initialCameraPosition, 
          fov: 45, 
          near: 0.01, 
          far: 300 
        }}
        style={{ width: '100%', height: '100%', ...style }}
      >
        <PresetProvider preset={preset}>
          <CameraControlsComponent
            preset={cameraPreset}
            target={target}
            sceneSize={sceneSize}
            maxDistance={Math.max(sceneSize.width, sceneSize.height, sceneSize.depth) * 4}
            minDistance={0.5}
          />
          <CameraTracker onPositionChange={handleCameraPositionChange} />

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

      {showMiniMap && (
        <MiniMap
          sceneWidth={sceneSize.width}
          sceneDepth={sceneSize.depth}
          sceneType="warehouse"
          floorPolygon={floorPolygonForMap}
          cameraPosition={cameraPosition}
          targetPosition={{ x: target[0], z: target[2] }}
          position="bottom-left"
        />
      )}
    </div>
  )
})
