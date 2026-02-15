# Guía de Selección de Estrategia de Empaquetado

Esta guía te ayudará a elegir la estrategia de empaquetado más apropiada para tu caso de uso.

## Comparación Rápida

| Strategy | Utilización | Estabilidad | Product Grouping | Velocidad | Complejidad |
|----------|------------|-------------|------------------|-----------|-------------|
| **MaterialGroupingStrategy** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Alta |
| **BinPacking3DStrategy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ | ⭐⭐⭐⭐ | Media |
| **TypeGroupStrategy** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | Baja |
| **ColumnStrategy** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Muy Baja |

---

## Casos de Uso

### 🏭 Operaciones de Almacén

**Requisitos**:
- Agrupación por producto para picking eficiente
- Materiales resistentes en la base (estabilidad)
- Organización clara y predecible
- Balance entre utilización y operatividad

**Estrategia recomendada**: **MaterialGroupingStrategy**

**Razón**:
- ✅ Columnas verticales por producto (fácil picking)
- ✅ Material weight ordering (estabilidad máxima)
- ✅ Validación de soporte y footprint
- ✅ Construcción por capas predecible

**Configuración de boxes**:
```typescript
const boxes = [
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    {
      product: 'PROD-A',        // Requerido para agrupación
      materialWeight: 6,        // Requerido para ordenación
      weight: 15,
      sku: 'SKU-001'
    }
  )
]
```

---

### 📦 Maximización de Espacio (Transporte)

**Requisitos**:
- Maximizar número de cajas por pallet
- Minimizar número de pallets
- Costo de transporte optimizado
- Agrupación no es crítica

**Estrategia recomendada**: **BinPacking3DStrategy**

**Razón**:
- ✅ Mayor utilización volumétrica (80-90%)
- ✅ Rápido
- ✅ Efectivo para cajas de tamaños similares
- ⚠️ Puede crear configuraciones menos estables

**Cuándo usarla**:
- Transporte de larga distancia (costo > operatividad)
- Cajas de tamaños uniformes
- No hay operaciones de picking en destino
- Palets completos se descargan de una vez

---

### 🏷️ Agrupación Simple por Tipo

**Requisitos**:
- Agrupar por tipo de producto
- Proteger items frágiles (arriba)
- Simplicidad y predictibilidad
- No hay metadata de material weight

**Estrategia recomendada**: **TypeGroupStrategy**

**Razón**:
- ✅ Simple y fácil de entender
- ✅ Frágiles automáticamente en la parte superior
- ✅ Rápido
- ⚠️ Menor utilización que MaterialGroupingStrategy

**Configuración de boxes**:
```typescript
const boxes = [
  BoxFactory.create(
    { width: 600, height: 400, depth: 400 },
    {
      type: 'electronics',
      fragile: true,
      weight: 5
    }
  )
]
```

---

### 📊 Layout Predecible y Simple

**Requisitos**:
- Layout muy simple y entendible
- Cada SKU en su propia columna vertical
- Facilidad de comprensión > eficiencia
- Operadores con poca experiencia

**Estrategia recomendada**: **ColumnStrategy**

**Razón**:
- ✅ Muy simple de visualizar y entender
- ✅ Una columna vertical por SKU/tipo
- ✅ Rápido
- ❌ Pobre utilización de espacio (40-60%)

**Cuándo usarla**:
- Prioridad absoluta en simplicidad
- Número pequeño de SKUs diferentes
- Espacio no es limitante
- Entrenamiento mínimo de operadores

---

## Árbol de Decisión

```
┌─ ¿Tienes metadata de materialWeight y product?
│  ├─ Sí → ¿Es crítica la agrupación por producto?
│  │      ├─ Sí → MaterialGroupingStrategy
│  │      └─ No → BinPacking3DStrategy
│  └─ No → ¿Tienes al menos el campo type?
│         ├─ Sí → ¿Hay items frágiles?
│         │      ├─ Sí → TypeGroupStrategy
│         │      └─ No → BinPacking3DStrategy
│         └─ No → ColumnStrategy (fallback)
```

---

## Configuración de Boxes para Máximo Rendimiento

### MaterialGroupingStrategy

```typescript
const optimizedBox = BoxFactory.create(
  { width: 600, height: 400, depth: 400 },
  {
    // REQUERIDO
    weight: 15,

    // ALTAMENTE RECOMENDADO
    product: 'PROD-A',           // Para columnas verticales
    materialWeight: 6,           // Para estabilidad (0-10)

    // OPCIONAL pero útil
    sku: 'SKU-001',             // Para trazabilidad
    type: 'electronics',         // Para categorización
    fragile: false,              // Para flags especiales
    maxStackWeight: 50,          // Para validación de peso
    color: '#FF0000'             // Para visualización
  }
)
```

**Escala de materialWeight**:
```
10 ─── Máxima resistencia (contenedores metálicos, cajas reforzadas)
 8 ─── Alta resistencia (plástico industrial)
 6 ─── Media-alta (plástico estándar) ← Recomendado para cajas estándar
 5 ─── Media (default)
 3 ─── Media-baja (madera, cartón)
 0 ─── Frágil (corcho, espuma)
```

---

## Best Practices

### 1. Validar Resultados

Siempre valida los resultados del empaquetado:

```typescript
const result = strategy.pack(boxes, pallet)

// ¿Se colocaron todas las cajas?
if (result.unplacedBoxes.length > 0) {
  console.warn(`No se pudieron colocar ${result.unplacedBoxes.length} cajas`)
  // Considerar usar un segundo pallet o estrategia diferente
}

// ¿Es aceptable la utilización?
if (result.metrics.volumeUtilization < 0.6) {
  console.warn('Baja utilización volumétrica')
  // Considerar estrategia diferente o dimensiones de caja
}

// ¿Es estable el empaquetado?
if (result.metrics.stabilityScore < 70) {
  console.warn('Puntuación de estabilidad baja')
  // Revisar distribución de peso o usar MaterialGroupingStrategy
}
```

### 2. Selección Dinámica de Estrategia

Selecciona la estrategia en función de los metadatos disponibles:

```typescript
function selectBestStrategy(boxes: Box[]): PackingStrategy {
  const hasProductInfo = boxes.some(b => b.product !== undefined)
  const hasMaterialInfo = boxes.some(b => b.materialWeight !== undefined)
  const hasFragile = boxes.some(b => b.fragile === true)

  if (hasProductInfo && hasMaterialInfo) {
    return defaultRegistry.get('material-grouping')
  }

  if (hasFragile) {
    return defaultRegistry.get('type-group')
  }

  if (boxes.length > 100) {
    return defaultRegistry.get('bin-packing-3d')
  }

  return defaultRegistry.get('column')
}
```

### 3. Manejo de Cajas No Colocadas

```typescript
function packWithFallback(boxes: Box[], pallet: Pallet): PackingResult {
  const primaryStrategy = defaultRegistry.get('material-grouping')
  const result = primaryStrategy.pack(boxes, pallet)

  if (result.unplacedBoxes.length > 0) {
    console.log('Intentando con estrategia alternativa...')

    const fallbackStrategy = defaultRegistry.get('bin-packing-3d')
    const fallbackResult = fallbackStrategy.pack(result.unplacedBoxes, pallet)

    return {
      placements: [...result.placements, ...fallbackResult.placements],
      metrics: result.metrics, // Usar métricas del resultado primario
      unplacedBoxes: fallbackResult.unplacedBoxes
    }
  }

  return result
}
```

### 4. Empaquetado Multi-Pallet

```typescript
function packMultiplePallets(boxes: Box[], palletTemplate: Pallet): PackingResult[] {
  const strategy = defaultRegistry.get('material-grouping')
  const pallets: PackingResult[] = []
  let remainingBoxes = [...boxes]

  let maxIterations = 10 // Prevenir loops infinitos
  while (remainingBoxes.length > 0 && maxIterations-- > 0) {
    const result = strategy.pack(remainingBoxes, palletTemplate)

    if (result.placements.length === 0) {
      console.error(`No se pueden colocar ${remainingBoxes.length} cajas`)
      break
    }

    pallets.push(result)
    remainingBoxes = result.unplacedBoxes
  }

  console.log(`Se usaron ${pallets.length} pallets para ${boxes.length} cajas`)
  return pallets
}
```

---

## Troubleshooting

### Problema: Baja utilización (<50%)

**Causas posibles**:
- Dimensiones de caja no compatibles con dimensiones del pallet
- Demasiadas alturas diferentes creando huecos
- Material weight forzando layouts ineficientes

**Soluciones**:
1. Usar cajas con dimensiones que sean divisores de las dimensiones del pallet
   - Pallet Euro (800×1200mm): Usar cajas de 400×600mm, 400×400mm
   - Pallet American (1000×1200mm): Usar cajas de 500×600mm, 400×400mm
2. Agrupar cajas por altura antes de empaquetar
3. Probar `BinPacking3DStrategy` si el material ordering no es crítico
4. Ajustar `materialWeight` para permitir más flexibilidad

### Problema: Cajas no agrupadas por producto

**Causas posibles**:
- Campo `product` no definido en las cajas
- Pallet demasiado pequeño para crear columnas distintas
- Material weight forzando orden diferente

**Soluciones**:
1. Asegurar que todas las cajas tienen `product` definido
2. Usar pallets más grandes
3. Ajustar `materialWeight` para productos que puedan compartir capas

### Problema: Empaquetado inestable

**Causas posibles**:
- Cajas frágiles en la base
- Cajas pesadas sobre cajas ligeras
- Centro de gravedad demasiado alto o descentrado

**Soluciones**:
1. Usar `MaterialGroupingStrategy` con `materialWeight` apropiado
2. Marcar cajas delicadas con `fragile: true`
3. Verificar `stabilityScore` en métricas:
   ```typescript
   if (result.metrics.stabilityScore < 70) {
     // Rechazar este empaquetado
     // Intentar con configuración diferente
   }
   ```
4. Revisar distribución de `materialWeight`:
   - Cajas pesadas (weight alto) → materialWeight alto
   - Cajas ligeras/frágiles → materialWeight bajo

### Problema: Performance lenta con muchas cajas

**Causas**:
- Algoritmo complejo (MaterialGroupingStrategy, BinPacking3D)
- Gran número de productos diferentes
- Muchas rotaciones probadas

**Soluciones**:
1. Para >500 cajas, considerar `ColumnStrategy` si la simplicidad es aceptable
2. Pre-procesar cajas para reducir variedad
3. Limitar rotaciones si es posible
4. Hacer empaquetado en background/web worker

---

## Ejemplos de Casos Reales

### Ejemplo 1: Almacén de E-Commerce

**Contexto**:
- 50-200 órdenes/día
- 10-30 productos diferentes
- Picking frecuente durante el día
- Mezcla de productos frágiles y resistentes

**Estrategia**: `MaterialGroupingStrategy`

**Configuración**:
```typescript
const strategy = new MaterialGroupingStrategy()

// Productos electrónicos (frágiles)
const electronics = BoxFactory.create(
  { width: 400, height: 300, depth: 300 },
  { product: 'ELECTRONICS', materialWeight: 0, fragile: true }
)

// Productos en plástico (resistentes)
const plastic = BoxFactory.create(
  { width: 600, height: 400, depth: 400 },
  { product: 'HOUSEHOLD', materialWeight: 6, fragile: false }
)
```

**Resultado**: Electrónicos arriba en columnas, household abajo, fácil picking.

---

### Ejemplo 2: Transporte de Larga Distancia

**Contexto**:
- Minimizar pallets
- Cajas de tamaño uniforme
- No hay picking intermedio
- Costo de transporte alto

**Estrategia**: `BinPacking3DStrategy`

**Configuración**:
```typescript
const strategy = new BinPacking3DStrategy()
const result = strategy.pack(uniformBoxes, pallet)

console.log(`Utilización: ${result.metrics.volumeUtilization * 100}%`)
// Esperado: 80-85%
```

---

## Resumen

| Caso de Uso | Estrategia | Prioridad |
|-------------|-----------|-----------|
| **Almacén con picking** | MaterialGroupingStrategy | Agrupación + Estabilidad |
| **Transporte (max cajas)** | BinPacking3DStrategy | Utilización |
| **Agrupación simple + frágiles** | TypeGroupStrategy | Simplicidad + Protección |
| **Layout muy simple** | ColumnStrategy | Predictibilidad |

**Regla general**: Cuando tengas dudas, empieza con `MaterialGroupingStrategy` si tienes metadata, o `TypeGroupStrategy` si no la tienes.
