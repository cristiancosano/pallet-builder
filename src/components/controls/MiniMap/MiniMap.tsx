/**
 * MiniMap — Mini-mapa 2D con vista superior para orientación espacial
 */

import { memo, useMemo } from 'react'
import './MiniMap.css'

export interface MiniMapProps {
  /** Ancho de la escena en metros */
  sceneWidth: number
  /** Profundidad de la escena en metros */
  sceneDepth: number
  /** Tipo de escena: 'truck' | 'warehouse' */
  sceneType: 'truck' | 'warehouse'
  /** Polígono del suelo (solo para warehouse) */
  floorPolygon?: Array<{ x: number; z: number }>
  /** Posición de la cámara actual en la escena */
  cameraPosition?: { x: number; z: number }
  /** Posición del objetivo/target de la cámara */
  targetPosition?: { x: number; z: number }
  /** Posición: 'bottom-left' | 'bottom-right' */
  position?: 'bottom-left' | 'bottom-right'
}

export const MiniMap = memo<MiniMapProps>(function MiniMap({
  sceneWidth,
  sceneDepth,
  sceneType,
  floorPolygon,
  cameraPosition,
  targetPosition,
  position = 'bottom-left',
}) {
  const mapSize = 150 // tamaño del minimap en px
  const padding = 10

  // Calcular escala para que el contenido quepa en el minimap
  const scale = useMemo(() => {
    const maxDimension = Math.max(sceneWidth, sceneDepth)
    return (mapSize - padding * 2) / maxDimension
  }, [sceneWidth, sceneDepth])

  // Convertir coordenadas de mundo a coordenadas del minimap
  const worldToMap = (x: number, z: number): { x: number; y: number } => {
    return {
      x: padding + x * scale,
      y: padding + z * scale,
    }
  }

  // Path del polígono para warehouse
  const polygonPath = useMemo(() => {
    if (sceneType !== 'warehouse' || !floorPolygon || floorPolygon.length === 0) {
      return ''
    }

    const points = floorPolygon.map((p) => {
      const mapped = worldToMap(p.x, p.z)
      return `${mapped.x},${mapped.y}`
    })

    return `M ${points.join(' L ')} Z`
  }, [sceneType, floorPolygon, scale])

  // Rectángulo para truck
  const truckRect = useMemo(() => {
    if (sceneType !== 'truck') return null
    const topLeft = worldToMap(0, 0)
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: sceneWidth * scale,
      height: sceneDepth * scale,
    }
  }, [sceneType, sceneWidth, sceneDepth, scale])

  // Posiciones de cámara y target en minimap
  const cameraMapPos = cameraPosition ? worldToMap(cameraPosition.x, cameraPosition.z) : null
  const targetMapPos = targetPosition ? worldToMap(targetPosition.x, targetPosition.z) : null

  return (
    <div className={`minimap minimap--${position}`}>
      <div className="minimap__title">Mapa</div>
      <svg
        className="minimap__canvas"
        width={mapSize}
        height={mapSize}
        viewBox={`0 0 ${mapSize} ${mapSize}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo */}
        <rect width={mapSize} height={mapSize} fill="#1a1a2e" />

        {/* Escena: Warehouse (polígono) o Truck (rectángulo) */}
        {sceneType === 'warehouse' && polygonPath && (
          <path d={polygonPath} fill="rgba(96, 165, 250, 0.15)" stroke="#60a5fa" strokeWidth="2" />
        )}

        {sceneType === 'truck' && truckRect && (
          <rect
            x={truckRect.x}
            y={truckRect.y}
            width={truckRect.width}
            height={truckRect.height}
            fill="rgba(96, 165, 250, 0.15)"
            stroke="#60a5fa"
            strokeWidth="2"
          />
        )}

        {/* Grid */}
        <defs>
          <pattern
            id="minimap-grid"
            width={scale}
            height={scale}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${scale} 0 L 0 0 0 ${scale}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        {sceneType === 'truck' && truckRect && (
          <rect
            x={truckRect.x}
            y={truckRect.y}
            width={truckRect.width}
            height={truckRect.height}
            fill="url(#minimap-grid)"
          />
        )}

        {/* Target (punto de enfoque) */}
        {targetMapPos && (
          <g>
            <circle cx={targetMapPos.x} cy={targetMapPos.y} r="3" fill="#f87171" opacity="0.6" />
            <circle cx={targetMapPos.x} cy={targetMapPos.y} r="5" fill="none" stroke="#f87171" strokeWidth="1.5" />
          </g>
        )}

        {/* Cámara */}
        {cameraMapPos && (
          <g>
            <circle cx={cameraMapPos.x} cy={cameraMapPos.y} r="4" fill="#60a5fa" />
            {/* Línea desde cámara a target */}
            {targetMapPos && (
              <line
                x1={cameraMapPos.x}
                y1={cameraMapPos.y}
                x2={targetMapPos.x}
                y2={targetMapPos.y}
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.6"
              />
            )}
          </g>
        )}
      </svg>

      {/* Leyenda */}
      <div className="minimap__legend">
        <div className="minimap__legend-item">
          <span className="minimap__legend-dot minimap__legend-dot--camera"></span>
          <span className="minimap__legend-text">Cámara</span>
        </div>
        <div className="minimap__legend-item">
          <span className="minimap__legend-dot minimap__legend-dot--target"></span>
          <span className="minimap__legend-text">Objetivo</span>
        </div>
      </div>
    </div>
  )
})
