/**
 * App — Punto de entrada de los ejemplos de Pallet Builder
 *
 * Enruta entre las tres vistas: PalletBuilder, WarehouseViewer, TruckViewer.
 * El estado global se gestiona con Zustand (useExampleStore).
 */

import { PalletBuilder, WarehouseViewer, TruckViewer, useExampleStore } from './examples'
import type { ExampleView } from './examples'
import './index.css'
import './examples/examples.css'

const VIEWS: { id: ExampleView; label: string; icon: string }[] = [
  { id: 'pallet-builder', label: 'Pallet Builder', icon: '📦' },
  { id: 'warehouse-viewer', label: 'Almacén', icon: '🏭' },
  { id: 'truck-viewer', label: 'Camión', icon: '🚚' },
]

function App() {
  const activeView = useExampleStore((s) => s.activeView)
  const setActiveView = useExampleStore((s) => s.setActiveView)
  const warehousePalletCount = useExampleStore((s) => s.warehouse.pallets.length)
  const truckPalletCount = useExampleStore((s) => s.truck.pallets.length)
  const builtPalletCount = useExampleStore((s) => Object.keys(s.pallets).length)

  const badges: Record<ExampleView, number> = {
    'pallet-builder': builtPalletCount,
    'warehouse-viewer': warehousePalletCount,
    'truck-viewer': truckPalletCount,
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="ex-header">
        <h1>Pallet Builder</h1>
        <nav className="ex-nav">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`ex-nav-btn ${activeView === v.id ? 'active' : ''}`}
              onClick={() => setActiveView(v.id)}
            >
              {v.icon} {v.label}
              {badges[v.id] > 0 && <span className="ex-badge">{badges[v.id]}</span>}
            </button>
          ))}
        </nav>
      </header>

      {/* Vista activa */}
      <div className="main">
        {activeView === 'pallet-builder' && <PalletBuilder />}
        {activeView === 'warehouse-viewer' && <WarehouseViewer />}
        {activeView === 'truck-viewer' && <TruckViewer />}
      </div>
    </div>
  )
}

export default App
