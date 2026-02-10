/**
 * StackedPallet — Renderiza un palet apilado completo
 * (base + pisos + separadores + cajas)
 */

import { memo, useMemo } from 'react'
import type { StackedPallet } from '@/core/entities/StackedPallet'
import type { Position3D } from '@/core/types'
import { UNITS } from '@/core/constants'
import { PalletComponent } from '../Pallet'
import { BoxComponent } from '../Box'
import { SeparatorComponent } from '../Separator'

export interface StackedPalletComponentProps {
  stackedPallet: StackedPallet
  position?: Position3D
  /** Rotación Y en grados (0, 90, 180, 270) */
  yRotation?: 0 | 90 | 180 | 270
  /** ID del palet contenedor. Si se proporciona, cualifica los IDs de las cajas
   *  como "palletId:boxId" para evitar selecciones cruzadas cuando varios pallets
   *  comparten el mismo StackedPallet. */
  palletId?: string
  selectedBoxId?: string | null
  highlightedBoxId?: string | null
  showLabels?: boolean
  onBoxClick?: (id: string) => void
  onBoxHover?: (id: string | null) => void
}

export const StackedPalletComponent = memo<StackedPalletComponentProps>(
  function StackedPalletComponent({
    stackedPallet,
    position = { x: 0, y: 0, z: 0 },
    yRotation = 0,
    palletId,
    selectedBoxId,
    highlightedBoxId,
    showLabels = false,
    onBoxClick,
    onBoxHover,
  }) {
    // Helper: cualifica un boxId con el palletId si existe
    const scopeId = (boxId: string) => palletId ? `${palletId}:${boxId}` : boxId
    const matchesId = (boxId: string, targetId: string | null | undefined) =>
      targetId != null && targetId === scopeId(boxId)
    const s = UNITS.MM_TO_M
    const rotationY = useMemo(() => (yRotation * Math.PI) / 180, [yRotation])

    // Calcular las alturas acumuladas de cada piso
    const floorOffsets = useMemo(() => {
      const offsets: number[] = []
      let currentY = 0
      for (const floor of stackedPallet.floors) {
        offsets.push(currentY)
        currentY += floor.pallet.dimensions.height
        // Altura de las cajas: máximo top
        const maxBoxTop = floor.boxes.reduce(
          (max, pb) => Math.max(max, pb.position.y + pb.box.dimensions.height),
          0,
        )
        currentY += maxBoxTop
        if (floor.separatorAbove) {
          currentY += floor.separatorAbove.dimensions.height
        }
      }
      return offsets
    }, [stackedPallet])

    return (
      <group
        position={[position.x * s, position.y * s, position.z * s]}
        rotation={[0, rotationY, 0]}
      >
        {stackedPallet.floors.map((floor, idx) => {
          const floorY = floorOffsets[idx]
          const palletTopY = floorY + floor.pallet.dimensions.height

          return (
            <group key={`floor-${idx}`}>
              {/* Palet base de este piso */}
              <PalletComponent
                pallet={floor.pallet}
                position={{ x: 0, y: floorY, z: 0 }}
              />

              {/* Cajas en posición relativa al top del palet */}
              {floor.boxes.map(pb => (
                <BoxComponent
                  key={pb.id}
                  placedBox={{
                    ...pb,
                    id: scopeId(pb.id),
                    position: {
                      x: pb.position.x,
                      y: pb.position.y + palletTopY,
                      z: pb.position.z,
                    },
                  }}
                  selected={matchesId(pb.id, selectedBoxId)}
                  highlighted={matchesId(pb.id, highlightedBoxId)}
                  showLabel={showLabels}
                  onClick={onBoxClick}
                  onHover={onBoxHover}
                />
              ))}

              {/* Separador encima (si hay) */}
              {floor.separatorAbove && (
                <SeparatorComponent
                  separator={floor.separatorAbove}
                  position={{
                    x: 0,
                    y:
                      palletTopY +
                      floor.boxes.reduce(
                        (max, pb) => Math.max(max, pb.position.y + pb.box.dimensions.height),
                        0,
                      ),
                    z: 0,
                  }}
                />
              )}
            </group>
          )
        })}
      </group>
    )
  },
)
