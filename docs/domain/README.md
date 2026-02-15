# Dominio — Pallet Builder

Documentación del modelo de dominio: entidades, reglas de negocio, requisitos y lenguaje ubicuo.

## Contenido

| Documento | Descripción |
|-----------|-------------|
| [requirements.md](./requirements.md) | 34 requisitos funcionales + 8 no funcionales organizados en 10 áreas |
| [entities.md](./entities.md) | 11 entidades de dominio con interfaces TypeScript (Warehouse, Room, Truck, Pallet, Box, StackedPallet, etc.) |
| [business-rules.md](./business-rules.md) | ~20 reglas de negocio con severidades (error/warning) en 6 categorías |
| [packing-algorithms.md](./packing-algorithms.md) | Algoritmos de empaquetado (MaterialGroupingStrategy, BinPacking3D, etc.) con reglas de dominio |
| [glossary.md](./glossary.md) | Glosario de lenguaje ubicuo — términos obligatorios al generar código |
- Restricciones técnicas
- Dependencias del sistema

### [value-objects.md](./value-objects.md)
Value Objects del dominio:
- Dimensions (Dimensiones)
- Position (Posición)
- Weight (Peso)
- VolumeCapacity (Capacidad)

## 🎯 Domain-Driven Design (DDD)

Este proyecto aplica conceptos de DDD para mantener el código alineado con el negocio:

### Lenguaje Ubicuo

Usamos el mismo lenguaje en código y documentación:

```typescript
// ✅ Bueno - usa lenguaje del dominio
class Pallet {
  validateLoad(objects: PackableObject[]): ValidationResult
  calculateStability(): StabilityScore
}

// ❌ Malo - usa lenguaje técnico genérico
class Container {
  checkItems(items: Item[]): boolean
  getScore(): number
}
```

### Capas del Dominio

```
┌─────────────────────────────────────┐
│      Presentation Layer (UI)       │
│  - React Components                │
│  - 3D Visualization                │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│      Application Layer              │
│  - Use Cases                        │
│  - Orchestration                    │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│      Domain Layer (Core)            │
│  - Entities                         │
│  - Value Objects                    │
│  - Domain Services                  │
│  - Business Rules                   │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│      Infrastructure Layer           │
│  - State Management                 │
│  - Persistence                      │
│  - External Services                │
└─────────────────────────────────────┘
```

## 🏗️ Agregados Principales

### 1. Pallet Aggregate

**Root Entity**: Pallet

**Componentes**:
- PalletConfiguration
- PlacedObjects[]
- LoadingConstraints

**Responsabilidades**:
- Mantener integridad del pallet
- Validar reglas de carga
- Calcular métricas

### 2. PackableObject Aggregate

**Root Entity**: PackableObject

**Componentes**:
- ObjectDimensions
- ObjectWeight
- ObjectCategory
- StackingRules

**Responsabilidades**:
- Validar propiedades del objeto
- Definir restricciones de apilamiento

## 🔄 Eventos de Dominio

```typescript
// Eventos que ocurren en el dominio
interface DomainEvent {
  occurredAt: Date
  aggregateId: string
}

// Ejemplos de eventos
class ObjectPlacedEvent implements DomainEvent {
  objectId: string
  position: Position
  palletId: string
}

class WeightLimitExceededEvent implements DomainEvent {
  palletId: string
  currentWeight: Weight
  maxWeight: Weight
}

class InvalidPlacementDetectedEvent implements DomainEvent {
  objectId: string
  reason: string
  violations: Violation[]
}
```

## 📊 Bounded Contexts

### Core Context (Núcleo)
- Gestión de pallets
- Validación de carga
- Cálculo de estabilidad

### Visualization Context (Visualización)
- Renderizado 3D
- Controles de cámara
- Interacción visual

### Configuration Context (Configuración)
- Preferencias de usuario
- Plantillas predefinidas
- Import/Export

## 🎨 Modelado Visual

### Diagrama de Entidades

```
┌─────────────┐
│   Pallet    │
├─────────────┤
│ id          │
│ dimensions  │────┐
│ maxWeight   │    │
│ objects[]   │◆───┼──> ┌──────────────────┐
└─────────────┘    │    │ PackableObject   │
                   │    ├──────────────────┤
                   │    │ id               │
                   │    │ dimensions       │
                   │    │ weight           │
                   └───>│ position         │
                        │ category         │
                        │ stackable        │
                        └──────────────────┘
```

### Flujo de Validación

```
Usuario coloca objeto
        │
        ▼
┌───────────────────┐
│ Domain Service    │
│ validatePlacement │
└────────┬──────────┘
         │
         ├─> Verificar límites físicos
         ├─> Verificar peso total
         ├─> Verificar colisiones
         ├─> Verificar estabilidad
         │
         ▼
    ┌─────────┐
    │ Result  │
    └─────────┘
```

## 🛡️ Invariantes del Dominio

**Invariantes**: Reglas que SIEMPRE deben cumplirse

1. **Pallet Weight Invariant**
   ```typescript
   // El peso total NUNCA puede exceder el máximo
   totalWeight <= pallet.maxWeight
   ```

2. **Physical Boundaries Invariant**
   ```typescript
   // Los objetos NUNCA pueden salirse del pallet
   object.bounds.isWithin(pallet.bounds)
   ```

3. **Collision Invariant**
   ```typescript
   // Dos objetos NUNCA pueden ocupar el mismo espacio
   !object1.intersects(object2)
   ```

4. **Gravity Invariant**
   ```typescript
   // Los objetos DEBEN tener soporte debajo (o estar en la base)
   object.hasSupport() || object.isOnBase()
   ```

## 📖 Casos de Uso Principales

### 1. Crear Configuración de Pallet
```typescript
interface CreatePalletConfigurationUseCase {
  execute(dimensions: Dimensions): PalletConfiguration
}
```

### 2. Añadir Objeto al Pallet
```typescript
interface AddObjectToPalletUseCase {
  execute(
    palletId: string,
    object: PackableObject,
    position: Position
  ): Result<void, ValidationError[]>
}
```

### 3. Validar Configuración Completa
```typescript
interface ValidatePalletConfigurationUseCase {
  execute(palletId: string): ValidationResult
}
```

### 4. Calcular Optimización de Espacio
```typescript
interface OptimizePalletLoadingUseCase {
  execute(
    palletDimensions: Dimensions,
    objects: PackableObject[]
  ): OptimizedConfiguration
}
```

## 🔍 Servicios de Dominio

Cuando la lógica no pertenece a una entidad específica:

```typescript
// Servicio para detección de colisiones
class CollisionDetectionService {
  detectCollisions(
    objects: PackableObject[]
  ): Collision[]
}

// Servicio para cálculo de estabilidad
class StabilityCalculationService {
  calculateCenterOfMass(
    objects: PlacedObject[]
  ): Point3D
  
  calculateStabilityScore(
    pallet: Pallet
  ): StabilityScore
}

// Servicio para optimización de carga
class LoadOptimizationService {
  optimize(
    availableSpace: Dimensions,
    objects: PackableObject[]
  ): OptimizedLayout
}
```

## 🧪 Testing del Dominio

```typescript
// Tests de dominio deben ser independientes de infraestructura
describe('Pallet Domain', () => {
  it('should reject object placement that exceeds weight limit', () => {
    const pallet = new Pallet({ maxWeight: 1000 })
    const heavyObject = new PackableObject({ weight: 1500 })
    
    const result = pallet.addObject(heavyObject, position)
    
    expect(result.isFailure()).toBe(true)
    expect(result.error).toContain('Weight limit exceeded')
  })
})
```

## 📚 Referencias

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://vaughnvernon.com/)
- [DDD Reference](https://www.domainlanguage.com/ddd/reference/)

---

Este modelo de dominio evoluciona con el proyecto. Las sugerencias basadas en conocimiento del negocio son especialmente valiosas.
