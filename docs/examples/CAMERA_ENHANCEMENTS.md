# 📷 Camera Enhancements

Sistema completo de mejoras para la visualización 3D con cámaras adaptativas, transiciones suaves y controles intuitivos.

## 🎯 Características Implementadas

### 1. **Transiciones Suaves de Cámara**
- Animaciones ease-out cubic al cambiar entre vistas
- Duración: 1 segundo
- Interpolación suave (lerp) de posición y rotación
- No se producen saltos bruscos

### 2. **Damping (Inercia Natural)**
```tsx
<OrbitControls
  enableDamping
  dampingFactor={0.05}
  rotateSpeed={0.5}
  zoomSpeed={0.8}
  panSpeed={0.5}
/>
```
- Movimientos más naturales y fluidos
- Sensación de peso en la cámara
- Mejora significativa en la experiencia de usuario

### 3. **Sistema de Cámara Adaptativa**

La cámara ahora calcula su posición basándose en el **bounding box** de la escena:

```tsx
// Antes (valores fijos)
camera={{ position: [3, 3, 3] }}

// Ahora (adaptativo)
const diagonal = Math.sqrt(width² + height² + depth²)
const distance = diagonal * 1.5
camera.position = calculateOptimalPosition(sceneSize)
```

**Beneficios:**
- Se adapta automáticamente a escenas pequeñas o grandes
- Siempre muestra el contenido completo
- FOV optimizado: 45° (menos distorsión que 50°)

### 4. **Cinco Vistas de Cámara**

| Vista | Descripción | Uso |
|-------|-------------|-----|
| `perspective` | Vista isométrica ajustada (45° horizontal, 30° vertical) | **Por defecto**, ideal para visualización general |
| `isometric` | Vista isométrica pura (45° en todos los ejes) | Planos técnicos, medidas precisas |
| `top` | Vista superior (cenital) | Layout, distribución espacial |
| `front` | Vista frontal | Altura de apilamiento, frente del camión |
| `side` | Vista lateral | Profundidad, vista lateral del camión |

### 5. **ViewControls: Botones de Vista Rápida**

Panel flotante con botones para cambiar rápidamente entre vistas:

```tsx
<ViewControls
  currentPreset={cameraPreset}
  onPresetChange={setCameraPreset}
  position="top-right"  // o 'top-left', 'bottom-right', 'bottom-left'
/>
```

**Características:**
- ✅ Indicador visual de vista activa
- ✅ Iconos intuitivos con etiquetas
- ✅ Responsive (solo iconos en móviles)
- ✅ Backdrop blur para mejor legibilidad
- ✅ Animaciones hover suaves

### 6. **MiniMap: Mini-mapa 2D**

Vista superior simplificada para orientación espacial:

```tsx
<MiniMap
  sceneWidth={width}
  sceneDepth={depth}
  sceneType="truck"  // o 'warehouse'
  cameraPosition={{ x, z }}
  targetPosition={{ x, z }}
  position="bottom-left"
/>
```

**Características:**
- 📍 Indicadores de posición de cámara y objetivo
- 🗺️ Polígonos para warehouse, rectángulos para truck
- 📏 Grid visual para referencia de escala
- 🔄 Actualización en tiempo real
- 📱 Responsive (120px en móviles, 150px en desktop)

## 🚀 Uso Básico

### Escena de Camión

```tsx
import { TruckScene } from '@/components/scenes/TruckScene'
import { TruckFactory } from '@/core/factories'

function App() {
  const truck = TruckFactory.createStandard()
  
  return (
    <TruckScene
      truck={truck}
      preset="industrial"
      showViewControls={true}  // Mostrar controles
      showMiniMap={true}       // Mostrar mini-mapa
      showGrid={true}
    />
  )
}
```

### Escena de Almacén

```tsx
import { WarehouseScene } from '@/components/scenes/WarehouseScene'
import { Room } from '@/core/entities'

function App() {
  const warehouse = new Room({
    name: 'Almacén',
    floorPolygon: [
      { x: 0, z: 0 },
      { x: 10000, z: 0 },
      { x: 10000, z: 8000 },
      { x: 0, z: 8000 },
    ],
    ceilingHeight: 4000,
  })
  
  return (
    <WarehouseScene
      room={warehouse}
      preset="industrial"
      showViewControls={true}
      showMiniMap={true}
    />
  )
}
```

### Palet Individual

```tsx
import { PalletScene } from '@/components/scenes/PalletScene'

function App() {
  return (
    <PalletScene
      stackedPallet={myPallet}
      preset="industrial"
      showViewControls={true}
      showMiniMap={true}
      showGrid={true}
    />
  )
}
```

## 🎨 Personalización

### Ocultar controles para UI personalizada

```tsx
import { useState } from 'react'
import type { CameraPreset } from '@/components/controls'

function CustomUI() {
  const [preset, setPreset] = useState<CameraPreset>('perspective')
  
  return (
    <div>
      {/* Tu propia UI */}
      <div className="my-controls">
        <button onClick={() => setPreset('top')}>Vista Superior</button>
        <button onClick={() => setPreset('front')}>Vista Frontal</button>
      </div>
      
      <TruckScene
        truck={truck}
        cameraPreset={preset}
        showViewControls={false}  // Ocultar controles por defecto
        showMiniMap={false}
      />
    </div>
  )
}
```

### Configuración avanzada

```tsx
import { CameraControlsComponent } from '@/components/controls'

// Dentro de tu Canvas personalizado
<CameraControlsComponent
  preset="perspective"
  target={[0, 1, 0]}
  sceneSize={{ width: 5, height: 3, depth: 4 }}
  minDistance={0.5}
  maxDistance={50}
  autoRotate={false}
  enablePan={true}
  enableZoom={true}
/>
```

## 📱 Responsive Design

Todos los componentes son responsive:

**Desktop (> 768px):**
- ViewControls: Botones con iconos y etiquetas
- MiniMap: 150x150px con leyenda completa

**Mobile (≤ 768px):**
- ViewControls: Solo iconos (más grandes)
- MiniMap: 120x120px con leyenda compacta

## 🎮 Controles de Usuario

| Acción | Desktop | Descripción |
|--------|---------|-------------|
| Rotar | Click izquierdo + arrastrar | Orbitar alrededor del objetivo |
| Zoom | Rueda del ratón | Acercar/alejar |
| Pan | Click derecho + arrastrar | Desplazar la vista |
| Vista rápida | Click en botones | Cambiar preset de cámara |

## 🔧 Componentes Creados

### Nuevos Componentes

1. **`ViewControls`** - Panel de botones de vista
   - `/src/components/controls/ViewControls/`

2. **`MiniMap`** - Mini-mapa 2D
   - `/src/components/controls/MiniMap/`

3. **`CameraTracker`** - Rastreador de posición en tiempo real
   - `/src/components/controls/CameraTracker/`

### Nuevos Hooks

4. **`useCameraPosition`** - Hook para obtener posición de cámara
   - `/src/hooks/useCameraPosition.ts`

### Componentes Actualizados

- ✅ `CameraControls` - Damping y transiciones suaves
- ✅ `TruckScene` - Integración completa
- ✅ `WarehouseScene` - Integración completa
- ✅ `PalletScene` - Integración completa

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Posiciones de cámara | Fijas (3, 3, 3) | Adaptativas al tamaño |
| Transiciones | Instantáneas | Suaves (1s, ease-out) |
| Controles | Básicos | Damping + velocidades ajustadas |
| Vistas | 4 opciones | 5 opciones optimizadas |
| UI | Ninguna | ViewControls + MiniMap |
| Orientación | Difícil | Mini-mapa con indicadores |
| FOV | 50° | 45° (menos distorsión) |
| Far clipping | 100 | 200-300 (mejor renderizado) |

## 🎓 Mejores Prácticas

### ✅ Recomendaciones

1. **Mantén activados los controles por defecto** para mejor UX
2. **Usa preset "perspective"** para vista general inicial
3. **Activa showGrid** en escenas de diseño/medición
4. **Proporciona sceneSize** siempre que sea posible
5. **Usa "isometric"** para capturas técnicas

### ❌ Evita

1. No deshabilites damping (empeora la experiencia)
2. No uses FOV > 60° (demasiada distorsión)
3. No ocultes MiniMap en escenas complejas
4. No uses autoRotate en apps de producción (marea)

## 🐛 Troubleshooting

**Problema: Las transiciones son muy lentas**
```tsx
// Editar en CameraControls.tsx línea ~82
const duration = 1000 // Reducir a 500 para más rapidez
```

**Problema: La cámara está muy cerca/lejos**
```tsx
// Ajustar el factor multiplicador
const distance = diagonal * 1.5 // Aumentar/reducir este valor
```

**Problema: El MiniMap no se muestra**
- Verifica que `sceneSize` tenga valores > 0
- Confirma que `basePallet` existe en PalletScene
- Revisa que `floorPolygon` tenga al menos 3 puntos

## 📚 Referencias

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)
- [Ease Functions](https://easings.net/)

---

**Implementado:** Febrero 2026  
**Autor:** Pallet Builder Team  
**Versión:** 2.0.0
