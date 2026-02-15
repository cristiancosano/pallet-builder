# Packing Strategies API Reference

API reference for packing strategies in Pallet Builder.

## PackingStrategy Interface

All packing strategies must implement this interface:

```typescript
interface PackingStrategy {
  /** Unique identifier for the strategy */
  readonly id: string

  /** Human-readable name */
  readonly name: string

  /** Pack boxes into a pallet */
  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

---

## PackingResult Type

Return type of the `pack()` method:

```typescript
interface PackingResult {
  /** Successfully placed boxes */
  placements: PlacedBox[]

  /** Packing metrics */
  metrics: {
    /** Volume utilization (0-1) */
    volumeUtilization: number

    /** Weight utilization (0-1) */
    weightUtilization: number

    /** Center of gravity coordinates (mm) */
    centerOfGravity: { x: number; y: number; z: number }

    /** Stability score (0-100) */
    stabilityScore: number
  }

  /** Boxes that couldn't be placed */
  unplacedBoxes: Box[]
}
```

---

## Available Strategies

### MaterialGroupingStrategy

```typescript
class MaterialGroupingStrategy implements PackingStrategy {
  readonly id = 'material-grouping'
  readonly name = 'Material & Product Grouping'

  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

**ID**: `material-grouping`

**Best for**: Warehouse logistics with material ordering and product grouping

**Required box fields**:
- `dimensions`: `{ width: number, height: number, depth: number }`
- `weight`: `number`

**Optional but recommended**:
- `materialWeight`: `number` (0-10, default: 5)
- `product`: `string` (for vertical column grouping)

**Usage**:
```typescript
import { MaterialGroupingStrategy } from '@cristiancosano/pallet-builder'

const strategy = new MaterialGroupingStrategy()
const result = strategy.pack(boxes, pallet)
```

---

### BinPacking3DStrategy

```typescript
class BinPacking3DStrategy implements PackingStrategy {
  readonly id = 'bin-packing-3d'
  readonly name = '3D Bin Packing'

  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

**ID**: `bin-packing-3d`

**Best for**: Maximum volume utilization

**Required box fields**:
- `dimensions`: `{ width: number, height: number, depth: number }`
- `weight`: `number`

**Usage**:
```typescript
import { BinPacking3DStrategy } from '@cristiancosano/pallet-builder'

const strategy = new BinPacking3DStrategy()
const result = strategy.pack(boxes, pallet)
```

---

### TypeGroupStrategy

```typescript
class TypeGroupStrategy implements PackingStrategy {
  readonly id = 'type-group'
  readonly name = 'Type Grouping'

  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

**ID**: `type-group`

**Best for**: Simple grouping by box type with fragile items on top

**Required box fields**:
- `dimensions`: `{ width: number, height: number, depth: number }`
- `weight`: `number`
- `type`: `string`

**Optional**:
- `fragile`: `boolean`

**Usage**:
```typescript
import { TypeGroupStrategy } from '@cristiancosano/pallet-builder'

const strategy = new TypeGroupStrategy()
const result = strategy.pack(boxes, pallet)
```

---

### ColumnStrategy

```typescript
class ColumnStrategy implements PackingStrategy {
  readonly id = 'column'
  readonly name = 'Simple Column Stacking'

  pack(boxes: Box[], pallet: Pallet): PackingResult
}
```

**ID**: `column`

**Best for**: Simple vertical stacking by type/SKU

**Required box fields**:
- `dimensions`: `{ width: number, height: number, depth: number }`
- `weight`: `number`
- `type` or `sku`: `string`

**Usage**:
```typescript
import { ColumnStrategy } from '@cristiancosano/pallet-builder'

const strategy = new ColumnStrategy()
const result = strategy.pack(boxes, pallet)
```

---

## PackingRegistry API

Registry for managing available packing strategies.

### Constructor

```typescript
class PackingRegistry {
  constructor()
}
```

Creates a new registry with built-in strategies registered.

### Methods

#### register()

```typescript
register(strategy: PackingStrategy): void
```

Register a new strategy.

**Parameters**:
- `strategy`: Strategy to register

**Throws**: Error if strategy with same ID already exists

**Example**:
```typescript
const registry = new PackingRegistry()
registry.register(new MyCustomStrategy())
```

---

#### get()

```typescript
get(id: string): PackingStrategy
```

Get a strategy by ID.

**Parameters**:
- `id`: Strategy ID

**Returns**: The requested strategy

**Throws**: Error if strategy not found

**Example**:
```typescript
const strategy = registry.get('material-grouping')
```

---

#### has()

```typescript
has(id: string): boolean
```

Check if a strategy exists.

**Parameters**:
- `id`: Strategy ID

**Returns**: `true` if strategy exists, `false` otherwise

**Example**:
```typescript
if (registry.has('material-grouping')) {
  // Use it
}
```

---

#### list()

```typescript
list(): PackingStrategy[]
```

Get all registered strategies.

**Returns**: Array of all strategies

**Example**:
```typescript
const strategies = registry.list()
strategies.forEach(s => {
  console.log(`${s.id}: ${s.name}`)
})
```

---

## Default Registry

Pre-configured registry with all built-in strategies:

```typescript
import { defaultRegistry } from '@cristiancosano/pallet-builder'

// List all strategies
const strategies = defaultRegistry.list()

// Get specific strategy
const strategy = defaultRegistry.get('material-grouping')

// Use it
const result = strategy.pack(boxes, pallet)
```

---

## Creating Custom Strategies

Implement the `PackingStrategy` interface:

```typescript
import type { PackingStrategy, PackingResult } from '@cristiancosano/pallet-builder'
import type { Box, Pallet, PlacedBox } from '@cristiancosano/pallet-builder'

class MyCustomStrategy implements PackingStrategy {
  readonly id = 'my-custom'
  readonly name = 'My Custom Algorithm'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    const placements: PlacedBox[] = []

    // Your algorithm here
    // ...

    return {
      placements,
      metrics: {
        volumeUtilization: 0.75,
        weightUtilization: 0.60,
        centerOfGravity: { x: 600, y: 400, z: 400 },
        stabilityScore: 85,
      },
      unplacedBoxes: [],
    }
  }
}
```

Then register and use it:

```typescript
import { PackingRegistry } from '@cristiancosano/pallet-builder'

const registry = new PackingRegistry()
registry.register(new MyCustomStrategy())

const strategy = registry.get('my-custom')
const result = strategy.pack(boxes, pallet)
```

---

## Type Definitions

### Box

```typescript
interface Box {
  id: string
  dimensions: {
    width: number   // mm
    height: number  // mm
    depth: number   // mm
  }
  weight: number  // kg

  // Optional fields
  type?: string
  sku?: string
  product?: string
  materialWeight?: number  // 0-10
  fragile?: boolean
  maxStackWeight?: number  // kg
  color?: string
}
```

### Pallet

```typescript
interface Pallet {
  id: string
  dimensions: {
    width: number   // mm
    height: number  // mm (platform height)
    depth: number   // mm
  }
  maxWeight: number       // kg
  maxStackHeight: number  // mm (total height including platform)
}
```

### PlacedBox

```typescript
interface PlacedBox {
  id: string
  box: Box
  position: {
    x: number  // mm
    y: number  // mm
    z: number  // mm
  }
  rotation: {
    x: number  // degrees
    y: number  // degrees (0 or 90)
    z: number  // degrees
  }
  supportedBy: string[]  // IDs of boxes below
  supporting: string[]   // IDs of boxes above
}
```

---

## See Also

- [Packing Algorithms](../domain/packing-algorithms.md) - Algorithm details
- [Strategy Selection Guide](../guides/packing-strategy-selection.md) - When to use each strategy
- [Packing Patterns](../examples/packing-patterns.md) - Usage examples
- [ADR-004: Strategy Pattern](../architecture/ADR-004-packing-strategy-pattern.md) - Architecture decision
