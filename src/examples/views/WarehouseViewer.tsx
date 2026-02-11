/**
 * WarehouseViewer — Vista de ejemplo para gestionar el almacén
 *
 * Permite:
 *  - Visualizar pallets dentro del warehouse
 *  - Añadir pallets construidos al warehouse
 *  - Mover y rotar pallets dentro del almacén
 *  - Enviar pallets al camión
 *  - Enviar un pallet al PalletBuilder para editarlo
 */

import { useState, useMemo, useCallback } from 'react'
import {
  WarehouseScene,
  useWarehouseValidation,
  SCENE_PRESETS,
} from '@/lib'
import type { CameraPreset } from '@/lib'
import { useExampleStore } from '../store/useExampleStore'

export function WarehouseViewer() {
  const {
    warehouse,
    pallets,
    truck,
    selectedBoxId,
    hoveredBoxId,
    selectedPalletPlacementId,
    addPalletToWarehouse,
    removePalletFromWarehouse,
    movePalletInWarehouse,
    rotatePalletInWarehouse,
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

  const validation = useWarehouseValidation(warehouse)

  // Pallets disponibles para añadir (los que están en el store)
  const availablePallets = useMemo(
    () => Object.entries(pallets),
    [pallets],
  )

  const selectedPlacement = useMemo(
    () => warehouse.pallets.find((pp) => pp.id === selectedPalletPlacementId),
    [warehouse.pallets, selectedPalletPlacementId],
  )

  const handleBoxClick = useCallback(
    (id: string) => setSelectedBoxId(selectedBoxId === id ? null : id),
    [selectedBoxId, setSelectedBoxId],
  )

  const handleBoxHover = useCallback(
    (id: string | null) => setHoveredBoxId(id),
    [setHoveredBoxId],
  )

  // Añadir pallet al warehouse con posición auto
  const handleAddPallet = useCallback(() => {
    if (!selectedPalletToAdd) return
    const count = warehouse.pallets.length
    const col = count % 4
    const row = Math.floor(count / 4)
    const x = 500 + col * 1500
    const z = 500 + row * 1500
    addPalletToWarehouse(selectedPalletToAdd, { x, y: 0, z })
    setSelectedPalletToAdd('')
  }, [selectedPalletToAdd, warehouse.pallets.length, addPalletToWarehouse])

  // Mover pallet seleccionado
  const nudge = useCallback(
    (dx: number, dz: number) => {
      if (!selectedPalletPlacementId || !selectedPlacement) return
      movePalletInWarehouse(selectedPalletPlacementId, {
        x: selectedPlacement.position.x + dx,
        y: 0,
        z: selectedPlacement.position.z + dz,
      })
    },
    [selectedPalletPlacementId, selectedPlacement, movePalletInWarehouse],
  )

  // Enviar al truck
  const handleSendToTruck = useCallback(() => {
    if (!selectedPalletPlacementId) return
    const tCount = truck.pallets.length
    const col = tCount % 2
    const row = Math.floor(tCount / 2)
    movePalletFromWarehouseToTruck(selectedPalletPlacementId, {
      x: 100 + col * 1200,
      y: 0,
      z: 100 + row * 1000,
    })
    setSelectedPalletPlacementId(null)
  }, [selectedPalletPlacementId, truck.pallets.length, movePalletFromWarehouseToTruck, setSelectedPalletPlacementId])

  // Editar en builder
  const handleEditInBuilder = useCallback(() => {
    if (!selectedPlacement) return
    editPalletInBuilder(selectedPlacement.stackedPallet.id)
  }, [selectedPlacement, editPalletInBuilder])

  return (
    <div className="ex-view">
      {/* Sidebar izquierda — Pallets en warehouse */}
      <aside className="ex-sidebar ex-sidebar-left">
        <section className="panel">
          <h3>Pallets en almacén</h3>
          {warehouse.pallets.length === 0 ? (
            <p className="ex-muted">No hay pallets en el almacén</p>
          ) : (
            <ul className="ex-pallet-list">
              {warehouse.pallets.map((pp) => (
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
          <h3>Añadir pallet</h3>
          {availablePallets.length === 0 ? (
            <p className="ex-muted">Construye pallets primero en el Pallet Builder</p>
          ) : (
            <>
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
              <button
                className="ex-btn ex-btn-primary ex-btn-full"
                onClick={handleAddPallet}
                disabled={!selectedPalletToAdd}
                style={{ marginTop: '0.5rem' }}
              >
                + Añadir al almacén
              </button>
            </>
          )}
        </section>
      </aside>

      {/* Viewport 3D */}
      <div className="viewport">
        <WarehouseScene
          room={warehouse}
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
                onClick={() => rotatePalletInWarehouse(selectedPalletPlacementId!)}
              >
                🔄 Rotar 90°
              </button>
              <button
                className="ex-btn ex-btn-full"
                style={{ marginTop: '0.25rem' }}
                onClick={handleSendToTruck}
              >
                🚚 Enviar al camión
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
                  removePalletFromWarehouse(selectedPalletPlacementId!)
                  setSelectedPalletPlacementId(null)
                }}
              >
                🗑 Eliminar del almacén
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

        {/* Validación */}
        <section className="panel">
          <h3>Validación</h3>
          <div className={`validation ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid ? '✓ Sin errores' : `✗ ${validation.violations.length} problemas`}
          </div>
          {validation.violations.length > 0 && (
            <ul className="violations">
              {validation.violations.slice(0, 5).map((v, i) => (
                <li key={i} className={v.severity}>
                  <strong>{v.severity}</strong>: {v.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Info warehouse */}
        <section className="panel">
          <h3>Almacén</h3>
          <dl className="metrics">
            <dt>Zona</dt>
            <dd>{warehouse.name}</dd>
            <dt>Pallets</dt>
            <dd>{warehouse.pallets.length}</dd>
            <dt>Dimensiones</dt>
            <dd>8000×6000 mm</dd>
            <dt>Altura techo</dt>
            <dd>{warehouse.ceilingHeight} mm</dd>
          </dl>
        </section>
      </aside>
    </div>
  )
}
