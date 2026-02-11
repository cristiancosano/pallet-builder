/**
 * CameraEnhancements — Ejemplo completo de las mejoras de cámara
 * Demuestra todas las capacidades: transiciones, damping, vista rápida y mini-mapa
 */

import { useState } from 'react'
import { TruckScene } from '@/components/scenes/TruckScene'
import { WarehouseScene } from '@/components/scenes/WarehouseScene'
import { PalletScene } from '@/components/scenes/PalletScene'
import { TruckFactory } from '@/core/factories/TruckFactory'
import { Room } from '@/core/entities/Room'
import { StackedPallet } from '@/core/entities/StackedPallet'
import type { CameraPreset } from '@/components/controls'
import './CameraEnhancementsDemo.css'

export function CameraEnhancementsDemo() {
  const [demoType, setDemoType] = useState<'truck' | 'warehouse' | 'pallet'>('truck')
  const [showControls, setShowControls] = useState(true)
  const [showMiniMap, setShowMiniMap] = useState(true)

  // Ejemplo de camión
  const truck = TruckFactory.createStandard()

  // Ejemplo de almacén
  const warehouse = new Room({
    name: 'Almacén Demo',
    floorPolygon: [
      { x: 0, z: 0 },
      { x: 15000, z: 0 },
      { x: 15000, z: 12000 },
      { x: 0, z: 12000 },
    ],
    ceilingHeight: 5000,
  })

  // Ejemplo de palet individual
  const singlePallet = new StackedPallet([
    /* Tu configuración de pisos aquí */
  ])

  return (
    <div className="camera-demo">
      <div className="camera-demo__sidebar">
        <h2>Demo: Camera Enhancements</h2>
        
        <div className="camera-demo__section">
          <h3>Tipo de Escena</h3>
          <div className="camera-demo__buttons">
            <button
              className={demoType === 'truck' ? 'active' : ''}
              onClick={() => setDemoType('truck')}
            >
              🚛 Camión
            </button>
            <button
              className={demoType === 'warehouse' ? 'active' : ''}
              onClick={() => setDemoType('warehouse')}
            >
              🏭 Almacén
            </button>
            <button
              className={demoType === 'pallet' ? 'active' : ''}
              onClick={() => setDemoType('pallet')}
            >
              📦 Palet Individual
            </button>
          </div>
        </div>

        <div className="camera-demo__section">
          <h3>Controles UI</h3>
          <label>
            <input
              type="checkbox"
              checked={showControls}
              onChange={(e) => setShowControls(e.target.checked)}
            />
            Mostrar controles de vista
          </label>
          <label>
            <input
              type="checkbox"
              checked={showMiniMap}
              onChange={(e) => setShowMiniMap(e.target.checked)}
            />
            Mostrar mini-mapa
          </label>
        </div>

        <div className="camera-demo__section">
          <h3>✨ Características</h3>
          <ul className="camera-demo__features">
            <li>
              <strong>Transiciones suaves</strong>
              <br />
              Animaciones ease-out al cambiar vistas
            </li>
            <li>
              <strong>Damping</strong>
              <br />
              Inercia natural en los controles
            </li>
            <li>
              <strong>5 vistas de cámara</strong>
              <br />
              Perspectiva, Isométrica, Superior, Frontal, Lateral
            </li>
            <li>
              <strong>Cámara adaptativa</strong>
              <br />
              Se ajusta al tamaño de la escena
            </li>
            <li>
              <strong>Mini-mapa 2D</strong>
              <br />
              Vista superior para orientación
            </li>
          </ul>
        </div>

        <div className="camera-demo__section">
          <h3>🎮 Controles</h3>
          <ul className="camera-demo__controls">
            <li><strong>Click + Arrastrar</strong>: Rotar</li>
            <li><strong>Rueda del ratón</strong>: Zoom</li>
            <li><strong>Click derecho + Arrastrar</strong>: Pan</li>
            <li><strong>Botones de vista</strong>: Cambio rápido</li>
          </ul>
        </div>
      </div>

      <div className="camera-demo__viewport">
        {demoType === 'truck' && (
          <TruckScene
            truck={truck}
            preset="industrial"
            showViewControls={showControls}
            showMiniMap={showMiniMap}
            showGrid={true}
          />
        )}

        {demoType === 'warehouse' && (
          <WarehouseScene
            room={warehouse}
            preset="industrial"
            showViewControls={showControls}
            showMiniMap={showMiniMap}
          />
        )}

        {demoType === 'pallet' && (
          <PalletScene
            stackedPallet={singlePallet}
            preset="industrial"
            showViewControls={showControls}
            showMiniMap={showMiniMap}
            showGrid={true}
          />
        )}
      </div>
    </div>
  )
}
