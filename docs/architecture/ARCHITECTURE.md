# Arquitectura del Sistema

## Visión General

Pallet Builder es una **librería de componentes React/R3F** que exporta primitivas 3D, escenas precompuestas, entidades de dominio, hooks y utilidades para visualizar y gestionar la carga logística de almacenes, camiones y palets.

**Principio rector**: separación estricta entre **lógica de dominio** (core — TypeScript puro) y **visualización** (components — React/R3F). El core es testeable sin navegador, y los componentes son meros renders del estado que reciben por props.

La librería **no incluye state management**. Todos los componentes son controlados. El desarrollador consumidor gestiona el estado con su herramienta preferida (Zustand, Redux, Jotai, Context…).

---

## Estructura de Carpetas Objetivo

```
src/
├── core/                        # TypeScript puro — SIN React, SIN Three.js
│   ├── entities/                # Entidades de dominio
│   │   ├── Box.ts
│   │   ├── Pallet.ts
│   │   ├── Separator.ts
│   │   ├── PalletFloor.ts
│   │   ├── StackedPallet.ts
│   │   ├── PlacedPallet.ts
│   │   ├── Room.ts
│   │   ├── Warehouse.ts
│   │   └── Truck.ts
│   │
│   ├── validation/              # Reglas de negocio como funciones puras
│   │   ├── collision.ts         # AABB, detección de colisiones
│   │   ├── bounds.ts            # Límites de contenedor
│   │   ├── weight.ts            # Restricciones de peso
│   │   ├── stacking.ts          # Apilamiento cajas y palets
│   │   ├── stability.ts         # CoG, score de estabilidad
│   │   ├── gravity.ts           # Soporte y gravedad
│   │   ├── polygon.ts           # Point-in-polygon para estancias
│   │   └── index.ts             # Re-exports
│   │
│   ├── packing/                 # Algoritmos de empaquetado (Adapter pattern)
│   │   ├── PackingStrategy.ts   # Interfaz adapter
│   │   ├── ColumnStrategy.ts    # Columnas por tipo
│   │   ├── TypeGroupStrategy.ts # Agrupación por tipo, capa a capa
│   │   ├── BinPacking3D.ts      # Optimización volumétrica
│   │   ├── registry.ts          # Registro de estrategias
│   │   └── index.ts
│   │
│   ├── factories/               # Factories para crear entidades estándar
│   │   ├── PalletFactory.ts
│   │   ├── TruckFactory.ts
│   │   └── index.ts
│   │
│   ├── types.ts                 # Tipos, interfaces, enums compartidos
│   ├── constants.ts             # Constantes (presets de camiones, palets estándar)
│   └── index.ts                 # Barrel export de todo el core
│
├── components/                  # Componentes React / R3F
│   ├── primitives/              # Componentes granulares 3D
│   │   ├── Box/
│   │   │   ├── Box.tsx
│   │   │   └── index.ts
│   │   ├── Pallet/
│   │   │   ├── Pallet.tsx
│   │   │   └── index.ts
│   │   ├── Separator/
│   │   │   ├── Separator.tsx
│   │   │   └── index.ts
│   │   ├── StackedPallet/
│   │   │   ├── StackedPallet.tsx
│   │   │   └── index.ts
│   │   ├── Label/
│   │   │   ├── Label.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── environments/            # Decorados de escena
│   │   ├── WarehouseEnvironment/
│   │   │   ├── WarehouseEnvironment.tsx
│   │   │   └── index.ts
│   │   ├── TruckEnvironment/
│   │   │   ├── TruckEnvironment.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── controls/                # Controles de cámara y UI 3D
│   │   ├── CameraControls/
│   │   │   ├── CameraControls.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── scenes/                  # Escenas precompuestas (alto nivel)
│   │   ├── WarehouseScene/
│   │   │   ├── WarehouseScene.tsx
│   │   │   └── index.ts
│   │   ├── TruckScene/
│   │   │   ├── TruckScene.tsx
│   │   │   └── index.ts
│   │   ├── PalletScene/
│   │   │   ├── PalletScene.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts                 # Barrel export de componentes
│
├── hooks/                       # Custom hooks React
│   ├── usePhysicsValidation.ts  # Reporta colisiones, límites, gravedad
│   ├── usePalletMetrics.ts      # Volumen, peso, CoG, utilización
│   ├── usePackingStrategy.ts    # Seleccionar/ejecutar algoritmo
│   └── index.ts
│
├── lib.ts                       # Entry point de la librería (exports públicos)
├── App.tsx                      # Demo/playground (NO se publica)
├── main.tsx                     # Bootstrap de la demo
└── index.css                    # Estilos de la demo
```

---

## Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         Consumidor                              │
│   (App del desarrollador — store, UI, flujos de trabajo)        │
└────────────────────────────┬────────────────────────────────────┘
                             │  props / callbacks
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Scenes (Escenas Precompuestas)                      │
│   WarehouseScene · TruckScene · PalletScene                     │
│   Canvas + Iluminación + Cámara + Decorado + Children           │
└────────────────────────────┬────────────────────────────────────┘
                             │  compone
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Components (Primitivas 3D)                          │
│   <Box/> <Pallet/> <Separator/> <StackedPallet/> <Label/>      │
│   <WarehouseEnvironment/> <TruckEnvironment/>                   │
│   <CameraControls/>                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │  usa
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Hooks                                               │
│   usePhysicsValidation · usePalletMetrics · usePackingStrategy  │
└────────────────────────────┬────────────────────────────────────┘
                             │  invoca
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Core (TypeScript puro)                               │
│   entities/ · validation/ · packing/ · factories/                │
│   types.ts · constants.ts                                        │
│   SIN React · SIN Three.js · SIN side effects                    │
│   Testeable en Node con vitest                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Patrones de Diseño

### 1. Adapter Pattern — Algoritmos de Empaquetado

```typescript
// Interfaz adapter
interface PackingStrategy {
  readonly id: string
  readonly name: string
  pack(boxes: Box[], pallet: Pallet): PackingResult
}

// Registro de estrategias
class PackingRegistry {
  register(strategy: PackingStrategy): void
  get(id: string): PackingStrategy
  list(): PackingStrategy[]
}

// El consumidor elige la estrategia:
const result = registry.get('column').pack(myBoxes, myPallet)
```

### 2. Composition over Inheritance — Componentes React

```tsx
// Las escenas componen primitivas:
<WarehouseScene warehouse={data}>
  {data.rooms[activeRoom].pallets.map(pp => (
    <StackedPallet key={pp.id} data={pp.stackedPallet} position={pp.position} />
  ))}
</WarehouseScene>
```

### 3. Controlled Components — Sin Estado Interno

```tsx
// Todo viene por props, todo sale por callbacks:
<Box
  box={boxData}
  position={[100, 0, 200]}
  selected={selectedId === boxData.id}
  onClick={(id) => setSelectedId(id)}
  onHover={(id) => setHoveredId(id)}
/>
```

### 4. Factory Pattern

```typescript
const euroPallet = PalletFactory.euro()
const truck = TruckFactory.fromPreset(TruckType.BOX)
```

### 5. Pure Validation Functions

```typescript
// Las validaciones son funciones puras: input → ValidationResult
const result = validateNoBoxCollisions(placedBoxes)
// { isValid: false, violations: [{ code: 'COLLISION', ... }] }
```

---

## Flujo de Datos

```
1. Consumidor construye datos (entidades del core)
                    ↓
2. Pasa datos como props a las Scenes o primitivas
                    ↓
3. Componentes renderizan en 3D usando R3F
                    ↓
4. Usuario interactúa (click, hover)
                    ↓
5. Componente invoca callback (onClick, onMove)
                    ↓
6. Consumidor actualiza su store
                    ↓
7. React re-render con nuevos props → vuelta a paso 2

En paralelo:
- Hooks de validación leen las props y reportan violaciones
- Hooks de métricas calculan utilización, CoG, estabilidad
```

---

## Convenciones

### Naming

| Qué | Convención | Ejemplo |
|-----|-----------|---------|
| Entidad core | PascalCase | `Pallet`, `StackedPallet` |
| Componente React | PascalCase, carpeta propia | `Box/Box.tsx` |
| Hook | camelCase, prefijo `use` | `usePhysicsValidation` |
| Función de validación | camelCase, prefijo `validate` | `validateNoBoxCollisions` |
| Tipo/Interface | PascalCase | `Dimensions3D`, `PackingResult` |
| Enum | PascalCase, valores UPPER_SNAKE | `TruckType.REFRIGERATED` |
| Props | PascalCase + `Props` | `BoxProps`, `PalletSceneProps` |
| Constante | UPPER_SNAKE o PascalCase-objeto | `TRUCK_PRESETS` |

### Unidades

- Dimensiones y posiciones: **mm** (milímetros) en la API pública.
- Interno R3F: componentes convierten mm → metros (`pos / 1000`) para Three.js.
- Peso: **kg**.
- Rotación: **grados discretos** (0, 90, 180, 270) en la API. Internamente se convierte a radianes.

### Exports (lib.ts)

```typescript
// Entidades y tipos
export type { Box, Pallet, Room, Warehouse, Truck, ... } from './core'

// Componentes granulares
export { Box as BoxComponent } from './components/primitives'
export { Pallet as PalletComponent } from './components/primitives'
// ...

// Escenas precompuestas
export { WarehouseScene, TruckScene, PalletScene } from './components/scenes'

// Hooks
export { usePhysicsValidation, usePalletMetrics, usePackingStrategy } from './hooks'

// Validación (funciones puras — usables sin React)
export { validateNoBoxCollisions, validateBounds, ... } from './core/validation'

// Factories
export { PalletFactory, TruckFactory } from './core/factories'

// Packing
export type { PackingStrategy } from './core/packing'
export { PackingRegistry, ColumnStrategy, BinPacking3DStrategy } from './core/packing'
```

---

## Estrategia de Testing

| Capa | Herramienta | Tipo | Cobertura objetivo |
|------|-------------|------|--------------------|
| `core/entities` | vitest | Unit | > 90 % |
| `core/validation` | vitest | Unit | > 90 % |
| `core/packing` | vitest | Unit | > 80 % |
| `hooks` | vitest + @testing-library/react | Integration | > 70 % |
| `components/primitives` | vitest + @react-three/test-renderer | Integration | > 60 % |
| `components/scenes` | vitest (smoke test) | Smoke | Monta sin errores |

---

## Rendimiento

1. **Instancing** — Para muchas cajas iguales usar `<InstancedMesh>`.
2. **Frustum culling** — Automático en Three.js.
3. **Memoización** — `React.memo` en primitivas; `useMemo` en geometrías y materiales.
4. **LOD** — Opcional, reducir geometría para palets lejanos en escena almacén.
5. **Lazy loading** — Modelos GLTF se cargan bajo demanda con `<Suspense>`.
6. **Validaciones bajo demanda** — No recalcular full en cada frame; solo cuando cambian los datos.

---

## Extensibilidad

### Añadir nuevo tipo de contenedor

1. Crear entidad en `core/entities/`.
2. Crear componente en `components/primitives/` o `environments/`.
3. Crear escena en `components/scenes/` (opcional).
4. Exportar desde `lib.ts`.

### Añadir nueva estrategia de empaquetado

1. Implementar `PackingStrategy`.
2. Registrar en `PackingRegistry`.
3. Disponible inmediatamente en `usePackingStrategy`.

### Añadir nuevo tipo de camión

1. Añadir entrada a `TruckType` enum y `TRUCK_PRESETS`.
2. Crear decorado visual en `TruckEnvironment` (si necesita apariencia distinta).

---

## Seguridad y Validaciones

- Toda entidad se valida en construcción (factories).
- Las funciones de validación son puras y composables.
- La librería **reporta** violaciones; **no impide** la acción. El consumidor decide el comportamiento (mostrar error, deshacer, etc.).
- No se ejecuta código arbitrario del consumidor dentro del core.

---

## Decisiones Arquitectónicas Registradas

Ver carpeta `docs/architecture/ADR-*.md` para decisiones históricas:
- ADR-001: Uso de React Three Fiber
- ADR-002: TypeScript
- ADR-003: Vite como build tool
- Creación de objetos estandarizados

### 5. **Declarative API**
- API basada en componentes React
- Configuración mediante props
- Composición visual mediante children

## Convenciones de Naming

### Entidades del Core
- Sufijo `Entity` al exportar desde `lib.ts` para evitar conflictos
- Ejemplos: `BoxEntity`, `PalletEntity`, `ContainerEntity`

### Componentes React
- PascalCase sin sufijos
- Ejemplos: `Box`, `Pallet`, `Warehouse`

### Props Interfaces
- Sufijo `Props`
- Ejemplos: `BoxProps`, `PalletProps`

### Types vs Interfaces
- `type` para uniones y tipos simples
- `interface` para objetos extensibles

## Unidades de Medida

- **Posiciones y dimensiones**: Milímetros (mm)
- **Peso**: Kilogramos (kg)
- **Rotación**: Radianes
- **Conversión automática**: Los componentes convierten mm a metros para Three.js

## Extensibilidad

### Añadir Nuevo Tipo de Contenedor

1. **Core**: Crear entidad (ej: `Truck.ts`)
2. **Components**: Crear componente visual (ej: `Truck.tsx`)
3. **Export**: Añadir a `lib.ts`

Ejemplo:

```typescript
// src/core/entities/Truck.ts
export class Truck extends Container {
  // Lógica específica de camiones
}

// src/components/Truck/Truck.tsx
export function Truck({ children, ...props }) {
  return (
    <group>
      {/* Geometría del camión */}
      {children}
    </group>
  );
}
```

### Añadir Nuevas Validaciones

```typescript
// En Pallet.ts
validate(): ValidationResult {
  // ... validaciones existentes
  
  // Nueva validación
  if (this.boxes.some(box => box.weight > 100)) {
    warnings.push('Hay cajas que exceden 100kg');
  }
  
  return { valid, errors, warnings };
}
```

## Testing Strategy

### Core (Unit Tests)
```typescript
describe('PalletEntity', () => {
  it('should validate box dimensions', () => {
    const pallet = new PalletEntity({...});
    const validation = pallet.validate();
    expect(validation.valid).toBe(true);
  });
  
  it('should calculate total weight', () => {
    const pallet = new PalletEntity({...});
    expect(pallet.getTotalWeight()).toBe(50);
  });
});
```

### Components (Integration Tests)
```tsx
describe('Pallet Component', () => {
  it('should render with boxes', () => {
    render(
      <Canvas>
        <Pallet id="test" type="EURO">
          <Box dimensions={[400, 300, 200]} />
        </Pallet>
      </Canvas>
    );
    // Assertions...
  });
});
```

## Performance Considerations

1. **Geometrías reutilizables**: Usar `useMemo` para geometrías complejas
2. **Instancing**: Para múltiples objetos idénticos
3. **LOD (Level of Detail)**: Geometrías simples para objetos lejanos
4. **Frustum Culling**: Automático en Three.js
5. **Lazy Loading**: Cargar modelos 3D bajo demanda

## Seguridad y Validaciones

- Todas las entradas del core se validan
- Los componentes validan dimensiones antes de renderizar
- Límites de peso y volumen según estándares industriales
- Warnings para configuraciones subóptimas

## Futuras Mejoras

1. **State Management**: Redux/Zustand para escenas complejas
2. **Serialización**: Import/Export de configuraciones
3. **Undo/Redo**: Para operaciones interactivas
4. **Real-time Collaboration**: WebRTC para múltiples usuarios
5. **Physics Engine**: Simulación realista de peso y estabilidad
6. **AI Optimization**: Sugerencias automáticas de empaquetado

---

Esta arquitectura permite que el sistema crezca de forma sostenible manteniendo la claridad y separación de responsabilidades.
