/**
 * TruckEnvironment — Decorado del interior de un camión
 */

import { memo, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Truck } from '@/core/entities/Truck'
import { UNITS } from '@/core/constants'
import { TruckType } from '@/core/types'

export interface TruckEnvironmentProps {
  truck: Truck
  showGrid?: boolean
  children?: ReactNode
}

const TRUCK_COLORS: Record<TruckType, { wall: string; floor: string }> = {
  [TruckType.BOX]: { wall: '#b0b0b0', floor: '#8a7e72' },
  [TruckType.REFRIGERATED]: { wall: '#cce5ff', floor: '#e0e0e0' },
  [TruckType.FLATBED]: { wall: '#a0a0a0', floor: '#8a7e72' },
  [TruckType.TAUTLINER]: { wall: '#d4c9a8', floor: '#8a7e72' },
  [TruckType.CUSTOM]: { wall: '#b0b0b0', floor: '#8a7e72' },
}

export const TruckEnvironment = memo<TruckEnvironmentProps>(function TruckEnvironment({
  truck,
  showGrid = true,
  children,
}) {
  const s = UNITS.MM_TO_M
  const d = truck.dimensions
  const w = d.width * s
  const h = d.height * s
  const depth = d.depth * s

  const colors = TRUCK_COLORS[truck.truckType]

  const wallMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color={colors.wall}
        side={THREE.DoubleSide}
        roughness={0.5}
        metalness={0.3}
        transparent
        opacity={0.35}
      />
    ),
    [colors.wall],
  )

  return (
    <group>
      {/* Suelo */}
      <mesh position={[w / 2, 0, depth / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.9} />
      </mesh>

      {/* Pared izquierda */}
      <mesh position={[0, h / 2, depth / 2]}>
        <planeGeometry args={[depth, h]} />
        {wallMaterial}
      </mesh>

      {/* Pared derecha */}
      <mesh position={[w, h / 2, depth / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[depth, h]} />
        {wallMaterial}
      </mesh>

      {/* Pared trasera (fondo) */}
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[h, w]} />
        {wallMaterial}
      </mesh>

      {/* Techo */}
      <mesh position={[w / 2, h, depth / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, depth]} />
        {wallMaterial}
      </mesh>

      {/* Grid */}
      {showGrid && (
        <gridHelper
          args={[Math.max(w, depth), Math.round(Math.max(w, depth) * 2), '#666', '#999']}
          position={[w / 2, 0.001, depth / 2]}
        />
      )}

      {/* Iluminación */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[w / 2, h * 0.8, depth]}
        intensity={0.7}
        castShadow
      />
      <pointLight position={[w / 2, h * 0.8, depth / 2]} intensity={0.4} />

      {/* Children (palets) */}
      {children}
    </group>
  )
})
