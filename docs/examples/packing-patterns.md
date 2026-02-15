# Patrones de Uso de Packing Strategies

Ejemplos prácticos de uso de las estrategias de empaquetado.

## Pattern 1: Basic Packing

El patrón más simple: crear una estrategia, configurar cajas, empaquetar.

```typescript
import {
  MaterialGroupingStrategy,
  BoxFactory,
  PalletFactory
} from '@cristiancosano/pallet-builder'

// 1. Crear estrategia
const strategy = new MaterialGroupingStrategy()

// 2. Crear pallet
const pallet = PalletFactory.euro()

// 3. Crear cajas
const boxes = [
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    {
      product: 'PROD-A',
      materialWeight: 6,
      weight: 15
    }
  ),
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    {
      product: 'PROD-B',
      materialWeight: 3,
      weight: 10
    }
  ),
]

// 4. Empaquetar
const result = strategy.pack(boxes, pallet)

// 5. Verificar resultado
console.log(`Colocadas: ${result.placements.length}/${boxes.length}`)
console.log(`Utilización: ${(result.metrics.volumeUtilization * 100).toFixed(1)}%`)
console.log(`Estabilidad: ${result.metrics.stabilityScore}`)

if (result.unplacedBoxes.length > 0) {
  console.warn(`No colocadas: ${result.unplacedBoxes.length}`)
}
```

---

## Pattern 2: Dynamic Strategy Selection

Seleccionar la estrategia automáticamente según metadatos disponibles.

```typescript
import { defaultRegistry, type Box, type Pallet } from '@cristiancosano/pallet-builder'

function packWithBestStrategy(boxes: Box[], pallet: Pallet) {
  // Analizar metadata disponible
  const hasProductInfo = boxes.some(b => b.product !== undefined)
  const hasMaterialInfo = boxes.some(b => b.materialWeight !== undefined)
  const hasFragile = boxes.some(b => b.fragile === true)
  const hasTypeInfo = boxes.some(b => b.type !== undefined)

  let strategyId: string

  // Decisión basada en metadata
  if (hasProductInfo && hasMaterialInfo) {
    strategyId = 'material-grouping'
    console.log('✓ Using MaterialGroupingStrategy (full metadata)')
  } else if (hasFragile || hasTypeInfo) {
    strategyId = 'type-group'
    console.log('✓ Using TypeGroupStrategy (type/fragile info)')
  } else if (boxes.length > 100) {
    strategyId = 'bin-packing-3d'
    console.log('✓ Using BinPacking3DStrategy (large batch)')
  } else {
    strategyId = 'column'
    console.log('✓ Using ColumnStrategy (fallback)')
  }

  const strategy = defaultRegistry.get(strategyId)
  return strategy.pack(boxes, pallet)
}

// Uso
const boxes = [/* ... */]
const pallet = PalletFactory.euro()
const result = packWithBestStrategy(boxes, pallet)
```

---

## Pattern 3: Multi-Pallet Packing

Empaquetar cajas en múltiples pallets hasta colocar todas.

```typescript
import type { Box, Pallet, PackingResult } from '@cristiancosano/pallet-builder'
import { MaterialGroupingStrategy } from '@cristiancosano/pallet-builder'

function packMultiplePallets(
  boxes: Box[],
  palletTemplate: Pallet
): PackingResult[] {
  const strategy = new MaterialGroupingStrategy()
  const pallets: PackingResult[] = []
  let remainingBoxes = [...boxes]

  let maxPallets = 50 // Límite de seguridad
  let palletNumber = 1

  while (remainingBoxes.length > 0 && palletNumber <= maxPallets) {
    console.log(`\nEmpaquetando pallet ${palletNumber}...`)
    console.log(`Cajas restantes: ${remainingBoxes.length}`)

    const result = strategy.pack(remainingBoxes, palletTemplate)

    if (result.placements.length === 0) {
      console.error('⚠️  No se pueden colocar más cajas')
      console.error(`Cajas sin colocar: ${remainingBoxes.length}`)
      break
    }

    console.log(`✓ Colocadas: ${result.placements.length}`)
    console.log(`  Utilización: ${(result.metrics.volumeUtilization * 100).toFixed(1)}%`)

    pallets.push(result)
    remainingBoxes = result.unplacedBoxes
    palletNumber++
  }

  console.log(`\n✓ Total pallets usados: ${pallets.length}`)
  console.log(`✓ Total cajas colocadas: ${pallets.reduce((sum, p) => sum + p.placements.length, 0)}`)

  return pallets
}

// Uso
const boxes = [/* 200 boxes */]
const pallet = PalletFactory.euro()
const palletResults = packMultiplePallets(boxes, pallet)
```

---

## Pattern 4: Fallback Strategy

Intentar con estrategia primaria, usar fallback si no funcionó.

```typescript
import { defaultRegistry, type Box, type Pallet } from '@cristiancosano/pallet-builder'

function packWithFallback(boxes: Box[], pallet: Pallet) {
  // Intentar con estrategia primaria
  const primaryStrategy = defaultRegistry.get('material-grouping')
  const primaryResult = primaryStrategy.pack(boxes, pallet)

  console.log(`Estrategia primaria: ${primaryResult.placements.length}/${boxes.length} colocadas`)

  // Si no se colocaron todas, intentar con fallback
  if (primaryResult.unplacedBoxes.length > 0) {
    console.log('⚠️  Intentando con estrategia fallback...')

    const fallbackStrategy = defaultRegistry.get('bin-packing-3d')
    const fallbackResult = fallbackStrategy.pack(
      primaryResult.unplacedBoxes,
      pallet
    )

    console.log(`Estrategia fallback: ${fallbackResult.placements.length} adicionales colocadas`)

    // Combinar resultados
    return {
      placements: [...primaryResult.placements, ...fallbackResult.placements],
      metrics: primaryResult.metrics, // Usar métricas del resultado primario
      unplacedBoxes: fallbackResult.unplacedBoxes
    }
  }

  return primaryResult
}
```

---

## Pattern 5: Validation and Quality Checks

Validar calidad del empaquetado antes de aceptarlo.

```typescript
import type { PackingResult } from '@cristiancosano/pallet-builder'

interface PackingQualityReport {
  passed: boolean
  issues: string[]
  warnings: string[]
  result: PackingResult
}

function validatePackingQuality(
  result: PackingResult,
  minUtilization: number = 0.6,
  minStability: number = 70
): PackingQualityReport {
  const issues: string[] = []
  const warnings: string[] = []

  // Validar que todas las cajas fueron colocadas
  if (result.unplacedBoxes.length > 0) {
    issues.push(`${result.unplacedBoxes.length} cajas no pudieron colocarse`)
  }

  // Validar utilización volumétrica
  if (result.metrics.volumeUtilization < minUtilization) {
    warnings.push(
      `Baja utilización: ${(result.metrics.volumeUtilization * 100).toFixed(1)}% ` +
      `(mínimo recomendado: ${minUtilization * 100}%)`
    )
  }

  // Validar estabilidad
  if (result.metrics.stabilityScore < minStability) {
    issues.push(
      `Baja estabilidad: ${result.metrics.stabilityScore} ` +
      `(mínimo requerido: ${minStability})`
    )
  }

  // Validar centro de gravedad
  const cogHeight = result.metrics.centerOfGravity.y
  if (cogHeight > 1000) { // >1m de altura
    warnings.push(`Centro de gravedad alto: ${cogHeight}mm`)
  }

  // Validar peso
  if (result.metrics.weightUtilization > 0.95) {
    warnings.push(
      `Utilización de peso muy alta: ${(result.metrics.weightUtilization * 100).toFixed(1)}%`
    )
  }

  const passed = issues.length === 0

  return {
    passed,
    issues,
    warnings,
    result
  }
}

// Uso
const result = strategy.pack(boxes, pallet)
const quality = validatePackingQuality(result)

if (!quality.passed) {
  console.error('❌ El empaquetado no pasó las validaciones:')
  quality.issues.forEach(issue => console.error(`  - ${issue}`))
}

if (quality.warnings.length > 0) {
  console.warn('⚠️  Advertencias:')
  quality.warnings.forEach(warn => console.warn(`  - ${warn}`))
}

if (quality.passed && quality.warnings.length === 0) {
  console.log('✅ Empaquetado de alta calidad')
}
```

---

## Pattern 6: Custom Strategy

Crear e implementar una estrategia personalizada.

```typescript
import type {
  PackingStrategy,
  PackingResult,
  Box,
  Pallet,
  PlacedBox
} from '@cristiancosano/pallet-builder'
import { PackingRegistry } from '@cristiancosano/pallet-builder'

class PriorityBasedStrategy implements PackingStrategy {
  readonly id = 'priority-based'
  readonly name = 'Priority-Based Packing'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    // 1. Ordenar por prioridad (campo personalizado)
    const sortedBoxes = [...boxes].sort((a, b) => {
      const priorityA = (a as any).priority ?? 5
      const priorityB = (b as any).priority ?? 5
      return priorityB - priorityA // Mayor prioridad primero
    })

    const placements: PlacedBox[] = []
    let currentX = 0
    let currentY = 0
    let currentZ = 0
    let placementId = 0

    // 2. Algoritmo simple: llenar en filas
    for (const box of sortedBoxes) {
      // Verificar si cabe en la posición actual
      if (currentX + box.dimensions.width > pallet.dimensions.width) {
        // Nueva fila
        currentX = 0
        currentZ += box.dimensions.depth

        if (currentZ + box.dimensions.depth > pallet.dimensions.depth) {
          // Nueva capa
          currentZ = 0
          currentY += box.dimensions.height
        }
      }

      // Verificar altura
      if (currentY + box.dimensions.height > pallet.maxStackHeight) {
        break // No caben más cajas
      }

      // Colocar caja
      placements.push({
        id: `placed-${++placementId}`,
        box,
        position: { x: currentX, y: currentY, z: currentZ },
        rotation: { x: 0, y: 0, z: 0 },
        supportedBy: [],
        supporting: []
      })

      currentX += box.dimensions.width
    }

    // 3. Calcular métricas básicas
    const palletVolume =
      pallet.dimensions.width *
      pallet.maxStackHeight *
      pallet.dimensions.depth

    const usedVolume = placements.reduce((sum, p) => {
      const d = p.box.dimensions
      return sum + d.width * d.height * d.depth
    }, 0)

    const unplacedBoxes = boxes.filter(
      box => !placements.some(p => p.box.id === box.id)
    )

    return {
      placements,
      metrics: {
        volumeUtilization: usedVolume / palletVolume,
        weightUtilization: 0.5, // Calcular real si necesario
        centerOfGravity: { x: 0, y: 0, z: 0 }, // Calcular real
        stabilityScore: 80 // Calcular real
      },
      unplacedBoxes
    }
  }
}

// Uso
const registry = new PackingRegistry()
registry.register(new PriorityBasedStrategy())

const customStrategy = registry.get('priority-based')

const boxes = [
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    { priority: 10, weight: 5 } as any // Prioridad alta
  ),
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    { priority: 1, weight: 5 } as any // Prioridad baja
  ),
]

const result = customStrategy.pack(boxes, PalletFactory.euro())
```

---

## Pattern 7: Batch Processing con Progress Tracking

Procesar grandes lotes de órdenes con tracking de progreso.

```typescript
interface Order {
  id: string
  boxes: Box[]
}

interface BatchResult {
  orderId: string
  pallets: PackingResult[]
  totalBoxes: number
  totalPallets: number
  success: boolean
}

async function processBatchOrders(
  orders: Order[],
  palletTemplate: Pallet,
  onProgress?: (current: number, total: number) => void
): Promise<BatchResult[]> {
  const results: BatchResult[] = []
  const strategy = new MaterialGroupingStrategy()

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i]

    // Actualizar progreso
    onProgress?.(i + 1, orders.length)

    console.log(`\nProcesando orden ${order.id} (${i + 1}/${orders.length})`)

    // Empaquetar orden en múltiples pallets
    const pallets: PackingResult[] = []
    let remainingBoxes = [...order.boxes]
    let palletNumber = 1

    while (remainingBoxes.length > 0 && palletNumber <= 10) {
      const result = strategy.pack(remainingBoxes, palletTemplate)

      if (result.placements.length === 0) {
        console.error(`  ⚠️  No se pueden colocar ${remainingBoxes.length} cajas`)
        break
      }

      pallets.push(result)
      remainingBoxes = result.unplacedBoxes
      palletNumber++
    }

    const success = remainingBoxes.length === 0

    results.push({
      orderId: order.id,
      pallets,
      totalBoxes: order.boxes.length,
      totalPallets: pallets.length,
      success
    })

    console.log(`  ✓ Pallets: ${pallets.length}, Éxito: ${success}`)
  }

  return results
}

// Uso
const orders: Order[] = [
  { id: 'ORD-001', boxes: [/* ... */] },
  { id: 'ORD-002', boxes: [/* ... */] },
  // ... más órdenes
]

const results = await processBatchOrders(
  orders,
  PalletFactory.euro(),
  (current, total) => {
    console.log(`Progreso: ${current}/${total} (${((current / total) * 100).toFixed(1)}%)`)
  }
)

// Resumen
const successfulOrders = results.filter(r => r.success).length
const totalPallets = results.reduce((sum, r) => sum + r.totalPallets, 0)

console.log(`\n=== RESUMEN ===`)
console.log(`Órdenes procesadas: ${results.length}`)
console.log(`Órdenes exitosas: ${successfulOrders}`)
console.log(`Total pallets usados: ${totalPallets}`)
```

---

## Pattern 8: Comparación de Estrategias

Comparar múltiples estrategias y elegir la mejor.

```typescript
import { defaultRegistry, type Box, type Pallet } from '@cristiancosano/pallet-builder'

interface StrategyComparison {
  strategyId: string
  strategyName: string
  result: PackingResult
  score: number
}

function compareStrategies(boxes: Box[], pallet: Pallet): StrategyComparison[] {
  const strategies = defaultRegistry.list()
  const comparisons: StrategyComparison[] = []

  for (const strategy of strategies) {
    console.log(`\nProbando ${strategy.name}...`)

    const startTime = performance.now()
    const result = strategy.pack(boxes, pallet)
    const elapsed = performance.now() - startTime

    // Calcular score (peso ponderado de métricas)
    const placedRatio = result.placements.length / boxes.length
    const utilization = result.metrics.volumeUtilization
    const stability = result.metrics.stabilityScore / 100

    const score =
      placedRatio * 0.4 +        // 40% peso en cajas colocadas
      utilization * 0.3 +         // 30% peso en utilización
      stability * 0.2 +           // 20% peso en estabilidad
      (elapsed < 100 ? 0.1 : 0)  // 10% bonus si es rápido

    comparisons.push({
      strategyId: strategy.id,
      strategyName: strategy.name,
      result,
      score
    })

    console.log(`  Colocadas: ${result.placements.length}/${boxes.length}`)
    console.log(`  Utilización: ${(utilization * 100).toFixed(1)}%`)
    console.log(`  Estabilidad: ${result.metrics.stabilityScore}`)
    console.log(`  Tiempo: ${elapsed.toFixed(1)}ms`)
    console.log(`  Score: ${(score * 100).toFixed(1)}`)
  }

  // Ordenar por score (descendente)
  return comparisons.sort((a, b) => b.score - a.score)
}

// Uso
const boxes = [/* ... */]
const pallet = PalletFactory.euro()

const comparisons = compareStrategies(boxes, pallet)

console.log('\n=== RANKING ===')
comparisons.forEach((comp, i) => {
  console.log(`${i + 1}. ${comp.strategyName} (score: ${(comp.score * 100).toFixed(1)})`)
})

// Usar la mejor estrategia
const bestStrategy = defaultRegistry.get(comparisons[0].strategyId)
console.log(`\n✓ Mejor estrategia: ${comparisons[0].strategyName}`)
```

---

## Resumen de Patrones

| Patrón | Caso de Uso |
|--------|-------------|
| **Basic Packing** | Uso simple, una sola estrategia |
| **Dynamic Selection** | Selección automática según metadata |
| **Multi-Pallet** | Muchas cajas que no caben en un pallet |
| **Fallback Strategy** | Intentar primaria, usar backup si falla |
| **Validation** | Asegurar calidad del empaquetado |
| **Custom Strategy** | Requisitos únicos no cubiertos |
| **Batch Processing** | Procesar muchas órdenes con progreso |
| **Strategy Comparison** | Benchmarking y selección de mejor opción |

Estos patrones pueden combinarse según las necesidades específicas de tu aplicación.
