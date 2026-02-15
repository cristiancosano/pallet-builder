# Algoritmos de Empaquetado

Este documento describe los algoritmos de empaquetado disponibles en Pallet Builder desde la perspectiva del dominio logístico.

## MaterialGroupingStrategy

**Propósito**: Empaquetado optimizado para operaciones de almacén con requisitos de estabilidad, agrupación por producto y organización por resistencia de material.

### Algoritmo

#### Fase 1: Ordenación Multi-Criterio

Los boxes se ordenan por:
1. **Material Weight** (descendente) - Materiales más resistentes primero
2. **Product** (alfabético) - Agrupación de productos
3. **Base Area** (descendente) - Cajas más grandes primero
4. **Height** (descendente) - Cajas más altas primero

```typescript
function sortBoxes(boxes: Box[]): Box[] {
  return boxes.sort((a, b) => {
    // 1. Material weight (desc): más resistente = más abajo en el pallet
    if (a.materialWeight !== b.materialWeight) {
      return b.materialWeight - a.materialWeight
    }
    // 2. Product (asc): agrupar mismo producto
    if (a.product !== b.product) {
      return a.product.localeCompare(b.product)
    }
    // 3. Base area (desc): cajas grandes primero
    const areaA = a.dimensions.width * a.dimensions.depth
    const areaB = b.dimensions.width * b.dimensions.depth
    if (areaA !== areaB) {
      return areaB - areaA
    }
    // 4. Height (desc): cajas altas primero
    return b.dimensions.height - a.dimensions.height
  })
}
```

#### Fase 2: Construcción por Capas (Layers)

El pallet se construye en capas horizontales de abajo hacia arriba:

1. **Estrategia de capas uniformes** (preferida)
   - Intentar crear capas donde todas las cajas tienen la misma altura
   - Objetivo: 95%+ de cobertura del área del pallet

2. **Estrategia de capas mixtas** (fallback)
   - Permitir diferentes alturas en la misma capa
   - Objetivo: 95%+ de cobertura

3. **Cobertura parcial** (último recurso)
   - Aceptar capas con menos del 95% de cobertura
   - Usar la mejor opción disponible

#### Fase 3: Maximal Rectangles 2D Packing

Dentro de cada capa, se usa el algoritmo **Maximal Rectangles** para colocar cajas:

**Inicialización**:
```
freeRectangles = [{ x: 0, z: 0, width: palletWidth, depth: palletDepth }]
```

**Para cada caja**:
1. Encontrar el mejor rectángulo libre que pueda contener la caja
2. Validar soporte (>=70% de la base apoyada)
3. Validar footprint (no exceder límites de capa inferior)
4. Colocar la caja
5. Actualizar rectángulos libres:
   - Eliminar rectángulos intersectados
   - Generar nuevos rectángulos de las subdivisiones
   - Eliminar rectángulos contenidos dentro de otros

**Generación de nuevos rectángulos**:
```
Si el rectángulo R se intersecta con la caja colocada:
  - Rectángulo izquierdo: [R.x, R.z, cajaX - R.x, R.depth]
  - Rectángulo derecho: [cajaX + cajaWidth, R.z, R.right - (cajaX + cajaWidth), R.depth]
  - Rectángulo superior: [R.x, R.z, R.width, cajaZ - R.z]
  - Rectángulo inferior: [R.x, cajaZ + cajaDepth, R.width, R.bottom - (cajaZ + cajaDepth)]
```

#### Fase 4: Sistema de Scoring

Al elegir el mejor rectángulo para una caja, se calcula un score:

```typescript
Score Calculation:
  +100  si la posición continúa una columna de producto (mismo product abajo)
  -50   si la posición mezcla productos (diferente product abajo)
  +50   para best fit (minimiza área desperdiciada)
  +30   para preferencia bottom-left (más estable)
```

**Fórmula**:
```typescript
function scoreRectangle(rect, box, occupiedColumns, product) {
  let score = 0
  const columnKey = `${rect.x},${rect.z}`

  // Continuación de columna
  if (occupiedColumns.get(columnKey) === product) {
    score += 100
  }

  // Mezcla de columna
  if (occupiedColumns.has(columnKey) && occupiedColumns.get(columnKey) !== product) {
    score -= 50
  }

  // Best fit
  const wastedArea = rect.width * rect.depth - box.width * box.depth
  score += 50 / (1 + wastedArea / 10000)

  // Bottom-left
  score += 30 / (1 + rect.x / 1000 + rect.z / 1000)

  return score
}
```

### Validaciones de Estabilidad

#### 1. Validación de Soporte (70% Rule)

Cada caja en una capa superior debe tener al menos el 70% de su base apoyada en cajas de la capa directamente inferior.

```typescript
function calculateSupportArea(
  x, z, width, depth,
  currentY,
  existingPlacements,
  pallet
): number {
  // Nivel del suelo: 100% soporte
  if (currentY === 0) {
    return width * depth
  }

  let supportedArea = 0

  // Encontrar cajas en la capa directamente inferior
  const boxesBelow = existingPlacements.filter(p => {
    const boxTop = p.position.y + p.box.dimensions.height
    return Math.abs(boxTop - currentY) <= 1mm
  })

  // Calcular intersección con cada caja de abajo
  for (const placement of boxesBelow) {
    const intersection = calculateRectangleIntersection(
      x, z, width, depth,
      placement.position.x, placement.position.z, placement.width, placement.depth
    )
    supportedArea += intersection
  }

  return supportedArea
}

// Validación
const supportPercentage = supportArea / boxBaseArea
if (supportPercentage < 0.7) {
  // Rechazar esta posición
}
```

#### 2. Validación de Footprint

Las cajas en capas superiores no pueden extenderse más allá del bounding box de la capa directamente inferior.

**Regla**: "Siempre hay que intentar ocupar la capa inferior, y usarla como base"

```typescript
function boxExtendsBeyondLowerLayer(
  x, z, width, depth,
  currentY,
  existingPlacements
): boolean {
  // Nivel del suelo: sin restricción
  if (currentY === 0) {
    return false
  }

  // Encontrar cajas en la capa directamente inferior
  const boxesBelow = existingPlacements.filter(p => {
    const boxTop = p.position.y + p.box.dimensions.height
    return Math.abs(boxTop - currentY) <= 1mm
  })

  if (boxesBelow.length === 0) {
    return true // Rechazar: no hay base
  }

  // Calcular bounding box de la capa inferior
  let minX = Infinity, maxX = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (const p of boxesBelow) {
    minX = Math.min(minX, p.position.x)
    maxX = Math.max(maxX, p.position.x + p.width)
    minZ = Math.min(minZ, p.position.z)
    maxZ = Math.max(maxZ, p.position.z + p.depth)
  }

  // Verificar si la caja se extiende más allá
  const extendsBeyond =
    x < minX - 1mm ||
    x + width > maxX + 1mm ||
    z < minZ - 1mm ||
    z + depth > maxZ + 1mm

  return extendsBeyond
}
```

**Efecto**:
- ✅ Fuerza a llenar la capa inferior antes de apilar
- ✅ Previene cajas "colgadas" que sobresalen de la base
- ✅ Mejora la estabilidad estructural
- ✅ Maximiza el uso de cada capa

### Material Weight Scale

Sistema de 0-10 para clasificar la resistencia del material:

```
10 ─── Máxima resistencia (contenedores reforzados, metal pesado)
 ↑
 8 ─── Alta resistencia (plástico industrial, metal)
 ↑
 6 ─── Resistencia media-alta (plástico estándar)
 ↑
 5 ─── Resistencia media (default)
 ↑
 3 ─── Resistencia media-baja (madera, cartón grueso)
 ↑
 0 ─── Frágil (corcho, espuma, cartón fino)
```

**Uso**:
- Valores altos (8-10): Se colocan en capas inferiores (soportan peso)
- Valores medios (4-6): Se colocan en capas medias
- Valores bajos (0-3): Se colocan en capas superiores (no soportan peso)

### Product Grouping

Las cajas con el mismo valor de `product` se agrupan en **columnas verticales**:

```
Vista superior del pallet:

┌─────────────────────────────┐
│ [A] [A] [B] [B] [C] [C] [C] │  Capa 3
│ [A] [A] [B] [B] [C] [C] [C] │  Capa 2
│ [A] [A] [B] [B] [C] [C] [C] │  Capa 1
└─────────────────────────────┘
  Col1 Col2 Col3 Col4 ...

Producto A: Columnas 1-2 (fácil extraer todas las cajas de A)
Producto B: Columnas 3-4 (fácil extraer todas las cajas de B)
Producto C: Columnas 5-7 (fácil extraer todas las cajas de C)
```

**Beneficios**:
- Facilita operaciones de picking
- Reduce tiempo de extracción de productos
- Mejora organización del almacén

---

## BinPacking3DStrategy

**Propósito**: Maximizar la utilización volumétrica del pallet sin restricciones de agrupación.

### Algoritmo

1. **First Fit Decreasing por volumen**
   - Ordenar cajas por volumen (descendente)

2. **Particionamiento 3D con Extreme Points**
   - Mantener lista de puntos extremos disponibles
   - Para cada caja, encontrar el punto extremo más cercano al origen
   - Colocar la caja y actualizar puntos extremos

3. **Rotaciones**
   - Probar 2 rotaciones (0° y 90° en eje Y)
   - Seleccionar la que mejor se ajuste

### Características

- ✅ Alta utilización volumétrica (75-90%)
- ✅ Rápido (O(n²))
- ⚠️ No garantiza estabilidad
- ❌ No agrupa por producto
- ❌ No considera material weight

---

## TypeGroupStrategy

**Propósito**: Agrupación simple por tipo de caja con frágiles arriba.

### Algoritmo

1. **Agrupación por tipo**
   - Agrupar cajas por `box.type`

2. **Ordenación**
   - Tipo (alfabético)
   - Fragile flag (frágiles al final)
   - Weight (pesadas primero)

3. **Llenado por capas**
   - Llenar cada capa con cajas del mismo tipo
   - Cambiar de tipo cuando no caben más

### Características

- ✅ Simple y predecible
- ✅ Frágiles en la parte superior
- ⚠️ Puede dejar huecos entre grupos
- ⚠️ Menor eficiencia que MaterialGroupingStrategy

---

## ColumnStrategy

**Propósito**: Apilamiento vertical simple por SKU/tipo.

### Algoritmo

1. **Agrupación**
   - Agrupar por `box.type` o `box.sku`

2. **Apilamiento vertical**
   - Crear una columna vertical por grupo
   - Llenar en profundidad (Z), luego altura (Y)

3. **Sin optimización espacial**
   - No intenta maximizar uso de espacio
   - Layout muy predecible

### Características

- ✅ Muy simple
- ✅ Layout predecible
- ✅ Rápido (O(n))
- ❌ Pobre utilización de espacio (40-60%)
- ❌ Desperdicia espacio horizontal

---

## Performance Characteristics

Benchmarks en laptop típico (aproximados):

| Strategy | 10 boxes | 50 boxes | 100 boxes | 500 boxes | Complejidad |
|----------|----------|----------|-----------|-----------|-------------|
| **MaterialGroupingStrategy** | <10ms | <50ms | <100ms | <500ms | O(n² log n) |
| **BinPacking3DStrategy** | <5ms | <30ms | <70ms | <400ms | O(n²) |
| **TypeGroupStrategy** | <5ms | <20ms | <50ms | <300ms | O(n log n) |
| **ColumnStrategy** | <5ms | <15ms | <40ms | <250ms | O(n) |

**Factores que afectan performance**:
- Número de productos diferentes (afecta a MaterialGroupingStrategy)
- Variedad de dimensiones (afecta a Maximal Rectangles)
- Tamaño del pallet
- Número de rotaciones permitidas

---

## Comparación de Algoritmos

| Característica | MaterialGrouping | BinPacking3D | TypeGroup | Column |
|----------------|------------------|--------------|-----------|--------|
| **Utilización volumétrica** | 75-85% | 80-90% | 65-75% | 40-60% |
| **Estabilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Product grouping** | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Material ordering** | ⭐⭐⭐⭐⭐ | ❌ | ⚠️ | ❌ |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Complejidad** | Alta | Media | Baja | Muy Baja |
| **Picking efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**Cuándo usar cada uno**:

- **MaterialGroupingStrategy**: Operaciones de almacén, picking, estabilidad crítica
- **BinPacking3DStrategy**: Maximizar espacio, sin requisitos de agrupación
- **TypeGroupStrategy**: Agrupación simple por tipo, frágiles protegidos
- **ColumnStrategy**: Simplicidad y predictibilidad sobre eficiencia

---

## Referencias

- Jukka Jylänki - "A Thousand Ways to Pack the Bin - A Practical Approach to Two-Dimensional Rectangle Bin Packing"
- Maximal Rectangles Algorithm: [http://clb.demon.fi/files/RectangleBinPack.pdf](http://clb.demon.fi/files/RectangleBinPack.pdf)
- First Fit Decreasing: Algoritmo clásico de bin packing
- Extreme Points: Crainic, Perboli, Tadei (2008)
