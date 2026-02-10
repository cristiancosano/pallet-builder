/**
 * WarehouseEnvironment — Decorado de escena almacén
 * Suelo, paredes (según polígono de Room), techo, grid, iluminación
 */

import { memo, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { UNITS } from '@/core/constants'
import type { Room } from '@/core/entities/Room'

export interface WarehouseEnvironmentProps {
  room: Room
  floorColor?: string
  wallColor?: string
  showGrid?: boolean
  children?: ReactNode
}

export const WarehouseEnvironment = memo<WarehouseEnvironmentProps>(
  function WarehouseEnvironment({
    room,
    floorColor = '#8a8a8a',
    wallColor = '#d0d0d0',
    showGrid = true,
    children,
  }) {
    const s = UNITS.MM_TO_M
    const ceilingH = room.ceilingHeight * s

    // Calcular bounding box del polígono para el suelo y grid
    const { shape, minX, maxX, minZ, maxZ } = useMemo(() => {
      const pts = room.floorPolygon
      let mnX = Infinity, mxX = -Infinity, mnZ = Infinity, mxZ = -Infinity
      for (const p of pts) {
        mnX = Math.min(mnX, p.x * s)
        mxX = Math.max(mxX, p.x * s)
        mnZ = Math.min(mnZ, p.z * s)
        mxZ = Math.max(mxZ, p.z * s)
      }

      const sh = new THREE.Shape()
      sh.moveTo(pts[0].x * s, pts[0].z * s)
      for (let i = 1; i < pts.length; i++) {
        sh.lineTo(pts[i].x * s, pts[i].z * s)
      }
      sh.closePath()

      return { shape: sh, minX: mnX, maxX: mxX, minZ: mnZ, maxZ: mxZ }
    }, [room.floorPolygon, s])

    // Geometría de paredes: extruir el polígono del suelo
    const wallGeometry = useMemo(() => {
      const pts = room.floorPolygon
      const positions: number[] = []
      const indices: number[] = []

      for (let i = 0; i < pts.length; i++) {
        const curr = pts[i]
        const next = pts[(i + 1) % pts.length]

        const baseIdx = i * 4
        // Quad: 4 vértices por segmento de pared
        positions.push(
          curr.x * s, 0, curr.z * s,
          next.x * s, 0, next.z * s,
          next.x * s, ceilingH, next.z * s,
          curr.x * s, ceilingH, curr.z * s,
        )
        indices.push(
          baseIdx, baseIdx + 1, baseIdx + 2,
          baseIdx, baseIdx + 2, baseIdx + 3,
        )
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setIndex(indices)
      geo.computeVertexNormals()
      return geo
    }, [room.floorPolygon, ceilingH, s])

    const sizeX = maxX - minX
    const sizeZ = maxZ - minZ
    const centerX = (minX + maxX) / 2
    const centerZ = (minZ + maxZ) / 2

    return (
      <group>
        {/* Suelo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} roughness={0.8} />
        </mesh>

        {/* Paredes */}
        <mesh geometry={wallGeometry} receiveShadow>
          <meshStandardMaterial
            color={wallColor}
            side={THREE.DoubleSide}
            roughness={0.7}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Grid */}
        {showGrid && (
          <gridHelper
            args={[Math.max(sizeX, sizeZ), Math.round(Math.max(sizeX, sizeZ)), '#666666', '#999999']}
            position={[centerX, 0.001, centerZ]}
          />
        )}

        {/* Iluminación almacén */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[centerX + sizeX, ceilingH * 0.8, centerZ + sizeZ]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight
          position={[centerX, ceilingH * 0.9, centerZ]}
          intensity={0.5}
          distance={Math.max(sizeX, sizeZ) * 2}
        />

        {/* Children (palets, etc.) */}
        {children}
      </group>
    )
  },
)
