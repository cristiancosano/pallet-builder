# Reglas de Negocio

Las reglas de negocio definen las restricciones y validaciones que debe cumplir el sistema. Son invariantes del dominio que SIEMPRE deben respetarse.

## 🎯 Categorías de Reglas

### 1. Restricciones Físicas
### 2. Restricciones de Peso
### 3. Restricciones de Apilamiento
### 4. Restricciones de Compatibilidad
### 5. Restricciones de Estabilidad

---

## 1️⃣ Restricciones Físicas

### BR-001: Límites del Pallet

**Regla**: Ningún objeto puede extenderse fuera de los límites físicos del pallet.

**Razón**: Los objetos que sobresalen pueden caerse durante el transporte.

**Validación**:
```typescript
function validatePhysicalBounds(
  pallet: Pallet,
  object: PlacedObject
): ValidationResult {
  const palletBounds = pallet.dimensions
  const objectBounds = object.bounds
  
  const violations: string[] = []
  
  // Verificar eje X
  if (objectBounds.minX < -palletBounds.width / 2 ||
      objectBounds.maxX > palletBounds.width / 2) {
    violations.push('Object extends beyond pallet width (X axis)')
  }
  
  // Verificar eje Z
  if (objectBounds.minZ < -palletBounds.depth / 2 ||
      objectBounds.maxZ > palletBounds.depth / 2) {
    violations.push('Object extends beyond pallet depth (Z axis)')
  }
  
  // Verificar eje Y (altura)
  if (objectBounds.minY < 0) {
    violations.push('Object penetrates pallet base')
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}
```

### BR-002: Sin Colisiones

**Regla**: Dos objetos no pueden ocupar el mismo espacio.

**Razón**: Imposibilidad física.

**Validación**:
```typescript
function validateNoCollisions(
  placedObjects: PlacedObject[]
): ValidationResult {
  const violations: string[] = []
  
  for (let i = 0; i < placedObjects.length; i++) {
    for (let j = i + 1; j < placedObjects.length; j++) {
      if (checkAABBCollision(
        placedObjects[i].bounds,
        placedObjects[j].bounds
      )) {
        violations.push(
          `Collision detected between objects ${placedObjects[i].id} and ${placedObjects[j].id}`
        )
      }
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

function checkAABBCollision(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.minX <= b.maxX && a.maxX >= b.minX &&
    a.minY <= b.maxY && a.maxY >= b.minY &&
    a.minZ <= b.maxZ && a.maxZ >= b.minZ
  )
}
```

### BR-003: Altura Máxima

**Regla**: La configuración completa no puede exceder la altura máxima permitida del pallet.

**Razón**: Restricciones de almacenamiento y transporte (ej: altura de puertas, racks).

**Parámetros**:
- Altura máxima típica: 2000mm
- Puede variar según normativa

**Validación**:
```typescript
function validateMaxHeight(
  pallet: Pallet,
  placedObjects: PlacedObject[]
): ValidationResult {
  const maxHeight = pallet.maxHeight
  const currentHeight = Math.max(
    ...placedObjects.map(obj => obj.bounds.maxY)
  )
  
  if (currentHeight > maxHeight) {
    return {
      isValid: false,
      violations: [
        `Configuration height (${currentHeight}mm) exceeds maximum allowed (${maxHeight}mm)`
      ]
    }
  }
  
  return { isValid: true, violations: [] }
}
```

---

## 2️⃣ Restricciones de Peso

### BR-101: Capacidad Máxima del Pallet

**Regla**: El peso total de todos los objetos no puede exceder la capacidad de carga del pallet.

**Razón**: Integridad estructural del pallet y seguridad.

**Parámetros**:
- EUR Pallet: 1000 kg
- American Pallet: 1200 kg
- Factor de seguridad: 0.9 (usar 90% de capacidad máxima)

**Validación**:
```typescript
function validateMaxWeight(
  pallet: Pallet,
  objects: PackableObject[]
): ValidationResult {
  const totalWeight = objects.reduce(
    (sum, obj) => sum + obj.weight,
    0
  )
  
  const maxWeight = pallet.maxWeight
  const safeMaxWeight = maxWeight * 0.9 // Factor de seguridad
  
  const violations: string[] = []
  
  if (totalWeight > maxWeight) {
    violations.push(
      `Total weight (${totalWeight}kg) exceeds pallet capacity (${maxWeight}kg)`
    )
  } else if (totalWeight > safeMaxWeight) {
    violations.push(
      `Warning: Total weight (${totalWeight}kg) exceeds recommended safe load (${safeMaxWeight}kg)`
    )
  }
  
  return {
    isValid: totalWeight <= maxWeight,
    violations
  }
}
```

### BR-102: Distribución de Peso

**Regla**: El peso debe estar razonablemente distribuido para evitar desbalance.

**Razón**: Prevenir volcamiento durante manipulación.

**Criterios**:
- Centro de gravedad dentro del tercio central del pallet
- Máxima diferencia de peso entre cuadrantes: 30%

**Validación**:
```typescript
function validateWeightDistribution(
  pallet: Pallet,
  placedObjects: PlacedObject[]
): ValidationResult {
  const centerOfGravity = calculateCenterOfGravity(placedObjects)
  const palletCenter = pallet.dimensions.center
  
  const maxOffset = pallet.dimensions.width / 6 // 1/6 del ancho
  
  const offsetX = Math.abs(centerOfGravity.x - palletCenter.x)
  const offsetZ = Math.abs(centerOfGravity.z - palletCenter.z)
  
  const violations: string[] = []
  
  if (offsetX > maxOffset) {
    violations.push(
      `Center of gravity offset in X axis (${offsetX}mm) exceeds safe limit (${maxOffset}mm)`
    )
  }
  
  if (offsetZ > maxOffset) {
    violations.push(
      `Center of gravity offset in Z axis (${offsetZ}mm) exceeds safe limit (${maxOffset}mm)`
    )
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}

function calculateCenterOfGravity(
  objects: PlacedObject[]
): Point3D {
  let totalWeight = 0
  let weightedX = 0
  let weightedY = 0
  let weightedZ = 0
  
  objects.forEach(obj => {
    const weight = obj.object.weight
    totalWeight += weight
    
    weightedX += obj.position.x * weight
    weightedY += obj.position.y * weight
    weightedZ += obj.position.z * weight
  })
  
  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight,
    z: weightedZ / totalWeight
  }
}
```

---

## 3️⃣ Restricciones de Apilamiento

### BR-201: Capacidad de Soporte

**Regla**: Un objeto solo puede apilar sobre sí el peso que su `maxStackWeight` permita.

**Razón**: Prevenir aplastamiento de objetos.

**Validación**:
```typescript
function validateStackingCapacity(
  bottomObject: PackableObject,
  objectsAbove: PackableObject[]
): ValidationResult {
  if (!bottomObject.stackable) {
    return {
      isValid: false,
      violations: [`Object ${bottomObject.id} is not stackable`]
    }
  }
  
  const weightAbove = objectsAbove.reduce(
    (sum, obj) => sum + obj.weight,
    0
  )
  
  if (bottomObject.maxStackWeight === undefined) {
    return { isValid: true, violations: [] } // Sin límite
  }
  
  if (weightAbove > bottomObject.maxStackWeight) {
    return {
      isValid: false,
      violations: [
        `Weight above (${weightAbove}kg) exceeds stacking capacity (${bottomObject.maxStackWeight}kg)`
      ]
    }
  }
  
  return { isValid: true, violations: [] }
}
```

### BR-202: Soporte Adecuado

**Regla**: Todo objeto debe tener soporte debajo (otro objeto u el pallet mismo).

**Razón**: Gravedad - los objetos no pueden flotar.

**Criterios**:
- Objeto está en la base (Y ≈ 0), O
- Al menos 60% del área base tiene soporte debajo

**Validación**:
```typescript
function validateSupport(
  object: PlacedObject,
  allObjects: PlacedObject[]
): ValidationResult {
  // Si está en la base, es válido
  if (object.position.y <= 0.01) {
    return { isValid: true, violations: [] }
  }
  
  // Buscar objetos debajo
  const objectsBelow = allObjects.filter(other => 
    other.id !== object.id &&
    other.bounds.maxY <= object.bounds.minY + 0.01 // tolerance
  )
  
  const supportArea = calculateSupportArea(object, objectsBelow)
  const objectBaseArea = object.object.dimensions.width * 
                         object.object.dimensions.depth
  
  const supportPercentage = (supportArea / objectBaseArea) * 100
  
  if (supportPercentage < 60) {
    return {
      isValid: false,
      violations: [
        `Insufficient support (${supportPercentage.toFixed(1)}%). Minimum required: 60%`
      ]
    }
  }
  
  return { isValid: true, violations: [] }
}
```

### BR-203: Objetos Frágiles

**Regla**: Los objetos frágiles no pueden tener objetos pesados encima.

**Razón**: Prevenir daños.

**Criterios**:
- Fragility = VERY_FRAGILE: 0kg encima
- Fragility = FRAGILE: Máximo 50% del peso del objeto
- Fragility = NORMAL: Sin restricción adicional

**Validación**:
```typescript
function validateFragileObjects(
  object: PackableObject,
  weightAbove: number
): ValidationResult {
  switch (object.fragility) {
    case FragilityLevel.VERY_FRAGILE:
      if (weightAbove > 0) {
        return {
          isValid: false,
          violations: ['Very fragile objects cannot have anything stacked on them']
        }
      }
      break
      
    case FragilityLevel.FRAGILE:
      const maxWeight = object.weight * 0.5
      if (weightAbove > maxWeight) {
        return {
          isValid: false,
          violations: [
            `Weight above fragile object (${weightAbove}kg) exceeds safe limit (${maxWeight}kg)`
          ]
        }
      }
      break
  }
  
  return { isValid: true, violations: [] }
}
```

---

## 4️⃣ Restricciones de Compatibilidad

### BR-301: Incompatibilidad de Categorías

**Regla**: Ciertas categorías de objetos no pueden estar juntas.

**Razón**: Seguridad, regulaciones, contaminación.

**Incompatibilidades**:
| Categoría 1 | Categoría 2 | Razón |
|-------------|-------------|-------|
| ELECTRONICS | CHEMICALS | Líquidos pueden dañar electrónicos |
| FOOD | CHEMICALS | Contaminación |
| FRAGILE | HEAVY_DUTY | Riesgo de aplastamiento |

**Validación**:
```typescript
const INCOMPATIBLE_CATEGORIES = new Map<ObjectCategory, ObjectCategory[]>([
  [ObjectCategory.ELECTRONICS, [ObjectCategory.CHEMICALS]],
  [ObjectCategory.FOOD, [ObjectCategory.CHEMICALS]],
  [ObjectCategory.FRAGILE, [ObjectCategory.HEAVY_DUTY]]
])

function validateCategoryCompatibility(
  objects: PackableObject[]
): ValidationResult {
  const violations: string[] = []
  
  for (let i = 0; i < objects.length; i++) {
    const incompatibles = INCOMPATIBLE_CATEGORIES.get(objects[i].category)
    if (!incompatibles) continue
    
    for (let j = i + 1; j < objects.length; j++) {
      if (incompatibles.includes(objects[j].category)) {
        violations.push(
          `Incompatible categories: ${objects[i].category} and ${objects[j].category}`
        )
      }
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations
  }
}
```

### BR-302: Reglas de Apilamiento por Categoría

**Regla**: Los objetos solo pueden apilarse sobre categorías permitidas.

**Validación**:
```typescript
function validateStackingRules(
  bottomObject: PackableObject,
  topObject: PackableObject
): ValidationResult {
  if (!topObject.canBeStackedOnCategory(bottomObject.category)) {
    return {
      isValid: false,
      violations: [
        `${topObject.category} cannot be stacked on ${bottomObject.category}`
      ]
    }
  }
  
  return { isValid: true, violations: [] }
}
```

---

## 5️⃣ Restricciones de Estabilidad

### BR-401: Puntuación Mínima de Estabilidad

**Regla**: La configuración debe tener una puntuación de estabilidad mínima.

**Criterios**:
- Score mínimo: 50/100
- Recomendado: 70/100

**Cálculo**:
```typescript
function calculateStabilityScore(
  pallet: Pallet,
  objects: PlacedObject[]
): number {
  let score = 100
  
  // Factor 1: Desviación del centro de gravedad (hasta -30)
  const cog = calculateCenterOfGravity(objects)
  const cogOffset = calculateOffsetFromCenter(cog, pallet)
  const cogPenalty = Math.min(cogOffset * 3, 30)
  score -= cogPenalty
  
  // Factor 2: Objetos sin soporte adecuado (hasta -40)
  const unsupportedCount = objects.filter(obj => 
    !hasAdequateSupport(obj, objects)
  ).length
  const supportPenalty = unsupportedCount * 10
  score -= supportPenalty
  
  // Factor 3: Distribución desigual de peso (hasta -20)
  const distributionScore = calculateWeightDistributionScore(objects, pallet)
  score -= (100 - distributionScore) * 0.2
  
  // Factor 4: Objetos muy altos y estrechos (hasta -10)
  const instabilityPenalty = calculateInstabilityPenalty(objects)
  score -= instabilityPenalty
  
  return Math.max(0, Math.min(100, score))
}
```

### BR-402: Pirámide Invertida Prohibida

**Regla**: No se permite apilar objetos pesados sobre objetos livianos pequeños.

**Razón**: Alta probabilidad de colapso.

**Validación**:
```typescript
function validateInvertedPyramid(
  bottomObject: PackableObject,
  topObject: PackableObject
): ValidationResult {
  const bottomArea = bottomObject.dimensions.width * 
                     bottomObject.dimensions.depth
  const topArea = topObject.dimensions.width * 
                  topObject.dimensions.depth
  
  // Si el objeto de arriba es más pesado Y tiene más área
  if (topObject.weight > bottomObject.weight * 1.5 &&
      topArea > bottomArea * 1.2) {
    return {
      isValid: false,
      violations: ['Inverted pyramid configuration detected - unstable']
    }
  }
  
  return { isValid: true, violations: [] }
}
```

---

## 📋 Resumen de Prioridades

### 🔴 Críticas (Bloquean configuración)
- BR-001: Límites del pallet
- BR-002: Sin colisiones
- BR-101: Capacidad máxima de peso
- BR-201: Capacidad de soporte
- BR-202: Soporte adecuado
- BR-301: Incompatibilidad de categorías

### 🟡 Advertencias (Permiten continuar con aviso)
- BR-003: Altura máxima
- BR-102: Distribución de peso
- BR-203: Objetos frágiles
- BR-401: Puntuación de estabilidad

### 🟢 Recomendaciones (Sugerencias)
- BR-302: Reglas de apilamiento óptimas
- BR-402: Configuraciones inestables

---

## 🧪 Testing de Reglas

Cada regla debe tener tests exhaustivos:

```typescript
describe('Business Rule BR-001: Physical Bounds', () => {
  it('should reject object extending beyond width', () => {
    const pallet = createTestPallet({ width: 1000 })
    const object = createTestObject({
      position: [600, 0, 0],
      dimensions: { width: 500 }
    })
    
    const result = validatePhysicalBounds(pallet, object)
    
    expect(result.isValid).toBe(false)
    expect(result.violations).toContain('beyond pallet width')
  })
})
```

---

Las reglas de negocio son el corazón del dominio. Deben implementarse en el domain layer, no en la UI ni en infraestructura.
