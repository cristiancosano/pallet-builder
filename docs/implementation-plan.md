# Plan de Implementación

> **Propósito**: Hoja de ruta técnica para implementar Pallet Builder, organizada en fases incrementales con dependencias claras.

## Principio de ordenación

Cada fase produce artefactos **utilizables y testeables** antes de pasar a la siguiente. Las dependencias fluyen de abajo (core) hacia arriba (scenes).

---

## Fase 0 — Infraestructura y Scaffold

**Objetivo**: Preparar el esqueleto de carpetas, configuración de build en modo library, testing y exports.

| Tarea | Detalle |
|-------|---------|
| Reorganizar `src/` | Crear estructura de carpetas definitiva: `core/{entities,validation,packing,factories}`, `components/{primitives,environments,controls,scenes}`, `hooks/` |
| Configurar Vite modo library | Entry point `lib.ts`, external React/Three/R3F, formatos ESM + CJS |
| Configurar Vitest | Archivo `vitest.config.ts`, scripts `test`, `test:watch`, `test:coverage` |
| Setup path aliases | `@/` → `src/` en tsconfig y vite |
| Barrel exports | `index.ts` en cada carpeta; `lib.ts` como entry point público |
| Limpiar código actual | Mover código existente de `components/` y `core/` a nueva estructura |

**Entregable**: `pnpm build` genera bundle de librería vacío sin errores. `pnpm test` ejecuta sin tests fallidos.

---

## Fase 1 — Core: Entidades y Tipos

**Objetivo**: Definir todas las entidades de dominio como tipos/interfaces TypeScript puros.

| Tarea | Archivo(s) | Referencia |
|-------|-----------|-----------|
| Tipos base | `core/types.ts` | `Dimensions3D`, `Position3D`, `Point2D`, `BoundingBox`, `DiscreteRotation`, `ValidationResult`, `Violation` |
| Constantes | `core/constants.ts` | `TRUCK_PRESETS`, `STANDARD_PALLETS`, `SEPARATOR_DEFAULTS` |
| Box | `core/entities/Box.ts` | Interface `Box`, `PlacedBox` |
| Pallet | `core/entities/Pallet.ts` | Interface `Pallet` |
| Separator | `core/entities/Separator.ts` | Interface `Separator`, `SeparatorMaterial` enum |
| PalletFloor | `core/entities/PalletFloor.ts` | Interface `PalletFloor` |
| StackedPallet | `core/entities/StackedPallet.ts` | Interface `StackedPallet` |
| PlacedPallet | `core/entities/PlacedPallet.ts` | Interface `PlacedPallet` |
| Room | `core/entities/Room.ts` | Interface `Room` |
| Warehouse | `core/entities/Warehouse.ts` | Interface `Warehouse` |
| Truck | `core/entities/Truck.ts` | Interface `Truck`, `TruckType` enum |

**Tests**: Smoke tests que verifican que los tipos compilan y las constantes son correctas.

**Entregable**: `import { Box, Pallet, Warehouse, TRUCK_PRESETS } from './core'` funciona.

---

## Fase 2 — Core: Validación

**Objetivo**: Implementar funciones puras de validación que verifican las reglas de negocio.

| Tarea | Archivo | Reglas cubiertas |
|-------|---------|-----------------|
| AABB helpers | `core/validation/collision.ts` | `getBoundingBox()`, `aabbIntersects()` |
| Colisiones entre cajas | `core/validation/collision.ts` | BR-001 |
| Límites de contenedor | `core/validation/bounds.ts` | BR-002, BR-003 |
| Peso | `core/validation/weight.ts` | BR-101, BR-102, BR-103, BR-104 |
| Apilamiento cajas | `core/validation/stacking.ts` | BR-201, BR-202, BR-203 |
| Apilamiento palets | `core/validation/stacking.ts` | BR-301, BR-302, BR-303, BR-304 |
| Gravedad | `core/validation/gravity.ts` | BR-004 (soporte debajo) |
| Estabilidad / CoG | `core/validation/stability.ts` | BR-501, BR-502, BR-503 |
| Point-in-polygon | `core/validation/polygon.ts` | BR-401 (palet dentro de estancia) |
| Barrel | `core/validation/index.ts` | Re-exports |

**Tests**: > 90% cobertura. Cada regla de negocio tiene al menos un test positivo y uno negativo.

**Entregable**: `validateNoBoxCollisions(boxes)` → `{ isValid, violations }`.

---

## Fase 3 — Core: Factories

**Objetivo**: Crear factories para instanciar entidades con presets y valores por defecto.

| Tarea | Archivo |
|-------|---------|
| PalletFactory | `core/factories/PalletFactory.ts` — `.euro()`, `.american()`, `.custom(dims)` |
| TruckFactory | `core/factories/TruckFactory.ts` — `.fromPreset(TruckType)`, `.custom(dims)` |
| BoxFactory (opcional) | `core/factories/BoxFactory.ts` — helper para crear Box con defaults |

**Tests**: Verificar que presets producen dimensiones correctas.

**Entregable**: `PalletFactory.euro()` devuelve palet EUR estándar (1200×800×144mm, 1000kg).

---

## Fase 4 — Core: Algoritmos de Empaquetado

**Objetivo**: Implementar la interfaz adapter y al menos 2 estrategias.

| Tarea | Archivo |
|-------|---------|
| Interfaz PackingStrategy | `core/packing/PackingStrategy.ts` |
| PackingResult | `core/packing/PackingStrategy.ts` — resultado con floors, metrics, violations |
| ColumnStrategy | `core/packing/ColumnStrategy.ts` — empaquetado en columnas por tipo |
| BinPacking3DStrategy | `core/packing/BinPacking3D.ts` — optimización volumétrica (heurística) |
| PackingRegistry | `core/packing/registry.ts` — registrar/consultar estrategias |

**Tests**: Dado un set de cajas y un palet, verificar que el resultado es válido (sin colisiones, dentro de límites).

**Entregable**: `registry.get('column').pack(boxes, pallet)` → `PackingResult`.

---

## Fase 5 — Hooks

**Objetivo**: Custom hooks que conectan el core con React.

| Hook | Propósito |
|------|----------|
| `usePhysicsValidation` | Recibe boxes + pallet → ejecuta validaciones → retorna `{ collisions, bounds, weight, gravity }` |
| `usePalletMetrics` | Recibe StackedPallet → calcula → retorna `PalletMetrics` (peso, volumen, CoG, estabilidad) |
| `usePackingStrategy` | Accede al registry, ejecuta estrategia seleccionada, retorna resultado |

**Tests**: Integration tests con `@testing-library/react` (renderHook).

**Entregable**: Los hooks son importables y ejecuta validaciones reactivamente.

---

## Fase 6 — Componentes Primitivos 3D

**Objetivo**: Componentes React/R3F granulares que renderizan cada entidad.

| Componente | Props clave |
|-----------|-------------|
| `<Box />` | `box`, `position`, `rotation`, `selected`, `highlighted`, `onClick`, `onHover` |
| `<Pallet />` | `pallet`, `position` — base física del palet |
| `<Separator />` | `separator`, `position`, `dimensions` |
| `<StackedPallet />` | `stackedPallet`, `position`, `rotation` — renderiza base + pisos + separadores + cajas |
| `<Label />` | `text`, `position` — overlay HTML con `<Html>` de drei |

**Reglas**:
- Controlados (sin estado interno).
- `React.memo` en todos.
- Conversión mm → metros interna.
- Props de interacción opcionales.

**Tests**: Smoke tests — montan sin errores.

**Entregable**: `<StackedPallet data={myPallet} />` renderiza palet cargado en un Canvas.

---

## Fase 7 — Environments y Controls

**Objetivo**: Decorados de escena para almacén y camión, más controles de cámara.

| Componente | Propósito |
|-----------|----------|
| `<WarehouseEnvironment />` | Suelo, paredes (según polígono de Room), techo, grid, iluminación |
| `<TruckEnvironment />` | Contenedor del camión según tipo, suelo, paredes, rampa |
| `<CameraControls />` | Wrapper de OrbitControls con presets de posición |

**Entregable**: Decorados reutilizables que envuelven los children.

---

## Fase 8 — Scenes (Escenas Precompuestas)

**Objetivo**: Componentes de alto nivel que componen Canvas + Environment + Controls + Children.

| Scene | Uso |
|-------|-----|
| `<PalletScene />` | Canvas + iluminación + CameraControls + StackedPallet |
| `<TruckScene />` | Canvas + TruckEnvironment + CameraControls + PlacedPallets |
| `<WarehouseScene />` | Canvas + WarehouseEnvironment + CameraControls + PlacedPallets en rooms |

**Props**: Datos de dominio + callbacks + config visual opcional.

**Entregable**: `<PalletScene stackedPallet={data} />` renderiza escena completa con una línea.

---

## Fase 9 — Demo App

**Objetivo**: Actualizar `App.tsx` para demostrar todas las capacidades de la librería.

| Tarea |
|-------|
| Demo de PalletScene con cajas empaquetadas |
| Demo de TruckScene con múltiples palets |
| Demo de WarehouseScene con estancias poligonales |
| Panel lateral con métricas y validaciones |
| Selector de estrategia de empaquetado |
| Controles para añadir/quitar cajas |

**Entregable**: Demo funcional que sirve como showcase.

---

## Fase 10 — Publicación

| Tarea |
|-------|
| Configurar `package.json` (name, version, main, module, types, exports, peerDependencies) |
| Generar tipos `.d.ts` con `vite-plugin-dts` |
| README.md orientado a npm (instalación, uso rápido, API summary) |
| Licencia |
| CI/CD básico (lint + test + build) |
| Publicar v0.1.0 en npm |

---

## Diagrama de Dependencias entre Fases

```
Fase 0  (Scaffold)
  │
  ▼
Fase 1  (Entidades) ─────────────────────────────┐
  │                                                │
  ▼                                                │
Fase 2  (Validación) ──┐                          │
  │                     │                          │
  ▼                     │                          │
Fase 3  (Factories)     │                          │
  │                     │                          │
  ▼                     ▼                          │
Fase 4  (Packing)  ← depende de entidades         │
  │                     │                          │
  ▼                     ▼                          ▼
Fase 5  (Hooks) ← depende de validación + packing + entidades
  │
  ▼
Fase 6  (Primitivas 3D) ← depende de entidades
  │
  ▼
Fase 7  (Environments) ← depende de entidades (Room, Truck)
  │
  ▼
Fase 8  (Scenes) ← depende de primitivas + environments + hooks
  │
  ▼
Fase 9  (Demo) ← depende de todo
  │
  ▼
Fase 10 (Publicación)
```

---

## Estimación de Esfuerzo

| Fase | Complejidad | Estimación |
|------|------------|-----------|
| 0 — Scaffold | Baja | 1 sesión |
| 1 — Entidades | Baja | 1 sesión |
| 2 — Validación | Alta | 2-3 sesiones |
| 3 — Factories | Baja | 1 sesión |
| 4 — Packing | Alta | 2-3 sesiones |
| 5 — Hooks | Media | 1 sesión |
| 6 — Primitivas 3D | Media | 2 sesiones |
| 7 — Environments | Media-Alta | 2 sesiones |
| 8 — Scenes | Media | 1-2 sesiones |
| 9 — Demo | Media | 1-2 sesiones |
| 10 — Publicación | Baja | 1 sesión |

**Total estimado**: ~14-18 sesiones de trabajo.

---

## Notas

- Cada fase incluye sus propios tests antes de pasar a la siguiente.
- Las fases 1-4 son **core puro** (TypeScript, sin React). Se pueden desarrollar y testear rápidamente.
- Las fases 6-8 son **visualización** (React/R3F). Requieren Canvas y contexto 3D.
- La Fase 5 (Hooks) hace de puente entre core y componentes.
