/**
 * PalletScene — Escena completa para un palet individual
 * Canvas + iluminación + CameraControls + StackedPallet
 */

import { memo, useMemo, useState, useCallback, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import type { StackedPallet } from '@/core/entities/StackedPallet'
import { getStackedPalletTotalHeight } from '@/core/entities/StackedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent, MiniMap, CameraTracker } from '@/components/controls'
import { StackedPalletComponent } from '@/components/primitives/StackedPallet'
import { PresetProvider } from '@/context/PresetContext'
import { UNITS } from '@/core/constants'

export interface PalletSceneProps {
  stackedPallet: StackedPallet
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
  showGrid?: boolean
  /** Mostrar mini-mapa (por defecto: false) */
  showMiniMap?: boolean
  onBoxClick?: (id: string) => void
  onBoxHover?: (id: string | null) => void
  children?: ReactNode
  style?: React.CSSProperties
}

export const PalletScene = memo<PalletSceneProps>(function PalletScene({
  stackedPallet,
  preset,
  selectedBoxId,
  highlightedBoxId,
  selectedColor,
  highlightedColor,
  showLabels = false,
  cameraPreset = 'perspective',
  showGrid = true,
  showMiniMap = false,
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const s = UNITS.MM_TO_M
  const basePallet = stackedPallet.floors[0]?.pallet
  
  const [cameraPosition, setCameraPosition] = useState<{ x: number; z: number }>({ x: 0, z: 0 })

  const handleCameraPositionChange = useCallback((pos: { x: number; y: number; z: number }) => {
    setCameraPosition({ x: pos.x, z: pos.z })
  }, [])
  
  // Dimensiones del palet para cálculo de cámara adaptativa
  const sceneSize = useMemo(() => {
    if (!basePallet) return { width: 1.2, height: 1, depth: 0.8 }
    return {
      width: basePallet.dimensions.width * s,
      height: getStackedPalletTotalHeight(stackedPallet) * s,
      depth: basePallet.dimensions.depth * s,
    }
  }, [basePallet, stackedPallet, s])
  
  // Memorizar el target para evitar recreaciones
  const target = useMemo<[number, number, number]>(() => {
    const centerX = basePallet ? (basePallet.dimensions.width * s) / 2 : 0
    const centerZ = basePallet ? (basePallet.dimensions.depth * s) / 2 : 0
    const centerY = sceneSize.height / 2
    return [centerX, centerY, centerZ]
  }, [basePallet, s, sceneSize.height])
  
  // Posición inicial de cámara optimizada
  const initialCameraPosition = useMemo<[number, number, number]>(() => {
    const diagonal = Math.sqrt(
      sceneSize.width ** 2 + sceneSize.height ** 2 + sceneSize.depth ** 2
    )
    const distance = diagonal * 3.5
    return [
      target[0] + distance * 0.7,
      target[1] + distance * 0.6,
      target[2] + distance * 0.7,
    ]
  }, [target, sceneSize])

  // Grid rectangular personalizado del tamaño del pallet
  const gridGeometry = useMemo(() => {
    if (!showGrid || !basePallet) return null
    
    const pw = basePallet.dimensions.width * s
    const pd = basePallet.dimensions.depth * s
    const spacing = 0.2  // 200mm entre líneas (más fino para palets individuales)
    const y = 0.001
    const positions: number[] = []
    
    // Líneas verticales (eje X)
    for (let x = 0; x <= pw; x += spacing) {
      positions.push(x, y, 0, x, y, pd)
    }
    
    // Líneas horizontales (eje Z)
    for (let z = 0; z <= pd; z += spacing) {
      positions.push(0, y, z, pw, y, z)
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [showGrid, basePallet, s])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        camera={{ 
          position: initialCameraPosition, 
          fov: 45, 
          near: 0.01, 
          far: 100 
        }}
        style={{ width: '100%', height: '100%', ...style }}
      >
          <PresetProvider preset={preset}>
            {/* Iluminación */}
            <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <hemisphereLight intensity={0.3} color="#ffffff" groundColor="#444444" />

          {/* Controls */}
          <CameraControlsComponent
            preset={cameraPreset}
            target={target}
            sceneSize={sceneSize}
            minDistance={0.3}
            maxDistance={Math.max(sceneSize.width, sceneSize.height, sceneSize.depth) * 4}
          />
          <CameraTracker onPositionChange={handleCameraPositionChange} />

          {/* Suelo - ligeramente más grande que el pallet */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[target[0], -0.002, target[2]]} receiveShadow>
            <planeGeometry args={[
              basePallet ? basePallet.dimensions.width * s * 1.5 : 3,
              basePallet ? basePallet.dimensions.depth * s * 1.5 : 3
            ]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.9} />
          </mesh>

          {/* Grid personalizado */}
          {showGrid && gridGeometry && (
            <lineSegments geometry={gridGeometry}>
              <lineBasicMaterial 
                color="#aaaaaa" 
                opacity={0.5} 
                transparent 
                depthWrite={false}
              />
            </lineSegments>
          )}

          {/* Palet */}
          <StackedPalletComponent
            stackedPallet={stackedPallet}
            selectedBoxId={selectedBoxId}
            highlightedBoxId={highlightedBoxId}
            selectedColor={selectedColor}
            highlightedColor={highlightedColor}
            showLabels={showLabels}
            onBoxClick={onBoxClick}
            onBoxHover={onBoxHover}
          />

          {/* Custom children */}
          {children}
        </PresetProvider>
      </Canvas>

      {showMiniMap && basePallet && (
        <MiniMap
          sceneWidth={sceneSize.width}
          sceneDepth={sceneSize.depth}
          sceneType="truck"
          cameraPosition={cameraPosition}
          targetPosition={{ x: target[0], z: target[2] }}
          position="bottom-left"
        />
      )}
    </div>
  )
})
