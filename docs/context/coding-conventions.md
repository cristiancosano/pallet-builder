# Coding Conventions

> **Propósito**: Estándares de código para mantener consistencia en Pallet Builder.

## Principios Generales

1. **Claridad sobre brevedad** — El código debe leerse con facilidad.
2. **DRY** — Evitar duplicación; extraer a funciones/módulos reutilizables.
3. **SOLID** — Aplicar donde tenga sentido, especialmente Single Responsibility.
4. **Componentes pequeños** — Una responsabilidad por componente/función.
5. **Core puro** — Toda lógica de negocio en `core/`, sin React ni Three.js.

---

## Estructura de Archivos

### Nomenclatura

| Qué | Convención | Ejemplo |
|-----|-----------|---------|
| Componente React | PascalCase, carpeta propia | `Box/Box.tsx` |
| Entidad core | PascalCase | `Pallet.ts`, `StackedPallet.ts` |
| Hook | camelCase, prefijo `use` | `usePhysicsValidation.ts` |
| Función de validación | camelCase, prefijo `validate` | `validateNoCollisions.ts` |
| Tipo / Interface | PascalCase | `Dimensions3D`, `BoxProps` |
| Enum | PascalCase, valores UPPER_SNAKE | `TruckType.REFRIGERATED` |
| Constante | UPPER_SNAKE | `TRUCK_PRESETS`, `MAX_FLOORS` |
| Barrel export | `index.ts` | En cada carpeta |

### Organización de Imports

```typescript
// 1. React y librerías externas
import { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'

// 2. Tipos (import type)
import type { BoxProps, Dimensions3D } from '@/core/types'

// 3. Core (entidades, validación, factories)
import { validateBounds } from '@/core/validation'
import { PalletFactory } from '@/core/factories'

// 4. Componentes internos
import { Box } from '@/components/primitives/Box'

// 5. Hooks internos
import { usePhysicsValidation } from '@/hooks'

// 6. Estilos (solo en demo)
import './Component.css'
```

---

## Componentes React

### Estructura estándar

```tsx
import { memo, useCallback } from 'react'

// 1. Tipos
interface BoxProps {
  box: Box
  position: Position3D
  selected?: boolean
  onClick?: (id: string) => void
}

// 2. Componente (memo por defecto en primitivas)
export const BoxComponent = memo<BoxProps>(function BoxComponent({
  box,
  position,
  selected = false,
  onClick,
}) {
  const handleClick = useCallback(() => {
    onClick?.(box.id)
  }, [box.id, onClick])

  return (
    <mesh position={[position.x / 1000, position.y / 1000, position.z / 1000]} onClick={handleClick}>
      <boxGeometry args={[box.dimensions.width / 1000, box.dimensions.height / 1000, box.dimensions.depth / 1000]} />
      <meshStandardMaterial color={selected ? '#ff6600' : box.color} />
    </mesh>
  )
})
```

### Reglas de componentes

- **Controlados** — Sin `useState` para datos de dominio. Todo por props.
- **Callbacks** — Toda acción sale por callback (`onClick`, `onHover`, `onMove`).
- **Memo** — Primitivas 3D siempre con `React.memo`.
- **Naming** — Props tipo se llama `ComponentNameProps` (e.g., `BoxProps`).
- **Display name** — Usar named function en `memo()` para DevTools.

### Componentes 3D (R3F)

```tsx
// Conversión mm → metros en el componente
const posMeters = useMemo(
  () => [pos.x / 1000, pos.y / 1000, pos.z / 1000] as const,
  [pos]
)

// useMemo en geometrías y materiales
const geometry = useMemo(
  () => new THREE.BoxGeometry(w / 1000, h / 1000, d / 1000),
  [w, h, d]
)
```

---

## TypeScript

### Tipos vs Interfaces

```typescript
// interface → para shapes de objetos (extensible)
interface Pallet {
  id: string
  dimensions: Dimensions3D
  maxLoad: number
}

// type → para uniones, intersecciones, utilitarios
type DiscreteRotation = 0 | 90 | 180 | 270
type PackingResultStatus = 'success' | 'partial' | 'failed'
```

### Reglas TS

- **Strict mode** siempre habilitado.
- **No `any`** — Usar `unknown` + narrowing o tipos genéricos.
- **`readonly`** en interfaces de entidades cuando sea posible.
- **Tipos explícitos** en firmas de funciones públicas (exports).
- **Inline types** permitidos para props internas simples.

---

## Core — Funciones Puras

```typescript
// ✅ Función pura de validación
function validateNoBoxCollisions(boxes: PlacedBox[]): ValidationResult {
  const violations: Violation[] = []
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      if (aabbIntersects(getBoundingBox(boxes[i]), getBoundingBox(boxes[j]))) {
        violations.push({ code: 'COLLISION', boxAId: boxes[i].box.id, boxBId: boxes[j].box.id })
      }
    }
  }
  return { isValid: violations.length === 0, violations }
}

// ❌ NO: side effects, mutación, dependencias React
```

- Input → Output, sin side effects.
- No importar React ni Three.js en `core/`.
- Parametrizar todo: no leer globales.

---

## Custom Hooks

```typescript
// Retornar objeto con propiedades nombradas
function usePhysicsValidation(boxes: PlacedBox[], pallet: Pallet) {
  const result = useMemo(
    () => ({
      collisions: validateNoBoxCollisions(boxes),
      bounds: validateBounds(boxes, pallet),
      gravity: validateGravity(boxes),
    }),
    [boxes, pallet]
  )

  return result
}
```

- Siempre prefijo `use`.
- Retornar **objeto** (no array) para legibilidad.
- Memoizar cálculos pesados con `useMemo`.

---

## Unidades

| Concepto | Unidad | Notas |
|----------|--------|-------|
| Dimensiones | mm | API pública |
| Posiciones | mm | API pública |
| Peso | kg | |
| Rotación | grados (0, 90, 180, 270) | API pública |
| Interno R3F | metros | Componentes convierten `mm / 1000` |
| Interno Three.js | radianes | Componentes convierten `deg * π / 180` |

---

## Documentación de Código

### JSDoc en funciones públicas

```typescript
/**
 * Valida que ninguna caja colisione con otra dentro del piso.
 * Usa detección AABB (Axis-Aligned Bounding Box).
 *
 * @param boxes - Cajas posicionadas en el piso
 * @returns Resultado con lista de violaciones (pares de IDs colisionados)
 */
export function validateNoBoxCollisions(boxes: PlacedBox[]): ValidationResult {
  // ...
}
```

### Comentarios inline

```typescript
// ✅ Explica el "por qué"
// Usamos AABB en vez de OBB porque las rotaciones son discretas (0/90/180/270)
const collision = aabbIntersects(a, b)

// ❌ Explica el "qué" (ya obvio)
// Incrementa el contador
count++
```

---

## Patrones de Diseño

### Composition over Inheritance
```tsx
<WarehouseScene warehouse={data}>
  <StackedPallet data={pallet} position={pos} />
</WarehouseScene>
```

### Adapter Pattern (Packing)
```typescript
const strategy: PackingStrategy = registry.get('column')
const result = strategy.pack(boxes, pallet)
```

### Factory Pattern
```typescript
const pallet = PalletFactory.euro()
const truck = TruckFactory.fromPreset(TruckType.BOX)
```

### Controlled Components
```tsx
<Box box={data} selected={selectedId === data.id} onClick={handleSelect} />
```

---

## Rendimiento

- `React.memo` en toda primitiva 3D.
- `useMemo` en geometrías, materiales, y datos derivados.
- `useCallback` en handlers pasados como props.
- No recalcular validaciones en `useFrame` — solo cuando cambian datos.
- `InstancedMesh` cuando hay muchas cajas idénticas.

---

## Testing

```typescript
// Nomenclatura
collision.test.ts       // unit test de core
usePhysicsValidation.test.ts  // integration test de hook

// Estructura
describe('validateNoBoxCollisions', () => {
  it('returns valid when no boxes overlap', () => {
    const result = validateNoBoxCollisions(nonOverlappingBoxes)
    expect(result.isValid).toBe(true)
  })

  it('detects collision between overlapping boxes', () => {
    const result = validateNoBoxCollisions(overlappingBoxes)
    expect(result.isValid).toBe(false)
    expect(result.violations).toHaveLength(1)
  })
})
```

- Arrange → Act → Assert.
- Tests del core: sin mocks de React/Three.js.
- Tests de hooks: `@testing-library/react`.
- Tests de componentes 3D: smoke tests (montan sin errores).

---

## Límites de Código

| Métrica | Límite |
|---------|--------|
| Componente | ≤ 200 líneas |
| Función | ≤ 50 líneas |
| Línea | ≤ 100 caracteres |
| Parámetros de función | ≤ 4 (usar objeto para más) |
| Archivos en carpeta | Si > 10, considerar subdividir |

---

## Anti-patrones

```typescript
// ❌ any
const data: any = fetchData()
// ✅
const data: PalletData = fetchData()

// ❌ Estado interno en componentes de la librería
function Box() { const [hovered, setHovered] = useState(false) }
// ✅ Controlado
function Box({ hovered, onHover }: BoxProps) { ... }

// ❌ Lógica de negocio en componente
function Pallet() { if (totalWeight > maxLoad) ... }
// ✅ Lógica en core
const result = validateWeight(boxes, pallet)

// ❌ Mutación directa
pallet.floors.push(floor)
// ✅ Inmutabilidad
const updated = { ...pallet, floors: [...pallet.floors, floor] }

// ❌ Import de React en core/
import { useState } from 'react' // en core/validation/bounds.ts
// ✅ Core es TypeScript puro
```
