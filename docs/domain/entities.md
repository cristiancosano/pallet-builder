# Entidades del Dominio

Las entidades son objetos con identidad única que persiste en el tiempo. Aunque sus atributos cambien, su identidad permanece.

## 🎯 Entidades Principales

### 1. Pallet (Entidad Raíz)

Representa la plataforma base sobre la cual se colocan los objetos.

```typescript
interface Pallet {
  // Identidad
  id: string
  
  // Propiedades estructurales
  dimensions: Dimensions
  material: PalletMaterial
  
  // Capacidades
  maxWeight: Weight
  maxHeight: number
  
  // Estado
  objects: PlacedObject[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

enum PalletMaterial {
  WOOD = 'WOOD',
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
  COMPOSITE = 'COMPOSITE'
}

// Implementación de ejemplo
class PalletEntity implements Pallet {
  constructor(
    public readonly id: string,
    public readonly dimensions: Dimensions,
    public readonly material: PalletMaterial,
    public readonly maxWeight: Weight,
    public readonly maxHeight: number,
    private _objects: PlacedObject[] = []
  ) {}
  
  get objects(): readonly PlacedObject[] {
    return this._objects
  }
  
  get currentWeight(): Weight {
    return this._objects.reduce(
      (total, obj) => total + obj.weight,
      0
    )
  }
  
  get utilization(): number {
    const totalVolume = this.dimensions.volume
    const usedVolume = this._objects.reduce(
      (total, obj) => total + obj.dimensions.volume,
      0
    )
    return usedVolume / totalVolume
  }
  
  canAddObject(object: PackableObject): ValidationResult {
    const violations: string[] = []
    
    // Validar peso
    if (this.currentWeight + object.weight > this.maxWeight) {
      violations.push('Weight limit exceeded')
    }
    
    // Validar altura
    if (object.dimensions.height > this.maxHeight) {
      violations.push('Object exceeds maximum height')
    }
    
    // Validar dimensiones del pallet
    if (!this.dimensions.canContain(object.dimensions)) {
      violations.push('Object dimensions exceed pallet bounds')
    }
    
    return {
      isValid: violations.length === 0,
      violations
    }
  }
  
  addObject(object: PackableObject, position: Position): Result<void> {
    const validation = this.canAddObject(object)
    
    if (!validation.isValid) {
      return Result.fail(validation.violations)
    }
    
    const placedObject = new PlacedObject(
      object,
      position,
      Date.now()
    )
    
    this._objects.push(placedObject)
    
    return Result.ok()
  }
  
  removeObject(objectId: string): boolean {
    const initialLength = this._objects.length
    this._objects = this._objects.filter(obj => obj.id !== objectId)
    return this._objects.length < initialLength
  }
  
  clear(): void {
    this._objects = []
  }
}
```

### 2. PackableObject (Objeto Empaquetable)

Representa cualquier elemento que puede ser colocado en un pallet.

```typescript
interface PackableObject {
  // Identidad
  id: string
  name: string
  sku?: string
  
  // Propiedades físicas
  dimensions: Dimensions
  weight: Weight
  
  // Clasificación
  category: ObjectCategory
  fragility: FragilityLevel
  
  // Reglas de apilamiento
  stackable: boolean
  maxStackWeight?: Weight
  canBeStackedOn: ObjectCategory[]
  
  // Visualización
  color?: string
  texture?: string
  
  // Metadata
  createdAt: Date
}

enum ObjectCategory {
  ELECTRONICS = 'ELECTRONICS',
  FRAGILE = 'FRAGILE',
  HEAVY_DUTY = 'HEAVY_DUTY',
  FOOD = 'FOOD',
  CHEMICALS = 'CHEMICALS',
  GENERAL = 'GENERAL'
}

enum FragilityLevel {
  VERY_FRAGILE = 'VERY_FRAGILE',
  FRAGILE = 'FRAGILE',
  NORMAL = 'NORMAL',
  ROBUST = 'ROBUST',
  VERY_ROBUST = 'VERY_ROBUST'
}

class PackableObjectEntity implements PackableObject {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly dimensions: Dimensions,
    public readonly weight: Weight,
    public readonly category: ObjectCategory,
    public readonly fragility: FragilityLevel = FragilityLevel.NORMAL,
    public readonly stackable: boolean = true,
    public readonly maxStackWeight?: Weight,
    public readonly canBeStackedOn: ObjectCategory[] = [],
    public readonly sku?: string,
    public readonly color?: string,
    public readonly texture?: string
  ) {}
  
  get volume(): number {
    return this.dimensions.volume
  }
  
  get density(): number {
    return this.weight / this.volume
  }
  
  canSupportWeight(weight: Weight): boolean {
    if (!this.stackable) return false
    if (!this.maxStackWeight) return true
    return weight <= this.maxStackWeight
  }
  
  canBeStackedOnCategory(category: ObjectCategory): boolean {
    if (this.canBeStackedOn.length === 0) return true
    return this.canBeStackedOn.includes(category)
  }
  
  isCompatibleWith(other: PackableObject): boolean {
    // Electrónicos no con líquidos
    if (
      this.category === ObjectCategory.ELECTRONICS &&
      other.category === ObjectCategory.CHEMICALS
    ) {
      return false
    }
    
    // Comida no con químicos
    if (
      this.category === ObjectCategory.FOOD &&
      other.category === ObjectCategory.CHEMICALS
    ) {
      return false
    }
    
    return true
  }
}
```

### 3. PlacedObject (Objeto Colocado)

Representa un objeto que ya ha sido posicionado en el pallet.

```typescript
interface PlacedObject {
  // Referencia al objeto
  id: string
  object: PackableObject
  
  // Posición en el espacio 3D
  position: Position
  rotation: Rotation
  
  // Relaciones espaciales
  supportedBy: string[] // IDs de objetos debajo
  supporting: string[] // IDs de objetos encima
  
  // Estado
  placedAt: Date
  locked: boolean
}

class PlacedObjectEntity implements PlacedObject {
  constructor(
    public readonly id: string,
    public readonly object: PackableObject,
    public position: Position,
    public rotation: Rotation = { x: 0, y: 0, z: 0 },
    public supportedBy: string[] = [],
    public supporting: string[] = [],
    public readonly placedAt: Date = new Date(),
    public locked: boolean = false
  ) {}
  
  get bounds(): BoundingBox {
    return BoundingBox.fromPositionAndDimensions(
      this.position,
      this.object.dimensions,
      this.rotation
    )
  }
  
  moveTo(newPosition: Position): void {
    if (this.locked) {
      throw new Error('Cannot move locked object')
    }
    this.position = newPosition
  }
  
  rotateTo(newRotation: Rotation): void {
    if (this.locked) {
      throw new Error('Cannot rotate locked object')
    }
    this.rotation = newRotation
  }
  
  lock(): void {
    this.locked = true
  }
  
  unlock(): void {
    this.locked = false
  }
  
  isSupported(): boolean {
    return this.supportedBy.length > 0 || this.isOnBase()
  }
  
  isOnBase(): boolean {
    return this.position.y <= 0.01 // Tolerance
  }
  
  intersects(other: PlacedObject): boolean {
    return this.bounds.intersects(other.bounds)
  }
}
```

### 4. PalletConfiguration (Configuración de Pallet)

Representa una configuración completa y guardable de un pallet con sus objetos.

```typescript
interface PalletConfiguration {
  // Identidad
  id: string
  name: string
  description?: string
  
  // Configuración del pallet
  palletSpec: PalletSpecification
  
  // Objetos colocados
  placedObjects: PlacedObjectData[]
  
  // Métricas
  totalWeight: Weight
  utilizationPercentage: number
  stabilityScore: number
  
  // Validación
  isValid: boolean
  validationErrors: string[]
  
  // Metadata
  createdBy?: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface PalletSpecification {
  dimensions: Dimensions
  material: PalletMaterial
  maxWeight: Weight
  maxHeight: number
}

interface PlacedObjectData {
  objectId: string
  objectSpec: PackableObjectSpec
  position: Position
  rotation: Rotation
}

class PalletConfigurationEntity implements PalletConfiguration {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly palletSpec: PalletSpecification,
    private _placedObjects: PlacedObjectData[] = [],
    public description?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public tags: string[] = []
  ) {}
  
  get placedObjects(): readonly PlacedObjectData[] {
    return this._placedObjects
  }
  
  get totalWeight(): Weight {
    return this._placedObjects.reduce(
      (total, obj) => total + obj.objectSpec.weight,
      0
    )
  }
  
  get utilizationPercentage(): number {
    const totalVolume = this.palletSpec.dimensions.volume
    const usedVolume = this._placedObjects.reduce(
      (total, obj) => total + obj.objectSpec.dimensions.volume,
      0
    )
    return (usedVolume / totalVolume) * 100
  }
  
  clone(newName: string): PalletConfigurationEntity {
    return new PalletConfigurationEntity(
      crypto.randomUUID(),
      newName,
      { ...this.palletSpec },
      [...this._placedObjects],
      this.description,
      new Date(),
      new Date(),
      [...this.tags]
    )
  }
  
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag)
      this.updatedAt = new Date()
    }
  }
  
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag)
    this.updatedAt = new Date()
  }
}
```

## 🔄 Ciclo de Vida de las Entidades

### Pallet
```
Created → Active → Modified → Validated → Exported/Saved
```

### PackableObject
```
Defined → Available → Placed → [Moved/Rotated]* → Finalized
```

### Configuration
```
Created → Building → Validating → [Valid/Invalid] → Saved
```

## 📊 Diagramas de Relaciones

```
┌──────────────────────────────┐
│  PalletConfiguration         │
│  - id                        │
│  - name                      │
│  - palletSpec                │
└──────────┬───────────────────┘
           │ contains
           │
           ▼
┌──────────────────────────────┐
│  Pallet                      │
│  - id                        │
│  - dimensions                │◆──────┐
│  - maxWeight                 │       │
└──────────┬───────────────────┘       │
           │ contains                  │
           │                           │
           ▼                           ▼
┌──────────────────────────────┐  ┌─────────────────────┐
│  PlacedObject                │  │  PackableObject     │
│  - id                        │──│  - id               │
│  - position                  │  │  - dimensions       │
│  - rotation                  │  │  - weight           │
└──────────────────────────────┘  └─────────────────────┘
```

## 🎯 Factories

Para crear entidades complejas:

```typescript
class PalletFactory {
  static createStandardEuroPallet(): Pallet {
    return new PalletEntity(
      crypto.randomUUID(),
      new Dimensions(1200, 800, 144), // mm
      PalletMaterial.WOOD,
      1000, // kg
      2000 // mm max height
    )
  }
  
  static createStandardAmericanPallet(): Pallet {
    return new PalletEntity(
      crypto.randomUUID(),
      new Dimensions(1219, 1016, 145), // mm (48"x40")
      PalletMaterial.WOOD,
      1200, // kg
      2134 // mm (7 feet)
    )
  }
}

class PackableObjectFactory {
  static createBox(
    name: string,
    width: number,
    height: number,
    depth: number,
    weight: number
  ): PackableObject {
    return new PackableObjectEntity(
      crypto.randomUUID(),
      name,
      new Dimensions(width, height, depth),
      weight,
      ObjectCategory.GENERAL,
      FragilityLevel.NORMAL
    )
  }
}
```

## 💡 Mejores Prácticas

1. **Inmutabilidad de IDs**: Los IDs nunca deben cambiar
2. **Validación en Construcción**: Validar en el constructor
3. **Encapsulación**: No exponer colecciones mutables
4. **Rich Domain Model**: Poner lógica de negocio en las entidades
5. **Factories para Complejidad**: Usar factories para creación compleja

---

Las entidades son el corazón del dominio. Mantenerlas ricas en comportamiento es clave para un buen diseño.
