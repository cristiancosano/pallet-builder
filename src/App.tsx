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
  SeparatorMaterial,
} from './lib'
import type {
  Box,
  StackedPallet,
  Truck,
  Room,
  PlacedBox,
  CameraPreset,
  Separator,
  PalletFloor,
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

/** Helper: create boxes for a specific floor */
function createFloorBoxes(floorIndex: number, boxType: 'heavy' | 'medium' | 'mixed'): Box[] {
  const prefix = `f${floorIndex}`
  
  if (boxType === 'heavy') {
    return Array.from({ length: 5 }, (_, i) =>
      BoxFactory.create(
        { width: 400, height: 300, depth: 600 },
        {
          id: `${prefix}-heavy-${i}`,
          type: `Heavy ${i + 1}`,
          weight: 25,
          color: '#4a90d9',
        },
      ),
    )
  }
  
  if (boxType === 'medium') {
    return Array.from({ length: 7 }, (_, i) =>
      BoxFactory.create(
        { width: 300, height: 250, depth: 400 },
        {
          id: `${prefix}-medium-${i}`,
          type: `Medium ${i + 1}`,
          weight: 12,
          color: '#50b86c',
        },
      ),
    )
  }
  
  // mixed
  return [
    ...Array.from({ length: 3 }, (_, i) =>
      BoxFactory.create(
        { width: 350, height: 280, depth: 450 },
        {
          id: `${prefix}-mix-${i}`,
          type: `Box ${i + 1}`,
          weight: 15,
          color: '#9c6fd9',
        },
      ),
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      BoxFactory.fragile(
        { width: 250, height: 200, depth: 350 },
        10,
        {
          id: `${prefix}-fragile-${i}`,
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

  // Packing strategies
  const { availableStrategies, pack } = usePackingStrategy(strategyName)
  const columnPack = usePackingStrategy('column').pack
  const typeGroupPack = usePackingStrategy('type-group').pack

  // ═══════════════════════════════════════════════════════════════
  //   PALLET CONFIGURATIONS (diferentes pisos y combinaciones)
  // ═══════════════════════════════════════════════════════════════

  // Palet 1: Configuración simple con estrategia actual
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

  // Palet 2: Multi-piso apilado (3 pisos con separadores)
  const multiFloorPallet: StackedPallet = useMemo(() => {
    const floor0Boxes = createFloorBoxes(0, 'heavy')
    const floor1Boxes = createFloorBoxes(1, 'medium')
    const floor2Boxes = createFloorBoxes(2, 'mixed')

    const result0 = columnPack(floor0Boxes, pallet)
    const result1 = columnPack(floor1Boxes, pallet)
    const result2 = columnPack(floor2Boxes, pallet)

    const separator: Separator = {
      id: 'sep-cardboard',
      dimensions: { width: 1200, height: 5, depth: 800 },
      material: SeparatorMaterial.CARDBOARD,
      weight: 1,
      metadata: {},
    }

    const floors: PalletFloor[] = [
      {
        level: 0,
        pallet,
        boxes: result0.placements,
        separatorAbove: separator,
      },
      {
        level: 1,
        pallet,
        boxes: result1.placements,
        separatorAbove: separator,
      },
      {
        level: 2,
        pallet,
        boxes: result2.placements,
      },
    ]

    return {
      id: 'multi-floor-3',
      floors,
      metadata: { description: '3 pisos con separadores' },
    }
  }, [pallet, columnPack])

  // Palet 3: Doble piso con cajas pesadas
  const doubleHeavyPallet: StackedPallet = useMemo(() => {
    const floor0 = createFloorBoxes(10, 'heavy')
    const floor1 = createFloorBoxes(11, 'heavy')

    const result0 = typeGroupPack(floor0, pallet)
    const result1 = typeGroupPack(floor1, pallet)

    const woodSeparator: Separator = {
      id: 'sep-wood',
      dimensions: { width: 1200, height: 8, depth: 800 },
      material: SeparatorMaterial.WOOD,
      weight: 2.5,
      metadata: {},
    }

    return {
      id: 'double-heavy',
      floors: [
        {
          level: 0,
          pallet,
          boxes: result0.placements,
          separatorAbove: woodSeparator,
        },
        {
          level: 1,
          pallet,
          boxes: result1.placements,
        },
      ],
      metadata: { description: 'Doble piso pesado' },
    }
  }, [pallet, typeGroupPack])

  // Palet 4: Cajas mixtas en un solo piso
  const mixedPallet: StackedPallet = useMemo(() => {
    const mixedBoxes = createFloorBoxes(20, 'mixed')
    const result = pack(mixedBoxes, pallet)

    return {
      id: 'mixed-single',
      floors: [
        {
          level: 0,
          pallet,
          boxes: result.placements,
        },
      ],
      metadata: { description: 'Cajas mixtas' },
    }
  }, [pallet, pack])

  // Palet 5: Solo cajas medianas densamente empaquetadas
  const denseMediumPallet: StackedPallet = useMemo(() => {
    const mediumBoxes = createFloorBoxes(30, 'medium')
    const result = columnPack(mediumBoxes, pallet)

    return {
      id: 'dense-medium',
      floors: [
        {
          level: 0,
          pallet,
          boxes: result.placements,
        },
      ],
      metadata: { description: 'Cajas medianas' },
    }
  }, [pallet, columnPack])

  // Truck scene data — combinación de diferentes palets
  const truck: Truck = useMemo(() => {
    const base = TruckFactory.fromPreset(TruckType.BOX)
    return {
      ...base,
      pallets: [
        // Fila frontal
        {
          id: 'truck-pp-1',
          stackedPallet: multiFloorPallet,
          position: { x: 100, y: 0, z: 100 },
          yRotation: 0 as const,
        },
        {
          id: 'truck-pp-2',
          stackedPallet: doubleHeavyPallet,
          position: { x: 1300, y: 0, z: 100 },
          yRotation: 0 as const,
        },
        // Fila media
        {
          id: 'truck-pp-3',
          stackedPallet: stackedPallet,
          position: { x: 100, y: 0, z: 1100 },
          yRotation: 0 as const,
        },
        {
          id: 'truck-pp-4',
          stackedPallet: mixedPallet,
          position: { x: 1300, y: 0, z: 1100 },
          yRotation: 0 as const,
        },
        // Fila trasera
        {
          id: 'truck-pp-5',
          stackedPallet: denseMediumPallet,
          position: { x: 100, y: 0, z: 2100 },
          yRotation: 0 as const,
        },
        {
          id: 'truck-pp-6',
          stackedPallet: multiFloorPallet,
          position: { x: 1300, y: 0, z: 2100 },
          yRotation: 0 as const,
        },
        // Fila más al fondo
        {
          id: 'truck-pp-7',
          stackedPallet: doubleHeavyPallet,
          position: { x: 100, y: 0, z: 3100 },
          yRotation: 0 as const,
        },
        {
          id: 'truck-pp-8',
          stackedPallet: stackedPallet,
          position: { x: 1300, y: 0, z: 3100 },
          yRotation: 0 as const,
        },
      ],
    }
  }, [stackedPallet, multiFloorPallet, doubleHeavyPallet, mixedPallet, denseMediumPallet])

  // Warehouse scene data — distribución variada de palets
  const room: Room = useMemo(
    () => ({
      id: 'room-1',
      name: 'Zona de carga',
      floorPolygon: [
        { x: 0, z: 0 },
        { x: 8000, z: 0 },
        { x: 8000, z: 6000 },
        { x: 0, z: 6000 },
      ],
      ceilingHeight: 3500,
      pallets: [
        // Primera fila
        {
          id: 'wh-pp-1',
          stackedPallet: multiFloorPallet,
          position: { x: 500, y: 0, z: 500 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-2',
          stackedPallet: stackedPallet,
          position: { x: 1800, y: 0, z: 500 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-3',
          stackedPallet: doubleHeavyPallet,
          position: { x: 3100, y: 0, z: 500 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-4',
          stackedPallet: mixedPallet,
          position: { x: 4400, y: 0, z: 500 },
          yRotation: 90 as const,
        },
        {
          id: 'wh-pp-5',
          stackedPallet: denseMediumPallet,
          position: { x: 5900, y: 0, z: 500 },
          yRotation: 0 as const,
        },
        // Segunda fila
        {
          id: 'wh-pp-6',
          stackedPallet: doubleHeavyPallet,
          position: { x: 500, y: 0, z: 1700 },
          yRotation: 90 as const,
        },
        {
          id: 'wh-pp-7',
          stackedPallet: multiFloorPallet,
          position: { x: 2200, y: 0, z: 1700 },
          yRotation: 90 as const,
        },
        {
          id: 'wh-pp-8',
          stackedPallet: stackedPallet,
          position: { x: 3800, y: 0, z: 1700 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-9',
          stackedPallet: denseMediumPallet,
          position: { x: 5100, y: 0, z: 1700 },
          yRotation: 90 as const,
        },
        // Tercera fila
        {
          id: 'wh-pp-10',
          stackedPallet: mixedPallet,
          position: { x: 700, y: 0, z: 3000 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-11',
          stackedPallet: multiFloorPallet,
          position: { x: 2000, y: 0, z: 3000 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-12',
          stackedPallet: doubleHeavyPallet,
          position: { x: 3300, y: 0, z: 3000 },
          yRotation: 90 as const,
        },
        // Cuarta fila (más al fondo)
        {
          id: 'wh-pp-13',
          stackedPallet: stackedPallet,
          position: { x: 1000, y: 0, z: 4400 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-14',
          stackedPallet: denseMediumPallet,
          position: { x: 2300, y: 0, z: 4400 },
          yRotation: 0 as const,
        },
        {
          id: 'wh-pp-15',
          stackedPallet: multiFloorPallet,
          position: { x: 3600, y: 0, z: 4400 },
          yRotation: 90 as const,
        },
      ],
      metadata: {},
    }),
    [stackedPallet, multiFloorPallet, doubleHeavyPallet, mixedPallet, denseMediumPallet],
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
