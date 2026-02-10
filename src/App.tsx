/**
 * Demo App — Pallet Builder
 *
 * Showcases the three main scenes: PalletScene, TruckScene, WarehouseScene.
 * Includes a mini control panel for packing strategies and box configuration.
 */

import { useState, useCallback, useMemo } from 'react'
import {
  PalletScene,
  TruckScene,
  WarehouseScene,
  PalletFactory,
  TruckFactory,
  BoxFactory,
  usePackingStrategy,
  usePalletMetrics,
  usePhysicsValidation,
  useWarehouseValidation,
  TruckType,
  SCENE_PRESETS,
} from './lib'
import type {
  Box,
  StackedPallet,
  Truck,
  Room,
  PlacedBox,
  CameraPreset,
} from './lib'
import './index.css'

type DemoTab = 'pallet' | 'truck' | 'warehouse'

/** Helper: generate sample boxes */
function createSampleBoxes(): Box[] {
  return [
    ...Array.from({ length: 6 }, (_, i) =>
      BoxFactory.create(
        { width: 400, height: 300, depth: 600 },
        {
          id: `heavy-${i}`,
          type: `Heavy ${i + 1}`,
          weight: 25,
          color: '#4a90d9',
        },
      ),
    ),
    ...Array.from({ length: 8 }, (_, i) =>
      BoxFactory.create(
        { width: 300, height: 250, depth: 400 },
        {
          id: `medium-${i}`,
          type: `Medium ${i + 1}`,
          weight: 12,
          color: '#50b86c',
        },
      ),
    ),
    ...Array.from({ length: 4 }, (_, i) =>
      BoxFactory.fragile(
        { width: 250, height: 200, depth: 350 },
        10,
        {
          id: `fragile-${i}`,
          type: `Fragile ${i + 1}`,
          weight: 5,
          color: '#e8a838',
        },
      ),
    ),
  ]
}

function App() {
  const [activeTab, setActiveTab] = useState<DemoTab>('pallet')
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective')
  const [showLabels, setShowLabels] = useState(false)
  const [scenePreset, setScenePreset] = useState<string>('industrial')
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null)
  const [strategyName, setStrategyName] = useState('column')

  const boxes = useMemo(createSampleBoxes, [])
  const pallet = useMemo(() => PalletFactory.euro(), [])

  // Packing
  const { availableStrategies, pack } = usePackingStrategy(strategyName)

  const packingResult = useMemo(
    () => pack(boxes, pallet),
    [pack, boxes, pallet],
  )

  const placedBoxes: PlacedBox[] = packingResult.placements

  const stackedPallet: StackedPallet = useMemo(
    () => ({
      id: 'demo-stacked',
      floors: [
        {
          level: 0,
          pallet,
          boxes: placedBoxes,
        },
      ],
      metadata: {},
    }),
    [pallet, placedBoxes],
  )

  // Truck scene data
  const truck: Truck = useMemo(() => {
    const base = TruckFactory.fromPreset(TruckType.BOX)
    return {
      ...base,
      pallets: [
        {
          id: 'pp-1',
          stackedPallet,
          position: { x: 100, y: 0, z: 100 },
          yRotation: 0 as const,
        },
        {
          id: 'pp-2',
          stackedPallet,
          position: { x: 100, y: 0, z: 1400 },
          yRotation: 0 as const,
        },
      ],
    }
  }, [stackedPallet])

  // Warehouse scene data
  const room: Room = useMemo(
    () => ({
      id: 'room-1',
      name: 'Zona de carga',
      floorPolygon: [
        { x: 0, z: 0 },
        { x: 6000, z: 0 },
        { x: 6000, z: 4000 },
        { x: 0, z: 4000 },
      ],
      ceilingHeight: 3000,
      pallets: [
        {
          id: 'wp-1',
          stackedPallet,
          position: { x: 500, y: 0, z: 500 },
          yRotation: 0 as const,
        },
        {
          id: 'wp-2',
          stackedPallet,
          position: { x: 2000, y: 0, z: 1201 },
          yRotation: 90 as const,
        },
      ],
      metadata: {},
    }),
    [stackedPallet],
  )

  // Metrics & Validation
  const metrics = usePalletMetrics(stackedPallet)
  const palletValidation = usePhysicsValidation(placedBoxes, pallet)
  const warehouseValidation = useWarehouseValidation(room)

  // Usar la validación apropiada según la tab activa
  const validationResult = activeTab === 'warehouse' ? warehouseValidation : palletValidation

  const handleBoxClick = useCallback((id: string) => {
    setSelectedBoxId(prev => (prev === id ? null : id))
  }, [])

  const handleBoxHover = useCallback((id: string | null) => {
    setHoveredBoxId(id)
  }, [])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Pallet Builder</h1>
        <nav className="tabs">
          {(['pallet', 'truck', 'warehouse'] as DemoTab[]).map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      <div className="main">
        {/* 3D Viewport */}
        <div className="viewport">
          {activeTab === 'pallet' && (
            <PalletScene
              stackedPallet={stackedPallet}
              preset={scenePreset}
              selectedBoxId={selectedBoxId}
              highlightedBoxId={hoveredBoxId}
              showLabels={showLabels}
              cameraPreset={cameraPreset}
              onBoxClick={handleBoxClick}
              onBoxHover={handleBoxHover}
            />
          )}
          {activeTab === 'truck' && (
            <TruckScene
              truck={truck}
              preset={scenePreset}
              selectedBoxId={selectedBoxId}
              highlightedBoxId={hoveredBoxId}
              showLabels={showLabels}
              cameraPreset={cameraPreset}
              onBoxClick={handleBoxClick}
              onBoxHover={handleBoxHover}
            />
          )}
          {activeTab === 'warehouse' && (
            <WarehouseScene
              room={room}
              preset={scenePreset}
              selectedBoxId={selectedBoxId}
              highlightedBoxId={hoveredBoxId}
              showLabels={showLabels}
              cameraPreset={cameraPreset}
              onBoxClick={handleBoxClick}
              onBoxHover={handleBoxHover}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          {/* Camera */}
          <section className="panel">
            <h3>Cámara</h3>
            <div className="btn-group">
              {(['perspective', 'top', 'front', 'side'] as CameraPreset[]).map(p => (
                <button
                  key={p}
                  className={cameraPreset === p ? 'active' : ''}
                  onClick={() => setCameraPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Scene Preset */}
          <section className="panel">
            <h3>Preset visual</h3>
            <select
              value={scenePreset}
              onChange={e => setScenePreset(e.target.value)}
            >
              {Object.entries(SCENE_PRESETS).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>
          </section>

          {/* Strategy */}
          <section className="panel">
            <h3>Estrategia de empaquetado</h3>
            <select
              value={strategyName}
              onChange={e => setStrategyName(e.target.value)}
            >
              {availableStrategies.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </section>

          {/* Options */}
          <section className="panel">
            <h3>Opciones</h3>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={e => setShowLabels(e.target.checked)}
              />
              Mostrar etiquetas
            </label>
          </section>

          {/* Metrics */}
          <section className="panel">
            <h3>Métricas</h3>
            <dl className="metrics">
              <dt>Cajas colocadas</dt>
              <dd>
                {placedBoxes.length} / {boxes.length}
              </dd>
              <dt>Vol. utilizado</dt>
              <dd>{(metrics.volumeUtilization * 100).toFixed(1)}%</dd>
              <dt>Peso total</dt>
              <dd>{metrics.totalWeight.toFixed(1)} kg</dd>
              <dt>Estabilidad</dt>
              <dd>{metrics.stabilityScore.toFixed(0)}%</dd>
            </dl>
          </section>

          {/* Validation */}
          <section className="panel">
            <h3>Validación</h3>
            <div className={`validation ${validationResult.isValid ? 'valid' : 'invalid'}`}>
              {validationResult.isValid ? '✓ Sin errores' : `✗ ${validationResult.violations.length} problemas`}
            </div>
            {validationResult.violations.length > 0 && (
              <ul className="violations">
                {validationResult.violations.slice(0, 5).map((v, i) => (
                  <li key={i} className={v.severity}>
                    <strong>{v.severity}</strong>: {v.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Selection info */}
          {selectedBoxId && (
            <section className="panel">
              <h3>Caja seleccionada</h3>
              <p className="selected-id">{selectedBoxId}</p>
              <button onClick={() => setSelectedBoxId(null)}>Deseleccionar</button>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}

export default App
