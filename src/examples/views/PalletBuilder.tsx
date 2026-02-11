/**
 * PalletBuilder — Vista de ejemplo para construir pallets
 *
 * Permite:
 *  - Definir cajas de distintos tamaños (box templates)
 *  - Seleccionar tipo de pallet y estrategia de empaquetado
 *  - Visualizar el resultado en 3D
 *  - Añadir pisos adicionales (StackedPallet)
 *  - Guardar el pallet construido en el store
 */

import { useState, useMemo, useCallback } from 'react'
import {
  PalletScene,
  PalletFactory,
  BoxFactory,
  usePackingStrategy,
  usePalletMetrics,
  usePhysicsValidation,
  SeparatorMaterial,
  STANDARD_PALLETS,
  SCENE_PRESETS,
} from '@/lib'
import type {
  Box,
  Pallet,
  StackedPallet,
  PlacedBox,
  PalletFloor,
  Separator,
  CameraPreset,
} from '@/lib'
import { useExampleStore } from '../store/useExampleStore'
import type { BoxTemplate } from '../store/useExampleStore'

// ── Componente para editar una plantilla de caja ─────────────────

function BoxTemplateCard({
  template,
  onUpdate,
  onRemove,
}: {
  template: BoxTemplate
  onUpdate: (id: string, u: Partial<BoxTemplate>) => void
  onRemove: (id: string) => void
}) {
  const { box } = template
  return (
    <div className="ex-card">
      <div className="ex-card-header">
        <span className="ex-color-dot" style={{ background: box.color || '#888' }} />
        <strong>{template.name}</strong>
        <button className="ex-btn-icon" onClick={() => onRemove(template.id)} title="Eliminar">
          ✕
        </button>
      </div>
      <div className="ex-card-body">
        <label>
          Cantidad
          <input
            type="number"
            min={1}
            max={50}
            value={template.quantity}
            onChange={(e) => onUpdate(template.id, { quantity: Math.max(1, +e.target.value) })}
          />
        </label>
        <div className="ex-dims">
          {box.dimensions.width}×{box.dimensions.height}×{box.dimensions.depth} mm
        </div>
        <div className="ex-weight">{box.weight} kg{box.fragile ? ' · Frágil' : ''}</div>
      </div>
    </div>
  )
}

// ── Diálogo para añadir plantilla ────────────────────────────────

function AddBoxTemplateDialog({ onAdd, onClose }: {
  onAdd: (t: Omit<BoxTemplate, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState('Nueva caja')
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(300)
  const [depth, setDepth] = useState(600)
  const [weight, setWeight] = useState(10)
  const [quantity, setQuantity] = useState(4)
  const [color, setColor] = useState('#4a90d9')
  const [fragile, setFragile] = useState(false)

  const handleSubmit = () => {
    const box = fragile
      ? BoxFactory.fragile({ width, height, depth }, 10, { type: name, weight, color })
      : BoxFactory.create({ width, height, depth }, { type: name, weight, color })
    onAdd({ name, box, quantity })
    onClose()
  }

  return (
    <div className="ex-dialog-overlay" onClick={onClose}>
      <div className="ex-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Añadir plantilla de caja</h3>
        <div className="ex-form">
          <label>Nombre <input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Ancho (mm) <input type="number" value={width} onChange={(e) => setWidth(+e.target.value)} /></label>
          <label>Alto (mm) <input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} /></label>
          <label>Fondo (mm) <input type="number" value={depth} onChange={(e) => setDepth(+e.target.value)} /></label>
          <label>Peso (kg) <input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} /></label>
          <label>Cantidad <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(+e.target.value)} /></label>
          <label>Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
          <label className="checkbox">
            <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} />
            Frágil
          </label>
        </div>
        <div className="ex-dialog-actions">
          <button className="ex-btn" onClick={onClose}>Cancelar</button>
          <button className="ex-btn ex-btn-primary" onClick={handleSubmit}>Añadir</button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────

export function PalletBuilder() {
  const {
    boxTemplates,
    selectedPalletType,
    selectedStrategy,
    builderPalletId,
    pallets,
    addBoxTemplate,
    updateBoxTemplate,
    removeBoxTemplate,
    setSelectedPalletType,
    setSelectedStrategy,
    buildPallet,
    updatePallet,
    setSelectedBoxId,
    setHoveredBoxId,
    selectedBoxId,
    hoveredBoxId,
  } = useExampleStore()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective')
  const [scenePreset, setScenePreset] = useState('industrial')
  const [showLabels, setShowLabels] = useState(false)
  const [floorCount, setFloorCount] = useState(1)
  const [palletName, setPalletName] = useState('')

  // Generar cajas a partir de las plantillas
  const boxes: Box[] = useMemo(
    () =>
      boxTemplates.flatMap((tpl) =>
        Array.from({ length: tpl.quantity }, (_, i) =>
          BoxFactory.create(
            { ...tpl.box.dimensions },
            {
              type: tpl.box.type,
              weight: tpl.box.weight,
              color: tpl.box.color,
              fragile: tpl.box.fragile,
              fragilityMaxWeight: tpl.box.fragilityMaxWeight,
            },
          ),
        ),
      ),
    [boxTemplates],
  )

  // Pallet base
  const pallet: Pallet = useMemo(
    () => PalletFactory.fromPreset(selectedPalletType as keyof typeof STANDARD_PALLETS),
    [selectedPalletType],
  )

  // Packing
  const { availableStrategies, pack } = usePackingStrategy(selectedStrategy)

  // Construir los pisos del StackedPallet
  const stackedPallet: StackedPallet = useMemo(() => {
    // Si estamos editando un pallet existente, cargarlo
    if (builderPalletId && pallets[builderPalletId]) {
      return pallets[builderPalletId]
    }

    const separator: Separator = {
      id: 'sep-auto',
      dimensions: { width: pallet.dimensions.width, height: 5, depth: pallet.dimensions.depth },
      material: SeparatorMaterial.CARDBOARD,
      weight: 1,
      metadata: {},
    }

    const floors: PalletFloor[] = []
    const boxesPerFloor = Math.ceil(boxes.length / floorCount)

    for (let f = 0; f < floorCount; f++) {
      const floorBoxes = boxes.slice(f * boxesPerFloor, (f + 1) * boxesPerFloor)
      if (floorBoxes.length === 0) break

      const result = pack(floorBoxes, pallet)
      floors.push({
        level: f,
        pallet,
        boxes: result.placements,
        ...(f < floorCount - 1 ? { separatorAbove: separator } : {}),
      })
    }

    if (floors.length === 0) {
      // Al menos un piso vacío
      floors.push({ level: 0, pallet, boxes: [] })
    }

    return {
      id: builderPalletId || 'builder-preview',
      floors,
      metadata: { name: palletName || 'Preview' },
    }
  }, [boxes, pallet, pack, floorCount, builderPalletId, pallets, palletName])

  // Métricas
  const metrics = usePalletMetrics(stackedPallet)
  const placedBoxes = stackedPallet.floors.flatMap((f) => f.boxes)
  const validation = usePhysicsValidation(placedBoxes, pallet)

  // Total de cajas colocadas vs disponibles
  const totalPlaced = stackedPallet.floors.reduce((sum, f) => sum + f.boxes.length, 0)

  // Guardar pallet
  const handleSave = useCallback(() => {
    const name = palletName || `Pallet ${Object.keys(pallets).length + 1}`
    if (builderPalletId) {
      updatePallet(builderPalletId, { ...stackedPallet, metadata: { ...stackedPallet.metadata, name } })
    } else {
      buildPallet(name, [], pallet, stackedPallet.floors)
    }
    setPalletName('')
  }, [palletName, builderPalletId, stackedPallet, pallets, pallet, buildPallet, updatePallet])

  const handleBoxClick = useCallback((id: string) => {
    setSelectedBoxId(selectedBoxId === id ? null : id)
  }, [selectedBoxId, setSelectedBoxId])

  const handleBoxHover = useCallback(
    (id: string | null) => setHoveredBoxId(id),
    [setHoveredBoxId],
  )

  // Buscar caja seleccionada
  const selectedBox = useMemo(() => {
    if (!selectedBoxId) return null
    for (const floor of stackedPallet.floors) {
      const found = floor.boxes.find((pb) => pb.box.id === selectedBoxId)
      if (found) return found.box
    }
    return null
  }, [selectedBoxId, stackedPallet])

  return (
    <div className="ex-view">
      {/* Sidebar izquierda — Plantillas de cajas */}
      <aside className="ex-sidebar ex-sidebar-left">
        <section className="panel">
          <h3>Cajas disponibles</h3>
          <div className="ex-templates">
            {boxTemplates.map((tpl) => (
              <BoxTemplateCard
                key={tpl.id}
                template={tpl}
                onUpdate={updateBoxTemplate}
                onRemove={removeBoxTemplate}
              />
            ))}
          </div>
          <button className="ex-btn ex-btn-full" onClick={() => setShowAddDialog(true)}>
            + Añadir tipo de caja
          </button>
        </section>

        <section className="panel">
          <h3>Pallets construidos</h3>
          {Object.keys(pallets).length === 0 ? (
            <p className="ex-muted">Ningún pallet guardado aún</p>
          ) : (
            <ul className="ex-pallet-list">
              {Object.entries(pallets).map(([id, sp]) => (
                <li key={id} className="ex-pallet-item">
                  <span>{String(sp.metadata.name || id)}</span>
                  <span className="ex-muted">
                    {sp.floors.length} piso{sp.floors.length > 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>

      {/* Viewport 3D */}
      <div className="viewport">
        <PalletScene
          stackedPallet={stackedPallet}
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

      {/* Sidebar derecha — Controles */}
      <aside className="ex-sidebar ex-sidebar-right">
        {/* Guardar */}
        <section className="panel">
          <h3>Guardar pallet</h3>
          <input
            className="ex-input"
            placeholder="Nombre del pallet..."
            value={palletName}
            onChange={(e) => setPalletName(e.target.value)}
          />
          <button className="ex-btn ex-btn-primary ex-btn-full" onClick={handleSave}>
            {builderPalletId ? '💾 Actualizar pallet' : '💾 Guardar pallet'}
          </button>
        </section>

        {/* Tipo de palet */}
        <section className="panel">
          <h3>Tipo de palet</h3>
          <select value={selectedPalletType} onChange={(e) => setSelectedPalletType(e.target.value)}>
            {Object.keys(STANDARD_PALLETS).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
          <div className="ex-muted" style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>
            {pallet.dimensions.width}×{pallet.dimensions.depth}×{pallet.dimensions.height} mm
            · Max {pallet.maxWeight} kg
          </div>
        </section>

        {/* Estrategia */}
        <section className="panel">
          <h3>Estrategia de empaquetado</h3>
          <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)}>
            {availableStrategies.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </section>

        {/* Pisos */}
        <section className="panel">
          <h3>Pisos del pallet</h3>
          <div className="ex-floor-control">
            <button onClick={() => setFloorCount(Math.max(1, floorCount - 1))}>−</button>
            <span>{floorCount} piso{floorCount > 1 ? 's' : ''}</span>
            <button onClick={() => setFloorCount(Math.min(5, floorCount + 1))}>+</button>
          </div>
        </section>

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

        {/* Métricas */}
        <section className="panel">
          <h3>Métricas</h3>
          <dl className="metrics">
            <dt>Cajas colocadas</dt>
            <dd>{totalPlaced} / {boxes.length}</dd>
            <dt>Vol. utilizado</dt>
            <dd>{(metrics.volumeUtilization * 100).toFixed(1)}%</dd>
            <dt>Peso total</dt>
            <dd>{metrics.totalWeight.toFixed(1)} kg</dd>
            <dt>Estabilidad</dt>
            <dd>{metrics.stabilityScore.toFixed(0)}%</dd>
          </dl>
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

        {/* Caja seleccionada */}
        {selectedBox && (
          <section className="panel">
            <h3>Caja seleccionada</h3>
            <dl className="metrics">
              <dt>Tipo</dt>
              <dd>{selectedBox.type || '—'}</dd>
              <dt>Dimensiones</dt>
              <dd>{selectedBox.dimensions.width}×{selectedBox.dimensions.height}×{selectedBox.dimensions.depth}</dd>
              <dt>Peso</dt>
              <dd>{selectedBox.weight} kg</dd>
            </dl>
            <button className="ex-btn" style={{ marginTop: '0.5rem' }} onClick={() => setSelectedBoxId(null)}>
              Deseleccionar
            </button>
          </section>
        )}
      </aside>

      {/* Diálogo añadir caja */}
      {showAddDialog && (
        <AddBoxTemplateDialog
          onAdd={addBoxTemplate}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  )
}
