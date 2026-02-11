/**
 * ViewControls y MiniMap — Guía de uso
 * 
 * Estos componentes mejoran la experiencia de usuario al trabajar con escenas 3D:
 * - ViewControls: Botones para cambiar rápidamente entre vistas de cámara
 * - MiniMap: Mini-mapa 2D para orientación espacial
 */

// ═══════════════════════════════════════════════════════════
// Ejemplo 1: TruckScene con controles completos
// ═══════════════════════════════════════════════════════════

import { TruckScene } from '@/components/scenes/TruckScene'
import { TruckFactory } from '@/core/factories'

const truck = TruckFactory.createStandard()

function TruckExample() {
  return (
    <TruckScene
      truck={truck}
      preset="industrial"
      showViewControls={true}  // Mostrar controles de vista
      showMiniMap={true}       // Mostrar mini-mapa
      showGrid={true}
    />
  )
}

// ═══════════════════════════════════════════════════════════
// Ejemplo 2: WarehouseScene con controles completos
// ═══════════════════════════════════════════════════════════

import { WarehouseScene } from '@/components/scenes/WarehouseScene'
import { Room } from '@/core/entities'

const warehouse = new Room({
  name: 'Almacén Principal',
  floorPolygon: [
    { x: 0, z: 0 },
    { x: 10000, z: 0 },
    { x: 10000, z: 8000 },
    { x: 0, z: 8000 },
  ],
  ceilingHeight: 4000,
})

function WarehouseExample() {
  return (
    <WarehouseScene
      room={warehouse}
      preset="industrial"
      showViewControls={true}  // Mostrar controles de vista
      showMiniMap={true}       // Mostrar mini-mapa
    />
  )
}

// ═══════════════════════════════════════════════════════════
// Ejemplo 3: Personalizar posición de controles
// ═══════════════════════════════════════════════════════════

// Los controles se pueden ocultar si quieres crear una UI personalizada
function CustomUIExample() {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective')
  
  return (
    <div>
      {/* Tu propia UI personalizada */}
      <div className="custom-controls">
        <button onClick={() => setCameraPreset('top')}>Vista Superior</button>
        <button onClick={() => setCameraPreset('front')}>Vista Frontal</button>
      </div>
      
      <TruckScene
        truck={truck}
        cameraPreset={cameraPreset}
        showViewControls={false}  // Ocultar controles por defecto
        showMiniMap={false}       // Ocultar mini-mapa
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Características implementadas
// ═══════════════════════════════════════════════════════════

/**
 * 1. ANIMACIONES SUAVES
 * - Transiciones ease-out cubic entre vistas de cámara
 * - Duración: 1 segundo
 * - Interpolación suave (lerp) de posición y rotación
 * 
 * 2. DAMPING (Inercia)
 * - enableDamping: true
 * - dampingFactor: 0.05
 * - Controles más naturales y fluidos
 * 
 * 3. VISTAS DE CÁMARA
 * - perspective: Vista isométrica ajustada (por defecto)
 * - isometric: Vista isométrica pura (45° todos los ejes)
 * - top: Vista superior (cenital)
 * - front: Vista frontal
 * - side: Vista lateral
 * 
 * 4. CÁMARA ADAPTATIVA
 * - Posiciones calculadas dinámicamente según el tamaño de la escena
 * - FOV optimizado: 45° (menos distorsión)
 * - Límites de zoom adaptativos
 * - Far clipping extendido (200 para truck, 300 para warehouse)
 * 
 * 5. MINIMAP 2D
 * - Vista superior simplificada
 * - Indicadores de cámara y objetivo
 * - Polígonos para warehouse, rectángulos para truck
 * - Grid visual para referencia
 * - Responsive (más pequeño en móviles)
 * 
 * 6. VIEW CONTROLS
 * - Panel flotante con botones de vista
 * - Indicador visual de vista activa
 * - Iconos intuitivos con etiquetas
 * - Responsive (solo iconos en móviles)
 * - Posición configurable
 */

// ═══════════════════════════════════════════════════════════
// Props disponibles
// ═══════════════════════════════════════════════════════════

interface SceneProps {
  // ... props existentes ...
  
  /** Mostrar controles de vista (por defecto: true) */
  showViewControls?: boolean
  
  /** Mostrar mini-mapa (por defecto: true) */
  showMiniMap?: boolean
  
  /** Vista inicial de cámara (cambia dinámicamente con ViewControls) */
  cameraPreset?: CameraPreset
}

export {}
