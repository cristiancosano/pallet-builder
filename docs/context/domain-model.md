# Modelo de Dominio - Contexto para IA

> **Propósito**: Resumen del modelo de dominio del negocio para herramientas de IA

## 🎯 Visión del Dominio

Pallet Builder 3D modela el proceso de **planificación y visualización de carga de pallets** para logística y almacenamiento. El sistema permite construir configuraciones óptimas de objetos sobre pallets, validando restricciones físicas y de negocio en tiempo real.

## 🏗️ Entidades Principales

### Pallet (Entidad Raíz)
```typescript
interface Pallet {
  id: string
  dimensions: Dimensions        // ancho × profundidad × alto
  material: PalletMaterial      // madera, plástico, metal
  maxWeight: number             // kg
  maxHeight: number             // mm
  objects: PlacedObject[]
}
```

**Responsabilidades**:
- Mantener lista de objetos colocados
- Validar restricciones de peso y dimensiones
- Calcular métricas (peso total, utilización, estabilidad)

### PackableObject (Objeto Empaquetable)
```typescript
interface PackableObject {
  id: string
  name: string
  dimensions: Dimensions
  weight: number                // kg
  category: ObjectCategory      // ELECTRONICS, FRAGILE, HEAVY_DUTY, etc.
  fragility: FragilityLevel
  stackable: boolean
  maxStackWeight?: number       // peso máximo que puede soportar encima
}
```

**Responsabilidades**:
- Definir propiedades físicas
- Establecer reglas de apilamiento
- Determinar compatibilidad con otros objetos

### PlacedObject (Objeto Colocado)
```typescript
interface PlacedObject {
  id: string
  object: PackableObject
  position: Position            // [x, y, z] en espacio 3D
  rotation: Rotation            // orientación en 3D
  supportedBy: string[]         // IDs de objetos que lo soportan
  supporting: string[]          // IDs de objetos que soporta
}
```

**Responsabilidades**:
- Mantener posición en el espacio
- Rastrear relaciones de soporte
- Verificar colisiones

## 📐 Value Objects

### Dimensions (Dimensiones)
```typescript
interface Dimensions {
  width: number   // ancho (X)
  height: number  // alto (Y)
  depth: number   // profundidad (Z)
  
  get volume(): number
  canContain(other: Dimensions): boolean
}
```

### Position (Posición 3D)
```typescript
type Position = [x: number, y: number, z: number]
// x: horizontal (derecha +)
// y: vertical (arriba +)
// z: profundidad (adelante +)
```

### Weight (Peso)
```typescript
type Weight = number // siempre en kilogramos (kg)
```

## 🎨 Enums y Tipos

```typescript
enum ObjectCategory {
  ELECTRONICS = 'ELECTRONICS',
  FRAGILE = 'FRAGILE',
  HEAVY_DUTY = 'HEAVY_DUTY',
  FOOD = 'FOOD',
  CHEMICALS = 'CHEMICALS',
  GENERAL = 'GENERAL'
}

enum FragilityLevel {
  VERY_FRAGILE = 'VERY_FRAGILE',  // no puede tener nada encima
  FRAGILE = 'FRAGILE',            // máximo 50% de su peso encima
  NORMAL = 'NORMAL',              // sin restricciones especiales
  ROBUST = 'ROBUST',
  VERY_ROBUST = 'VERY_ROBUST'
}

enum PalletMaterial {
  WOOD = 'WOOD',
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
  COMPOSITE = 'COMPOSITE'
}
```

## ⚖️ Reglas de Negocio Críticas

### 1. Restricciones Físicas
```typescript
// Los objetos NO pueden salirse del pallet
objectBounds.isWithin(palletBounds)

// NO puede haber colisiones entre objetos
!object1.intersects(object2)

// Todo objeto debe tener soporte (gravedad)
object.isOnBase() || object.hasSupport()
```

### 2. Restricciones de Peso
```typescript
// El peso total NO puede exceder la capacidad
totalWeight <= pallet.maxWeight

// Centro de gravedad debe estar centrado (±1/6 del ancho)
centerOfGravity.distanceFrom(palletCenter) <= pallet.width / 6
```

### 3. Restricciones de Apilamiento
```typescript
// Solo objetos stackable pueden tener cosas encima
if (!object.stackable) {
  objectsAbove.length === 0
}

// No exceder capacidad de soporte
weightAbove <= object.maxStackWeight

// Objetos frágiles no pueden soportar mucho peso
if (object.fragility === 'VERY_FRAGILE') {
  weightAbove === 0
}
```

### 4. Incompatibilidades
```typescript
// Ciertos tipos NO pueden ir juntos
incompatibilities = {
  ELECTRONICS: [CHEMICALS],
  FOOD: [CHEMICALS],
  FRAGILE: [HEAVY_DUTY]
}
```

## 🔄 Flujos de Trabajo Principales

### 1. Añadir Objeto al Pallet
```
Usuario selecciona objeto
  → Sistema valida restricciones
  → Si válido: objeto se coloca en posición
  → Si inválido: muestra errores
  → Actualiza visualización 3D
  → Recalcula métricas
```

### 2. Validación de Configuración
```
Sistema recorre todos los objetos
  → Verifica límites físicos
  → Verifica colisiones
  → Verifica peso total
  → Verifica soporte adecuado
  → Calcula estabilidad
  → Retorna resultado con errores/advertencias
```

### 3. Calcular Estabilidad
```
Calcular centro de gravedad
  → Verificar desviación del centro
  → Verificar distribución de peso
  → Verificar objetos sin soporte
  → Calcular score 0-100
```

## 📊 Métricas Importantes

```typescript
interface PalletMetrics {
  totalWeight: number          // suma de pesos de objetos
  weightCapacity: number       // máxima capacidad
  weightUtilization: number    // % de peso usado
  
  volumeUsed: number          // volumen ocupado
  volumeTotal: number         // volumen disponible
  volumeUtilization: number   // % de espacio usado
  
  stabilityScore: number      // 0-100, mínimo recomendado: 70
  
  objectCount: number
  violationCount: number
}
```

## 🎯 Servicios de Dominio

### CollisionDetectionService
```typescript
// Detecta si dos objetos se intersectan
detectCollision(obj1: PlacedObject, obj2: PlacedObject): boolean

// Encuentra todas las colisiones en una configuración
findAllCollisions(objects: PlacedObject[]): Collision[]
```

### StabilityCalculationService
```typescript
// Calcula el centro de masa ponderado
calculateCenterOfGravity(objects: PlacedObject[]): Point3D

// Calcula score de estabilidad
calculateStabilityScore(pallet: Pallet): number
```

### ValidationService
```typescript
// Valida configuración completa
validate(pallet: Pallet): ValidationResult

// Valida antes de añadir objeto
canAddObject(pallet: Pallet, object: PackableObject, position: Position): boolean
```

## 📏 Estándares de Pallets

### EUR Pallet (Europeo)
- Dimensiones: 1200mm × 800mm × 144mm
- Capacidad: 1000 kg
- Material típico: Madera

### American Pallet
- Dimensiones: 1219mm × 1016mm (48" × 40")
- Capacidad: 1200 kg
- Material típico: Madera

## 💬 Lenguaje Ubicuo

Al generar código, usar estos términos:

- ✅ **Pallet** (no "container", "platform")
- ✅ **PackableObject** (no "item", "box", "thing")
- ✅ **PlacedObject** (no "positioned item")
- ✅ **Stacking** para apilar (no "piling")
- ✅ **Support** para soporte (no "base", "foundation")
- ✅ **Fragile** para frágil (no "delicate", "breakable")
- ✅ **Capacity** para capacidad de peso
- ✅ **Bounds** para límites físicos
- ✅ **Collision** para intersección de objetos
- ✅ **Center of Gravity** o **CoG** para centro de gravedad
- ✅ **Utilization** para porcentaje de uso

## 🚫 Anti-patrones a Evitar

```typescript
// ❌ NO: Lógica de negocio en componentes UI
function PalletViewer() {
  const canAdd = totalWeight + newWeight <= maxWeight // ❌
}

// ✅ SÍ: Lógica en el dominio
class Pallet {
  canAddObject(object: PackableObject): boolean {
    return this.currentWeight + object.weight <= this.maxWeight
  }
}

// ❌ NO: Validación solo en frontend
if (weight > 1000) showError() // ❌

// ✅ SÍ: Validación en dominio
const result = pallet.addObject(object)
if (result.isFailure()) showError(result.error)

// ❌ NO: Mutar estado directamente
pallet.objects.push(newObject) // ❌

// ✅ SÍ: Métodos que mantienen invariantes
pallet.addObject(newObject) // valida antes de añadir
```

## 🎨 Ejemplo Completo

```typescript
// Crear pallet EUR estándar
const pallet = PalletFactory.createStandardEuroPallet()

// Crear objeto empaquetable
const box = new PackableObjectEntity(
  'box-1',
  'Caja de electrónicos',
  new Dimensions(400, 300, 200), // mm
  15, // kg
  ObjectCategory.ELECTRONICS,
  FragilityLevel.FRAGILE,
  true, // stackable
  30 // maxStackWeight: 30kg
)

// Intentar colocar objeto
const position: Position = [0, 0.15, 0] // x, y, z
const result = pallet.addObject(box, position)

if (result.isSuccess()) {
  // Calcular métricas
  const metrics = {
    weight: pallet.currentWeight,
    utilization: pallet.utilization,
    stability: calculateStabilityScore(pallet)
  }
  
  // Validar configuración
  const validation = validateConfiguration(pallet)
  if (!validation.isValid) {
    console.warn(validation.violations)
  }
} else {
  console.error(result.error)
}
```

## 📚 Referencias Importantes

Para más detalles, consultar:
- [Entidades completas](../domain/entities.md)
- [Reglas de negocio detalladas](../domain/business-rules.md)
- [Glosario de términos](../domain/glossary.md)

---

**Nota para IA**: Al generar código, siempre respeta estas reglas de negocio y usa el lenguaje ubicuo. La lógica de dominio debe estar en el domain layer, no en componentes UI ni infraestructura.
