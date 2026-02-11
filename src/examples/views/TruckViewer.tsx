/**
 * TruckViewer — Vista de ejemplo para gestionar el camión
 *
 * Permite:
 *  - Visualizar pallets dentro del camión
 *  - Añadir pallets desde el store o importar desde warehouse
 *  - Mover y rotar pallets dentro del camión
 *  - Regresar pallets al warehouse
 */

import { useState, useMemo, useCallback } from 'react'
import {
  TruckScene,
  SCENE_PRESETS,
  TruckType,
} from '@/lib'
import type { CameraPreset, Truck } from '@/lib'
import { useExampleStore } from '../store/useExampleStore'
import { getStackedPalletTotalWeight } from '@/core/entities/StackedPallet'

export function TruckViewer() {
  const {
    truck,
    pallets,
    warehouse,
    selectedBoxId,
    hoveredBoxId,
    selectedPalletPlacementId,
    addPalletToTruck,
    removePalletFromTruck,
    movePalletInTruck,
    rotatePalletInTruck,
    addPalletToWarehouse,
    movePalletFromWarehouseToTruck,
    editPalletInBuilder,
    setSelectedBoxId,
    setHoveredBoxId,
    setSelectedPalletPlacementId,
  } = useExampleStore()

  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective')
  const [scenePreset, setScenePreset] = useState('industrial')
  const [showLabels, setShowLabels] = useState(false)
  const [selectedPalletToAdd, setSelectedPalletToAdd] = useState<string>('')
  const [addSource, setAddSource] = useState<'store' | 'warehouse'>('store')

  // Pallets disponibles en el store
  const availablePallets = useMemo(
    () => Object.entries(pallets),
    [pallets],
  )

  // Pallets en warehouse
  const warehousePallets = useMemo(
    () => warehouse.pallets,
    [warehouse.pallets],
  )

  const selectedPlacement = useMemo(
    () => truck.pallets.find((pp) => pp.id === selectedPalletPlacementId),
    [truck.pallets, selectedPalletPlacementId],
  )

  // Calcular peso total del camión
  const totalWeight = useMemo(
    () =>
      truck.pallets.reduce(
        (sum, pp) => sum + getStackedPalletTotalWeight(pp.stackedPallet),
        0,
      ),
    [truck.pallets],
  )

  const handleBoxClick = useCallback(
    (id: string) => setSelectedBoxId(selectedBoxId === id ? null : id),
    [selectedBoxId, setSelectedBoxId],
  )

  const handleBoxHover = useCallback(
    (id: string | null) => setHoveredBoxId(id),
    [setHoveredBoxId],
  )

  // Añadir pallet
  const handleAddPallet = useCallback(() => {
    if (!selectedPalletToAdd) return
    const count = truck.pallets.length
    const col = count % 2
    const row = Math.floor(count / 2)
    const x = 100 + col * 1200
    const z = 100 + row * 1000

    if (addSource === 'warehouse') {
      // Mover desde warehouse al truck
      movePalletFromWarehouseToTruck(selectedPalletToAdd, { x, y: 0, z })
    } else {
      addPalletToTruck(selectedPalletToAdd, { x, y: 0, z })
    }
    setSelectedPalletToAdd('')
  }, [selectedPalletToAdd, addSource, truck.pallets.length, addPalletToTruck, movePalletFromWarehouseToTruck])

  // Mover pallet
  const nudge = useCallback(
    (dx: number, dz: number) => {
      if (!selectedPalletPlacementId || !selectedPlacement) return
      movePalletInTruck(selectedPalletPlacementId, {
        x: selectedPlacement.position.x + dx,
        y: 0,
        z: selectedPlacement.position.z + dz,
      })
    },
    [selectedPalletPlacementId, selectedPlacement, movePalletInTruck],
  )

  // Devolver al warehouse
  const handleReturnToWarehouse = useCallback(() => {
    if (!selectedPlacement) return
    const palletId = selectedPlacement.stackedPallet.id
    // Añadir al warehouse
    const wCount = warehouse.pallets.length
    const col = wCount % 4
    const row = Math.floor(wCount / 4)
    addPalletToWarehouse(palletId, { x: 500 + col * 1500, y: 0, z: 500 + row * 1500 })
    // Quitar del truck
    removePalletFromTruck(selectedPalletPlacementId!)
    setSelectedPalletPlacementId(null)
  }, [selectedPlacement, selectedPalletPlacementId, warehouse.pallets.length, addPalletToWarehouse, removePalletFromTruck, setSelectedPalletPlacementId])

  // Editar en builder
  const handleEditInBuilder = useCallback(() => {
    if (!selectedPlacement) return
    editPalletInBuilder(selectedPlacement.stackedPallet.id)
  }, [selectedPlacement, editPalletInBuilder])

  return (
    <div className="ex-view">
      {/* Sidebar izquierda — Pallets en camión */}
      <aside className="ex-sidebar ex-sidebar-left">
        <section className="panel">
          <h3>Pallets en camión</h3>
          {truck.pallets.length === 0 ? (
            <p className="ex-muted">El camión está vacío</p>
          ) : (
            <ul className="ex-pallet-list">
              {truck.pallets.map((pp) => (
                <li
                  key={pp.id}
                  className={`ex-pallet-item ${selectedPalletPlacementId === pp.id ? 'active' : ''}`}
                  onClick={() =>
                    setSelectedPalletPlacementId(
                      selectedPalletPlacementId === pp.id ? null : pp.id,
                    )
                  }
                >
                  <span>{String(pp.stackedPallet.metadata.name || pp.id)}</span>
                  <span className="ex-muted">
                    {pp.stackedPallet.floors.length} piso{pp.stackedPallet.floors.length > 1 ? 's' : ''}
                    · {pp.yRotation}°
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h3>Cargar pallet</h3>
          <div className="ex-tab-toggle">
            <button
              className={addSource === 'store' ? 'active' : ''}
              onClick={() => { setAddSource('store'); setSelectedPalletToAdd('') }}
            >
              Desde store
            </button>
            <button
              className={addSource === 'warehouse' ? 'active' : ''}
              onClick={() => { setAddSource('warehouse'); setSelectedPalletToAdd('') }}
            >
              Desde almacén
            </button>
          </div>

          {addSource === 'store' ? (
            availablePallets.length === 0 ? (
              <p className="ex-muted">No hay pallets construidos</p>
            ) : (
              <select
                value={selectedPalletToAdd}
                onChange={(e) => setSelectedPalletToAdd(e.target.value)}
              >
                <option value="">— Seleccionar —</option>
                {availablePallets.map(([id, sp]) => (
                  <option key={id} value={id}>
                    {String(sp.metadata.name || id)}
                  </option>
                ))}
              </select>
            )
          ) : warehousePallets.length === 0 ? (
            <p className="ex-muted">No hay pallets en el almacén</p>
          ) : (
            <select
              value={selectedPalletToAdd}
              onChange={(e) => setSelectedPalletToAdd(e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              {warehousePallets.map((pp) => (
                <option key={pp.id} value={pp.id}>
                  {String(pp.stackedPallet.metadata.name || pp.id)}
                </option>
              ))}
            </select>
          )}

          <button
            className="ex-btn ex-btn-primary ex-btn-full"
            onClick={handleAddPallet}
            disabled={!selectedPalletToAdd}
            style={{ marginTop: '0.5rem' }}
          >
            + Cargar en camión
          </button>
        </section>
      </aside>

      {/* Viewport 3D */}
      <div className="viewport">
        <TruckScene
          truck={truck}
          preset={scenePreset}
          selectedBoxId={selectedBoxId}
          highlightedBoxId={hoveredBoxId}
          showLabels={showLabels}
          cameraPreset={cameraPreset}
          showMiniMap
          onBoxClick={handleBoxClick}
          onBoxHover={handleBoxHover}
        />
      </div>

      {/* Sidebar derecha */}
      <aside className="ex-sidebar ex-sidebar-right">
        {/* Acciones sobre pallet seleccionado */}
        {selectedPlacement && (
          <section className="panel">
            <h3>Pallet seleccionado</h3>
            <dl className="metrics">
              <dt>Nombre</dt>
              <dd>{String(selectedPlacement.stackedPallet.metadata.name || selectedPlacement.id)}</dd>
              <dt>Pisos</dt>
              <dd>{selectedPlacement.stackedPallet.floors.length}</dd>
              <dt>Posición</dt>
              <dd>
                {selectedPlacement.position.x}, {selectedPlacement.position.z}
              </dd>
              <dt>Rotación</dt>
              <dd>{selectedPlacement.yRotation}°</dd>
            </dl>

            <div className="ex-actions">
              <h4>Mover</h4>
              <div className="ex-nudge-grid">
                <button onClick={() => nudge(0, -200)}>↑</button>
                <button onClick={() => nudge(-200, 0)}>←</button>
                <button onClick={() => nudge(200, 0)}>→</button>
                <button onClick={() => nudge(0, 200)}>↓</button>
              </div>
              <button
                className="ex-btn ex-btn-full"
                onClick={() => rotatePalletInTruck(selectedPalletPlacementId!)}
              >
                🔄 Rotar 90°
              </button>
              <button
                className="ex-btn ex-btn-full"
                style={{ marginTop: '0.25rem' }}
                onClick={handleReturnToWarehouse}
              >
                🏭 Devolver al almacén
              </button>
              <button
                className="ex-btn ex-btn-full"
                style={{ marginTop: '0.25rem' }}
                onClick={handleEditInBuilder}
              >
                ✏️ Editar en Builder
              </button>
              <button
                className="ex-btn ex-btn-full ex-btn-danger"
                style={{ marginTop: '0.25rem' }}
                onClick={() => {
                  removePalletFromTruck(selectedPalletPlacementId!)
                  setSelectedPalletPlacementId(null)
                }}
              >
                🗑 Descargar del camión
              </button>
            </div>
          </section>
        )}

        {/* Cámara */}
        <section className="panel">
          <h3>Cámara</h3>
          <div className="btn-group">
            {(['perspective', 'isometric', 'top', 'front', 'side'] as CameraPreset[]).map((p) => (
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

        {/* Visual */}
        <section className="panel">
          <h3>Visual</h3>
          <select value={scenePreset} onChange={(e) => setScenePreset(e.target.value)}>
            {Object.entries(SCENE_PRESETS).map(([id, p]) => (
              <option key={id} value={id}>{p.name}</option>
            ))}
          </select>
          <label className="checkbox" style={{ marginTop: '0.5rem' }}>
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Mostrar etiquetas
          </label>
        </section>

        {/* Info truck */}
        <section className="panel">
          <h3>Camión</h3>
          <dl className="metrics">
            <dt>Tipo</dt>
            <dd>{truck.truckType}</dd>
            <dt>Dimensiones</dt>
            <dd>
              {truck.dimensions.width}×{truck.dimensions.depth}×{truck.dimensions.height} mm
            </dd>
            <dt>Pallets cargados</dt>
            <dd>{truck.pallets.length}</dd>
            <dt>Peso total</dt>
            <dd>{totalWeight.toFixed(1)} / {truck.maxWeight} kg</dd>
            <dt>Uso peso</dt>
            <dd
              className={totalWeight > truck.maxWeight ? 'ex-text-danger' : ''}
            >
              {((totalWeight / truck.maxWeight) * 100).toFixed(1)}%
            </dd>
          </dl>
        </section>
      </aside>
    </div>
  )
}
