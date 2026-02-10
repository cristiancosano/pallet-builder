# Entidades del Dominio

Las entidades son objetos con identidad única que persiste en el tiempo. Aunque sus atributos cambien, su identidad permanece.

> **Nota**: Pallet Builder es una **librería**. Las entidades del core son TypeScript puro, sin dependencias de React ni Three.js. Los componentes visuales consumen estas entidades vía props.

---

## Mapa de Entidades

```
Warehouse (Aggregate Root)
 └── Room[]  ────────────────────────┐
      └── PlacedPallet[]             │
           └── StackedPallet         │  Comparten
                ├── PalletFloor[]    │  reglas físicas
                │    ├── Pallet      │
                │    └── Box[]       │
                └── Separator[]      │
                                     │
Truck (Aggregate Root) ──────────────┘
 └── PlacedPallet[]
      └── (misma jerarquía)

PackingStrategy (Adapter) ← ColumnStrategy
                           ← TypeGroupStrategy
                           ← BinPacking3DStrategy
                           ← CustomStrategy
```

---

## 1. Warehouse (Almacén — Aggregate Root)

Contenedor lógico que agrupa estancias.

```typescript
interface Warehouse {
  id: string
  name: string
  rooms: Room[]
  metadata: Record<string, unknown>
}
```

**Responsabilidades**:
- Agrupar y gestionar estancias.
- Validar que los IDs de estancia sean únicos.

---

## 2. Room (Estancia)

Espacio físico dentro de un almacén. Puede tener forma irregular.

```typescript
interface Room {
  id: string
  name: string

  /** Polígono 2D (planta) definido por vértices en mm.
      Mínimo 3 vértices. Admite formas convexas y cóncavas (L, U, T…). */
  floorPolygon: Point2D[]

  /** Altura del techo en mm */
  ceilingHeight: number

  /** Palets posicionados en esta estancia */
  pallets: PlacedPallet[]

  metadata: Record<string, unknown>
}

interface Point2D {
  x: number  // mm
  z: number  // mm
}
```

**Responsabilidades**:
- Definir límites físicos del espacio mediante polígono.
- Validar que los palets estén dentro del polígono.
- Controlar la altura máxima (ceilingHeight).

---

## 3. Truck (Camión — Aggregate Root)

Espacio de carga de un vehículo de transporte.

```typescript
interface Truck {
  id: string
  name: string
  truckType: TruckType

  /** Dimensiones internas del espacio de carga en mm */
  dimensions: Dimensions3D

  /** Peso máximo de carga en kg */
  maxWeight: number

  /** Palets cargados */
  pallets: PlacedPallet[]

  /** Matrícula u otra referencia */
  licensePlate?: string
  metadata: Record<string, unknown>
}

enum TruckType {
  BOX = 'BOX',                   // Caja cerrada estándar
  REFRIGERATED = 'REFRIGERATED', // Frigorífico
  FLATBED = 'FLATBED',           // Plataforma
  TAUTLINER = 'TAUTLINER',      // Lona lateral
  CUSTOM = 'CUSTOM'
}

/** Configuraciones predefinidas de dimensiones por tipo */
const TRUCK_PRESETS: Record<Exclude<TruckType, TruckType.CUSTOM>, TruckPreset> = {
  BOX:          { width: 2480, height: 2700, depth: 13600, maxWeight: 24000 },
  REFRIGERATED: { width: 2440, height: 2590, depth: 13100, maxWeight: 22000 },
  FLATBED:      { width: 2480, height: 2700, depth: 13600, maxWeight: 25000 },
  TAUTLINER:    { width: 2480, height: 2700, depth: 13600, maxWeight: 24000 },
}
```

**Responsabilidades**:
- Definir espacio rectangular de carga con dimensiones y peso máximo.
- Ofrecer presets por tipo de camión.
- Permitir tipos `CUSTOM` con dimensiones arbitrarias.

---

## 4. Pallet

Plataforma física sobre la que se colocan cajas.

```typescript
interface Pallet {
  id: string

  /** Dimensiones físicas del palet (ancho × profundidad × grosor) en mm */
  dimensions: Dimensions3D

  material: PalletMaterial

  /** Peso máximo de carga en kg */
  maxWeight: number

  /** Altura máxima de apilamiento de cajas sobre este palet, en mm */
  maxStackHeight: number

  /** Peso propio del palet vacío en kg */
  weight: number

  metadata: Record<string, unknown>
}

enum PalletMaterial {
  WOOD = 'WOOD',
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
  COMPOSITE = 'COMPOSITE'
}
```

**Responsabilidades**:
- Definir capacidad de carga y dimensiones.

---

## 5. Box (Caja)

Elemento individual que se coloca sobre un palet.

```typescript
interface Box {
  id: string

  /** Dimensiones en mm */
  dimensions: Dimensions3D

  /** Peso en kg */
  weight: number

  /** Campos fijos */
  sku?: string
  type?: string
  fragile: boolean
  fragilityMaxWeight?: number   // kg que soporta encima si fragile=true
  stackable: boolean

  /** Aspecto visual */
  color?: string
  texture?: string
  modelUrl?: string             // GLTF/GLB personalizado

  /** Metadatos libres que el desarrollador necesite */
  metadata: Record<string, unknown>
}
```

**Responsabilidades**:
- Transportar propiedades físicas y visuales.
- Servir de input para algoritmos de empaquetado.

---

## 6. PlacedBox (Caja Colocada)

Una `Box` posicionada dentro de un palet.

```typescript
interface PlacedBox {
  id: string
  box: Box

  /** Posición relativa al palet (origen = esquina inferior-izquierda-trasera) */
  position: Position3D

  /** Rotación discreta: 0 | 90 | 180 | 270 grados en cada eje */
  rotation: DiscreteRotation

  /** IDs de cajas que soportan a esta */
  supportedBy: string[]

  /** IDs de cajas que esta soporta */
  supporting: string[]
}

interface Position3D {
  x: number  // mm – ancho
  y: number  // mm – alto (vertical)
  z: number  // mm – profundidad
}

interface DiscreteRotation {
  x: 0 | 90 | 180 | 270
  y: 0 | 90 | 180 | 270
  z: 0 | 90 | 180 | 270
}
```

---

## 7. Separator (Separador)

Plano rígido que se coloca entre pisos de palet para permitir apilamiento vertical.

```typescript
interface Separator {
  id: string

  /** Dimensiones: ancho × profundidad × grosor, en mm */
  dimensions: Dimensions3D

  material: SeparatorMaterial

  /** Peso propio en kg */
  weight: number

  metadata: Record<string, unknown>
}

enum SeparatorMaterial {
  CARDBOARD = 'CARDBOARD',
  WOOD = 'WOOD',
  PLASTIC = 'PLASTIC'
}
```

---

## 8. PalletFloor (Piso de Palet)

Un nivel individual dentro de un `StackedPallet`. Contiene un palet y sus cajas.

```typescript
interface PalletFloor {
  /** Índice del piso (0 = base) */
  level: number
  pallet: Pallet
  boxes: PlacedBox[]

  /** Separador situado ENCIMA de este piso (nulo si es el último) */
  separatorAbove?: Separator
}
```

---

## 9. StackedPallet (Palet Apilado / Compuesto)

Composición vertical de uno o más pisos de palet con separadores intermedios.

```typescript
interface StackedPallet {
  id: string
  floors: PalletFloor[]   // al menos 1

  /** Altura total calculada: suma de (palet.height + cajas + separador) por piso */
  readonly totalHeight: number

  /** Peso total calculado: suma de palets + separadores + cajas */
  readonly totalWeight: number

  metadata: Record<string, unknown>
}
```

**Invariantes**:
- Todos los palets del stack deben tener las mismas dimensiones de planta (ancho × profundidad).
- La altura total no puede exceder la altura del contenedor (estancia o camión).
- El peso total no puede exceder el peso máximo del palet base.

---

## 10. PlacedPallet (Palet Posicionado)

Un `StackedPallet` posicionado dentro de una `Room` o un `Truck`.

```typescript
interface PlacedPallet {
  id: string
  stackedPallet: StackedPallet

  /** Posición en el plano del suelo del contenedor (XZ), en mm */
  position: Position3D

  /** Rotación en el plano horizontal (Y), en grados */
  yRotation: 0 | 90 | 180 | 270
}
```

---

## 11. PackingStrategy (Interfaz Adapter)

Contrato para algoritmos de colocación automática de cajas en un palet.

```typescript
interface PackingStrategy {
  readonly id: string
  readonly name: string

  pack(boxes: Box[], pallet: Pallet): PackingResult
}

interface PackingResult {
  placements: PlacedBox[]
  metrics: PackingMetrics
  unplacedBoxes: Box[]       // cajas que no cupieron
}

interface PackingMetrics {
  volumeUtilization: number   // 0–1
  weightUtilization: number   // 0–1
  centerOfGravity: Position3D
  stabilityScore: number      // 0–100
}
```

**Implementaciones incluidas de serie**:
- `ColumnPackingStrategy` — columnas verticales por tipo de caja.
- `TypeGroupPackingStrategy` — agrupación por tipo, relleno capa a capa.
- `BinPacking3DStrategy` — optimización volumétrica (First Fit Decreasing Height).

**Extensibilidad**: El desarrollador registra sus propias estrategias implementando la interfaz.

---

## Value Objects

### Dimensions3D
```typescript
interface Dimensions3D {
  width: number   // mm (X)
  height: number  // mm (Y)
  depth: number   // mm (Z)
}
```

### BoundingBox
```typescript
interface BoundingBox {
  minX: number; maxX: number
  minY: number; maxY: number
  minZ: number; maxZ: number
}
```

### ValidationResult
```typescript
interface ValidationResult {
  isValid: boolean
  violations: Violation[]
}

interface Violation {
  code: string        // ej: 'COLLISION', 'WEIGHT_EXCEEDED'
  severity: 'error' | 'warning'
  message: string
  involvedIds: string[]
}
```

---

## Enums Compartidos

```typescript
enum PalletMaterial { WOOD, PLASTIC, METAL, COMPOSITE }
enum SeparatorMaterial { CARDBOARD, WOOD, PLASTIC }
enum TruckType { BOX, REFRIGERATED, FLATBED, TAUTLINER, CUSTOM }
```

---

## Diagrama de Relaciones

```
┌──────────────┐        ┌──────────────┐
│  Warehouse   │        │    Truck     │
│  - rooms[]   │        │  - pallets[] │
└──────┬───────┘        └──────┬───────┘
       │ 1..*                  │ 0..*
       ▼                       ▼
┌──────────────┐       ┌───────────────┐
│    Room      │       │ PlacedPallet  │◄──────────────────┐
│  - pallets[] │──────▶│  - position   │                   │
└──────────────┘       │  - rotation   │                   │
                       └──────┬────────┘                   │
                              │ 1                          │
                              ▼                            │
                       ┌───────────────┐                   │
                       │ StackedPallet │                   │
                       │  - floors[]   │                   │
                       └──────┬────────┘                   │
                              │ 1..*                       │
                              ▼                            │
                       ┌───────────────┐                   │
                       │ PalletFloor   │                   │
                       │  - pallet     │                   │
                       │  - boxes[]    │                   │
                       │  - separator? │                   │
                       └──┬────┬───┬───┘                   │
                          │    │   │                       │
              ┌───────────┘    │   └──────────┐            │
              ▼                ▼              ▼            │
        ┌──────────┐   ┌───────────┐  ┌───────────┐      │
        │  Pallet  │   │ PlacedBox │  │ Separator │      │
        │          │   │  - box    │  │           │      │
        └──────────┘   │  - pos    │  └───────────┘      │
                       └─────┬─────┘                      │
                             │                            │
                             ▼                            │
                       ┌──────────┐                       │
                       │   Box    │                       │
                       │ - sku    │                       │
                       │ - meta   │                       │
                       └──────────┘                       │
                                                          │
                       ┌──────────────────┐               │
                       │ PackingStrategy  │───── pack ───▶│
                       │  (adapter)       │  genera PlacedBox[]
                       └──────────────────┘
```

---

## Factories

```typescript
class PalletFactory {
  static euro(): Pallet          // 1200×800×144 mm, madera, 1000 kg
  static american(): Pallet      // 1219×1016×145 mm, madera, 1200 kg
  static asia(): Pallet          // 1100×1100×150 mm, madera, 1000 kg
  static custom(dims: Dimensions3D, opts?: Partial<Pallet>): Pallet
}

class TruckFactory {
  static fromPreset(type: TruckType): Truck
  static custom(dims: Dimensions3D, maxWeight: number): Truck
}
```

---

## Ciclo de Vida

| Entidad | Estado |
|---|---|
| Warehouse | Configurado → Estancias definidas → Palets distribuidos |
| Room | Creada → Polígono definido → Palets posicionados |
| Truck | Tipo seleccionado → Palets cargados → Validado |
| StackedPallet | Creado → Pisos añadidos → Cajas empaquetadas → Posicionado |
| Box | Definida → Colocada → Movida/Rotada → Fijada |

---

## Mejores Prácticas

1. **IDs inmutables** — nunca reasignar.
2. **Validación en construcción** — las factories validan invariantes.
3. **Colecciones encapsuladas** — no exponer arrays mutables; operaciones vía métodos.
4. **Metadatos extensibles** — `Record<string, unknown>` en toda entidad para que el consumidor inyecte lo que necesite.
5. **Separación core/UI** — las entidades no importan React ni Three.js.
6. **Patrón Adapter** — `PackingStrategy` es la interfaz; las implementaciones se registran e intercambian en runtime.
