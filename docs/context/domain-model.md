# Modelo de Dominio — Contexto para IA

> **Propósito**: Resumen del modelo de dominio para herramientas de IA. Para detalles completos, ver [entities.md](../domain/entities.md) y [business-rules.md](../domain/business-rules.md).

## Visión del Dominio

Pallet Builder modela la **planificación y visualización de carga logística** en tres espacios: almacén, camión y palet. La librería permite construir, validar y visualizar configuraciones de mercancía respetando restricciones físicas y de negocio.

---

## Mapa de Entidades

```
Warehouse (almacén)
  └── Room[] (estancias)
        └── PlacedPallet[] (palets colocados en la estancia)
              └── StackedPallet (palet con carga)

Truck (camión)
  └── PlacedPallet[] (palets colocados en el camión)
        └── StackedPallet

StackedPallet (palet apilado)
  ├── Pallet (base física)
  └── PalletFloor[] (pisos de carga)
        ├── PlacedBox[] (cajas posicionadas)
        └── Separator? (separador opcional sobre el piso)

Box (caja — definición)
PlacedBox (caja posicionada en un piso)
```

---

## Entidades Principales

### Warehouse
Almacén completo: nombre + colección de estancias.

### Room (Estancia)
Espacio dentro del almacén con **planta poligonal** (array de `Point2D`) y altura de techo. Contiene palets apilados posicionados sobre el suelo.

### Truck (Camión)
Contenedor rectangular con dimensiones internas y tipo (`BOX`, `REFRIGERATED`, `FLATBED`, `CURTAIN_SIDE`). Existen presets para cada tipo. Contiene palets apilados.

### Pallet
Base física del palet: dimensiones (ancho × profundidad × alto_base), peso propio y carga máxima.

### Box (Caja)
Unidad de mercancía con:
- Campos fijos: `id`, `name`, `dimensions`, `weight`, `color`
- `stackable` + `maxStackWeight`
- Metadata extensible: `Record<string, unknown>`

### PlacedBox
Una `Box` posicionada en un piso: `position` (x, y, z en mm) + `rotation` discreta (0 | 90 | 180 | 270).

### PalletFloor (Piso)
Una capa horizontal dentro de un `StackedPallet`. Contiene un array de `PlacedBox` y, opcionalmente, un `Separator` encima.

### Separator
Lámina que divide pisos. Tiene `material` (cartón, plástico, espuma, madera) y `thickness`.

### StackedPallet
Entidad compuesta: `Pallet` base + `PalletFloor[]` + `maxHeight`. Representa un palet completamente cargado.

### PlacedPallet
Un `StackedPallet` posicionado en un contenedor (Room o Truck): `position` (x, z en mm) + `yRotation`.

---

## Value Objects

| Value Object | Uso |
|-------------|-----|
| `Dimensions3D` | `{ width, height, depth }` en mm |
| `Position3D` | `{ x, y, z }` en mm |
| `Point2D` | `{ x, z }` — vértice de polígono de estancia |
| `DiscreteRotation` | `0 \| 90 \| 180 \| 270` grados |
| `BoundingBox` | `{ min: Position3D, max: Position3D }` |
| `ValidationResult` | `{ isValid, violations[] }` |

---

## Reglas de Negocio (Resumen)

### Restricciones Físicas
- Las cajas no se salen del palet (AABB bounds).
- No hay colisiones entre cajas (AABB intersection).
- Toda caja tiene soporte debajo (gravedad simulada).
- Todo palet tiene su base sobre superficie plana.

### Restricciones de Peso
- Peso total de cajas ≤ `pallet.maxLoad`.
- Peso sobre una caja ≤ `box.maxStackWeight`.
- Peso total de palets en contenedor ≤ capacidad del contenedor.

### Estabilidad
- Centro de gravedad dentro del tercio central.
- Score de estabilidad: 0–100 basado en CoG y distribución de peso.
- Riesgo de vuelco si CoG se desvía > umbral.

### Apilamiento de Palets
- Solo se apilan si `maxHeight` lo permite.
- El palet superior no puede sobresalir del inferior.

### Incompatibilidades
- Las cajas NO tienen incompatibilidades intrínsecas. La metadata extensible permite al consumidor implementar sus propias reglas.

---

## Adapter Pattern — Algoritmos de Empaquetado

```typescript
interface PackingStrategy {
  readonly id: string
  readonly name: string
  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

La librería incluye implementaciones básicas (Column, TypeGroup, BinPacking3D). El consumidor puede:
- Registrar estrategias propias.
- Usar una estrategia incluida y modificar el resultado.
- No usar ninguna y posicionar cajas manualmente.

---

## Flujos de Trabajo

### Construir palet con algoritmo
```
1. Consumidor define Box[] y Pallet
2. Selecciona PackingStrategy
3. Ejecuta pack() → PackingResult { floors, metrics, violations }
4. Pasa resultado a <PalletScene /> o <StackedPallet />
5. Componentes renderizan en 3D
```

### Colocar palets en almacén
```
1. Consumidor define Warehouse con Room[]
2. Para cada Room, define PlacedPallet[] con posiciones
3. Pasa datos a <WarehouseScene />
4. Hooks de validación reportan colisiones o fuera de límites
```

### Validación de configuración
```
1. Funciones puras reciben entidades → ValidationResult
2. Hooks invocan validaciones y exponen resultado como estado React
3. Componentes pueden visualizar violaciones (color rojo, outline, etc.)
4. El consumidor decide acciones (bloquear, advertir, ignorar)
```

---

## Métricas

```typescript
interface PalletMetrics {
  totalWeight: number          // kg — suma de cajas
  maxLoad: number              // kg — capacidad del palet
  weightUtilization: number    // % peso usado
  volumeUsed: number           // mm³ ocupado
  volumeAvailable: number      // mm³ total (ancho × profundidad × maxHeight)
  volumeUtilization: number    // % volumen usado
  centerOfGravity: Position3D  // mm
  stabilityScore: number       // 0–100
  boxCount: number
  floorCount: number
  violationCount: number
}
```

---

## Lenguaje Ubicuo

Al generar código, usar estos términos:

| Usar | NO usar |
|------|---------|
| `Box` | `Item`, `Package`, `Object` |
| `Pallet` | `Platform`, `Base` |
| `StackedPallet` | `LoadedPallet`, `FullPallet` |
| `Room` / `Estancia` | `Zone`, `Area` |
| `PlacedBox` | `PositionedItem` |
| `PalletFloor` / `Floor` | `Layer`, `Level` |
| `Separator` | `Divider`, `Sheet` |
| `PackingStrategy` | `Algorithm`, `Solver` |
| `Truck` | `Container` (ambiguo) |
| `Warehouse` | `Storage` |
| `Bounds` | `Limits` |
| `Collision` | `Overlap`, `Intersection` |
| `CoG` | `BalancePoint` |

---

## Anti-patrones

```typescript
// ❌ Lógica de negocio en componentes React
function PalletView() {
  const canAdd = totalWeight + box.weight <= maxLoad // ❌
}

// ✅ Lógica en core/validation
const result = validateWeight(placedBoxes, pallet)

// ❌ Estado interno en componentes de la librería
function Box() {
  const [selected, setSelected] = useState(false) // ❌
}

// ✅ Componentes controlados
function Box({ selected, onSelect }: BoxProps) { ... }

// ❌ Mutar entidades
pallet.floors.push(newFloor) // ❌

// ✅ Crear nuevas instancias
const updated = { ...pallet, floors: [...pallet.floors, newFloor] }
```

---

## Referencias

- [Entidades completas con interfaces TS](../domain/entities.md)
- [Reglas de negocio con severidades](../domain/business-rules.md)
- [Glosario de términos](../domain/glossary.md)
- [Arquitectura técnica](../architecture/ARCHITECTURE.md)
- [Requisitos funcionales](../domain/requirements.md)
