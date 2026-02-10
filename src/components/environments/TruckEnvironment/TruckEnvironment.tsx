/**
 * TruckEnvironment — Escena de camión con forma realista
 *
 * El centro de la escena es el interior del remolque (zona de carga).
 * La superficie donde se colocan los palets es únicamente el suelo del remolque.
 * Elementos visuales adicionales (cabina, chasis, ruedas) dan forma de camión real.
 */

import { memo, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Truck } from '@/core/entities/Truck'
import { UNITS } from '@/core/constants'
import { usePreset } from '@/context/PresetContext'

export interface TruckEnvironmentProps {
  truck: Truck
  /** Mostrar/ocultar grid en el suelo del remolque (por defecto usa preset) */
  showGrid?: boolean
  children?: ReactNode
}

// ─── Componente de rueda ─────────────────────────────────────────

interface WheelProps {
  position: [number, number, number]
  radius: number
  width: number
  color: string
}

const Wheel = memo<WheelProps>(function Wheel({ position, radius, width, color }) {
  return (
    <group position={position}>
      {/* Neumático */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[radius, radius, width, 24]} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Rin */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[radius * 0.55, radius * 0.55, width + 0.005, 16]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
})

// ─── Componente principal ────────────────────────────────────────

export const TruckEnvironment = memo<TruckEnvironmentProps>(function TruckEnvironment({
  truck,
  showGrid,
  children,
}) {
  const preset = usePreset()
  const truckStyle = preset.truck
  const resolvedShowGrid = showGrid ?? truckStyle.showGrid

  const s = UNITS.MM_TO_M
  const tw = truck.dimensions.width * s   // ancho remolque
  const th = truck.dimensions.height * s  // alto remolque
  const td = truck.dimensions.depth * s   // profundidad remolque

  // ── Dimensiones derivadas ──
  const wallThickness = 0.05
  const floorThickness = 0.08
  const chassisH = 0.35               // altura del bastidor bajo el remolque
  const chassisDropY = -chassisH       // posición Y del chasis
  const cabW = tw + wallThickness * 2  // la cabina tiene el mismo ancho exterior
  const cabD = tw * 0.65              // profundidad de la cabina
  const cabH = th * 0.85              // altura de la cabina
  const cabGap = 0.15                 // separación entre cabina y remolque
  const cabZ = td + wallThickness + cabGap // posición Z de la cabina

  // Dimensiones de rueda
  const wheelRadius = 0.28
  const wheelWidth = 0.18
  const wheelY = chassisDropY - chassisH / 2 + wheelRadius * 0.3

  const solidWallMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color={truckStyle.wallColor}
        roughness={0.5}
        metalness={0.3}
      />
    ),
    [truckStyle.wallColor],
  )

  return (
    <group>
      {/* ═══════════════════════════════════════════════════════
       *   REMOLQUE (zona de carga) − centrado en el origen
       * ═══════════════════════════════════════════════════════ */}

      {/* Suelo del remolque */}
      <mesh
        position={[tw / 2, 0, td / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[tw, td]} />
        <meshStandardMaterial color={truckStyle.floorColor} roughness={0.85} />
      </mesh>

      {/* Grosor del suelo (cuerpo visible) */}
      <mesh position={[tw / 2, -floorThickness / 2, td / 2]} castShadow receiveShadow>
        <boxGeometry args={[tw + wallThickness * 2, floorThickness, td + wallThickness]} />
        <meshStandardMaterial color={truckStyle.floorColor} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Pared izquierda */}
      <mesh position={[-wallThickness / 2, th / 2, td / 2]} castShadow>
        <boxGeometry args={[wallThickness, th, td + wallThickness]} />
        {solidWallMaterial}
      </mesh>

      {/* Pared derecha */}
      <mesh position={[tw + wallThickness / 2, th / 2, td / 2]} castShadow>
        <boxGeometry args={[wallThickness, th, td + wallThickness]} />
        {solidWallMaterial}
      </mesh>

      {/* Pared trasera (fondo del remolque — lado cabina) */}
      <mesh position={[tw / 2, th / 2, td + wallThickness / 2]} castShadow>
        <boxGeometry args={[tw + wallThickness * 2, th, wallThickness]} />
        {solidWallMaterial}
      </mesh>

      {/* Techo del remolque */}
      <mesh position={[tw / 2, th, td / 2]} castShadow>
        <boxGeometry args={[tw + wallThickness * 2, wallThickness, td + wallThickness]} />
        {solidWallMaterial}
      </mesh>

      {/* Grid del suelo del remolque */}
      {resolvedShowGrid && (
        <gridHelper
          args={[
            Math.max(tw, td),
            Math.round(Math.max(tw, td) * 2),
            truckStyle.gridColor,
            truckStyle.gridSecondaryColor,
          ]}
          position={[tw / 2, 0.002, td / 2]}
        />
      )}

      {/* ═══════════════════════════════════════════════════════
       *   CHASIS / BASTIDOR
       * ═══════════════════════════════════════════════════════ */}

      {/* Largueros del chasis (dos vigas longitudinales) */}
      <mesh position={[tw * 0.25, chassisDropY, td / 2]} castShadow>
        <boxGeometry args={[0.12, chassisH, td + cabD + cabGap + 0.5]} />
        <meshStandardMaterial color={truckStyle.chassisColor} roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[tw * 0.75, chassisDropY, td / 2]} castShadow>
        <boxGeometry args={[0.12, chassisH, td + cabD + cabGap + 0.5]} />
        <meshStandardMaterial color={truckStyle.chassisColor} roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Travesaños */}
      {[0.15, 0.35, 0.55, 0.75, 0.95].map((frac) => (
        <mesh key={frac} position={[tw / 2, chassisDropY, td * frac]} castShadow>
          <boxGeometry args={[tw * 0.6, 0.06, 0.06]} />
          <meshStandardMaterial color={truckStyle.chassisColor} roughness={0.7} metalness={0.5} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════
       *   RUEDAS
       * ═══════════════════════════════════════════════════════ */}

      {/* Ejes traseros del remolque (doble eje) */}
      <Wheel position={[-wheelWidth / 2 - wallThickness, wheelY, td * 0.12]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />
      <Wheel position={[tw + wheelWidth / 2 + wallThickness, wheelY, td * 0.12]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />
      <Wheel position={[-wheelWidth / 2 - wallThickness, wheelY, td * 0.22]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />
      <Wheel position={[tw + wheelWidth / 2 + wallThickness, wheelY, td * 0.22]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />

      {/* Ruedas del eje de la cabina */}
      <Wheel position={[-wheelWidth / 2 - wallThickness, wheelY, cabZ + cabD * 0.5]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />
      <Wheel position={[tw + wheelWidth / 2 + wallThickness, wheelY, cabZ + cabD * 0.5]} radius={wheelRadius} width={wheelWidth} color={truckStyle.wheelColor} />

      {/* ═══════════════════════════════════════════════════════
       *   CABINA
       * ═══════════════════════════════════════════════════════ */}
      <group position={[tw / 2, 0, cabZ]}>
        {/* Cuerpo principal de la cabina */}
        <mesh position={[0, cabH / 2, cabD / 2]} castShadow receiveShadow>
          <boxGeometry args={[cabW, cabH, cabD]} />
          <meshStandardMaterial color={truckStyle.cabColor} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Parabrisas (frontal) */}
        <mesh
          position={[0, cabH * 0.6, cabD + 0.01]}
          castShadow
        >
          <planeGeometry args={[cabW * 0.75, cabH * 0.4]} />
          <meshStandardMaterial
            color="#88bbdd"
            transparent
            opacity={0.5}
            roughness={0.1}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ventanilla izquierda */}
        <mesh position={[-cabW / 2 - 0.01, cabH * 0.6, cabD * 0.55]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[cabD * 0.5, cabH * 0.3]} />
          <meshStandardMaterial
            color="#88bbdd"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Ventanilla derecha */}
        <mesh position={[cabW / 2 + 0.01, cabH * 0.6, cabD * 0.55]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[cabD * 0.5, cabH * 0.3]} />
          <meshStandardMaterial
            color="#88bbdd"
            transparent
            opacity={0.4}
            roughness={0.1}
            metalness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Techo de la cabina (ligeramente redondeado con box) */}
        <mesh position={[0, cabH + 0.04, cabD / 2]}>
          <boxGeometry args={[cabW * 0.95, 0.08, cabD * 0.9]} />
          <meshStandardMaterial color={truckStyle.cabColor} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Deflector de aire encima de la cabina */}
        <mesh position={[0, cabH + 0.25, cabD * 0.1]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[cabW * 0.9, 0.04, cabD * 0.5]} />
          <meshStandardMaterial color={truckStyle.cabColor} roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Faros delanteros */}
        <mesh position={[-cabW * 0.35, cabH * 0.2, cabD + 0.02]}>
          <boxGeometry args={[cabW * 0.15, 0.08, 0.02]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[cabW * 0.35, cabH * 0.2, cabD + 0.02]}>
          <boxGeometry args={[cabW * 0.15, 0.08, 0.02]} />
          <meshStandardMaterial color="#ffffcc" emissive="#ffffaa" emissiveIntensity={0.3} />
        </mesh>

        {/* Parachoques delantero */}
        <mesh position={[0, 0.06, cabD + 0.04]} castShadow>
          <boxGeometry args={[cabW * 1.02, 0.12, 0.06]} />
          <meshStandardMaterial color={truckStyle.chassisColor} roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════
       *   GUARDABARROS
       * ═══════════════════════════════════════════════════════ */}
      {/* Guardabarros traseros */}
      {[-1, 1].map(side => (
        <mesh
          key={`fender-rear-${side}`}
          position={[
            side === -1 ? -wallThickness - wheelWidth * 0.5 : tw + wallThickness + wheelWidth * 0.5,
            wheelY + wheelRadius * 0.6,
            td * 0.17,
          ]}
          castShadow
        >
          <boxGeometry args={[wheelWidth + 0.04, 0.04, wheelRadius * 2.5]} />
          <meshStandardMaterial color={truckStyle.chassisColor} roughness={0.6} metalness={0.4} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════════════════
       *   LUCES TRASERAS (puerta del remolque)
       * ═══════════════════════════════════════════════════════ */}
      <mesh position={[-wallThickness / 2 + 0.01, th * 0.3, -0.01]}>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[tw + wallThickness / 2 - 0.01, th * 0.3, -0.01]}>
        <boxGeometry args={[0.08, 0.12, 0.02]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════
       *   ILUMINACIÓN
       * ═══════════════════════════════════════════════════════ */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[tw / 2, th * 1.5, td * 0.8]}
        intensity={0.75}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[tw / 2, th * 0.7, td / 2]} intensity={0.35} />
      {/* Luz interior (dentro del remolque) */}
      <pointLight position={[tw / 2, th * 0.9, td * 0.3]} intensity={0.25} />

      {/* ═══════════════════════════════════════════════════════
       *   CONTENIDO (palets)
       * ═══════════════════════════════════════════════════════ */}
      {children}
    </group>
  )
})
