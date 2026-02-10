/**
 * PalletScene — Escena completa para un palet individual
 * Canvas + iluminación + CameraControls + StackedPallet
 */

import { memo, useMemo, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import type { StackedPallet } from '@/core/entities/StackedPallet'
import type { CameraPreset } from '@/components/controls/CameraControls'
import type { ScenePreset } from '@/core/presets'
import { CameraControlsComponent } from '@/components/controls/CameraControls'
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
  onBoxClick,
  onBoxHover,
  children,
  style,
}) {
  const s = UNITS.MM_TO_M
  const basePallet = stackedPallet.floors[0]?.pallet
  
  // Memorizar el target para evitar recreaciones
  const target = useMemo<[number, number, number]>(() => {
    const centerX = basePallet ? (basePallet.dimensions.width * s) / 2 : 0
    const centerZ = basePallet ? (basePallet.dimensions.depth * s) / 2 : 0
    return [centerX, 0.5, centerZ]
  }, [basePallet, s])
  
  const centerX = target[0]
  const centerZ = target[2]

  return (
    <Canvas
      shadows
      camera={{ position: [3, 2.5, 3], fov: 50, near: 0.01, far: 100 }}
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
      />

      {/* Suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.001, centerZ]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.9} />
      </mesh>

      {/* Grid */}
      {showGrid && (
        <gridHelper
          args={[10, 20, '#aaaaaa', '#cccccc']}
          position={[centerX, 0, centerZ]}
        />
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
  )
})
