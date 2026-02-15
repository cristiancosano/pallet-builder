# ADR-004: Strategy Pattern para Algoritmos de Empaquetado

**Estado**: Aceptada
**Fecha**: 2026-02-15
**Decisores**: Equipo de Desarrollo

## Contexto

El sistema necesita soportar múltiples algoritmos de empaquetado de cajas en pallets para diferentes casos de uso:

- **Logística de almacén**: Requiere agrupación por producto y material resistente en la base
- **Maximización de espacio**: Prioriza la utilización volumétrica sin restricciones de agrupación
- **Picking simplificado**: Agrupa por tipo en columnas verticales
- **Escenarios personalizados**: Cada cliente puede tener requisitos específicos

Los algoritmos tienen diferentes trade-offs en:
- Utilización de espacio (70-95%)
- Estabilidad estructural
- Agrupación de productos
- Performance (5-500ms según complejidad)
- Requisitos de metadatos (materialWeight, product, etc.)

## Decisión

Hemos decidido implementar el **Strategy Pattern** para el sistema de empaquetado, con:

1. **Interfaz `PackingStrategy`**: Define el contrato que todas las estrategias deben cumplir
2. **`PackingRegistry`**: Sistema de registro centralizado para gestionar estrategias disponibles
3. **Implementaciones concretas**: Cada algoritmo es una clase independiente
4. **Plugin architecture**: Permite crear y registrar estrategias personalizadas

### Estructura

```typescript
interface PackingStrategy {
  readonly id: string
  readonly name: string
  pack(boxes: Box[], pallet: Pallet): PackingResult
}

class PackingRegistry {
  register(strategy: PackingStrategy): void
  get(id: string): PackingStrategy
  has(id: string): boolean
  list(): PackingStrategy[]
}
```

### Estrategias Incluidas

1. **MaterialGroupingStrategy** (`material-grouping`)
   - Ordenación multi-criterio (materialWeight → product → dimensions)
   - Construcción por capas (layers)
   - Maximal Rectangles 2D por capa
   - Agrupación en columnas verticales por producto
   - Validación de soporte (70% mínimo)
   - Validación de footprint (no exceder límites de capa inferior)

2. **BinPacking3DStrategy** (`bin-packing-3d`)
   - First Fit Decreasing por volumen
   - Particionamiento 3D con extreme points
   - Máxima utilización volumétrica

3. **TypeGroupStrategy** (`type-group`)
   - Agrupación por tipo
   - Frágiles arriba

4. **ColumnStrategy** (`column`)
   - Apilamiento vertical simple por SKU/tipo

## Justificación

### 1. Extensibilidad
El patrón permite añadir nuevos algoritmos sin modificar código existente (Open/Closed Principle).

### 2. Intercambiabilidad
Los clientes pueden cambiar de estrategia dinámicamente según sus necesidades:
```typescript
const strategy = hasProductInfo
  ? registry.get('material-grouping')
  : registry.get('bin-packing-3d')
```

### 3. Testabilidad
Cada estrategia se puede testear de forma aislada con diferentes casos de prueba.

### 4. Separación de Responsabilidades
- **Core**: Define contratos e infraestructura
- **Strategies**: Implementan algoritmos específicos
- **Registry**: Gestiona disponibilidad y descubrimiento

### 5. Evolución Independiente
Cada algoritmo puede evolucionar sin afectar a otros:
- MaterialGroupingStrategy: Añadido validación de footprint (Feb 2026)
- BinPacking3DStrategy: Puede optimizarse sin afectar al resto

## Consecuencias

### Positivas

- ✅ **Flexibilidad**: Soporte para múltiples casos de uso sin código condicional
- ✅ **Mantenibilidad**: Algoritmos aislados, fáciles de entender y modificar
- ✅ **Extensibilidad**: Terceros pueden crear estrategias personalizadas
- ✅ **Testabilidad**: Tests específicos por estrategia
- ✅ **Performance**: Se puede elegir la estrategia más rápida según el contexto
- ✅ **Documentación**: Cada estrategia documenta sus trade-offs

### Negativas

- ⚠️ **Complejidad inicial**: Más código de infraestructura (interfaces, registry)
- ⚠️ **Elección de estrategia**: El usuario debe entender qué estrategia usar
- ⚠️ **Duplicación potencial**: Código común entre estrategias (mitigado con helpers compartidos)

### Riesgos Mitigados

- **Riesgo**: Dificultad para elegir estrategia
  - **Mitigación**: Documentación detallada con comparativas y casos de uso

- **Riesgo**: Inconsistencia entre estrategias
  - **Mitigación**: Tests de contrato que validan todas las estrategias

- **Riesgo**: Performance inadecuada
  - **Mitigación**: Benchmarks documentados, estrategia rápida (ColumnStrategy) disponible

## Alternativas Consideradas

### 1. Función Única con Flags

```typescript
function pack(boxes, pallet, options: {
  groupByProduct?: boolean
  prioritizeMaterial?: boolean
  algorithm?: 'greedy' | 'optimal' | 'fast'
}) { }
```

**Pros**:
- API más simple
- Menos código de infraestructura

**Contras**:
- Explosion de flags y combinaciones
- Difícil de testear todas las combinaciones
- Viola Single Responsibility Principle
- Difícil de extender sin modificar la función

**Razón de rechazo**: No escala con múltiples algoritmos complejos.

### 2. Herencia de Clases

```typescript
abstract class PackingAlgorithm {
  abstract pack(boxes, pallet)
}
class MaterialGrouping extends PackingAlgorithm { }
```

**Pros**:
- Polimorfismo clásico
- Código compartido en clase base

**Contras**:
- Acoplamiento por herencia
- Dificulta la composición
- Menos idiomático en TypeScript moderno

**Razón de rechazo**: Preferimos composición sobre herencia. El patrón Strategy usa interfaces.

### 3. Módulos Funcionales

```typescript
export const materialGroupingPacker = (boxes, pallet) => { }
export const binPacking3DPacker = (boxes, pallet) => { }
```

**Pros**:
- Muy simple
- Funcional puro

**Contras**:
- Sin metadata (id, name)
- Sin descubrimiento dinámico
- Difícil crear registry
- Sin contrato forzado (TypeScript no valida firmas de funciones exportadas)

**Razón de rechazo**: Falta de estructura dificulta la gestión y descubrimiento.

## Implementación

### Registro de Estrategias

```typescript
// src/core/packing/registry.ts
export class PackingRegistry {
  private strategies = new Map<string, PackingStrategy>()

  constructor() {
    // Registro automático de estrategias built-in
    this.register(new MaterialGroupingStrategy())
    this.register(new BinPacking3DStrategy())
    this.register(new TypeGroupStrategy())
    this.register(new ColumnStrategy())
  }

  register(strategy: PackingStrategy): void {
    this.strategies.set(strategy.id, strategy)
  }

  get(id: string): PackingStrategy {
    const strategy = this.strategies.get(id)
    if (!strategy) {
      throw new Error(`Strategy not found: ${id}`)
    }
    return strategy
  }
}

export const defaultRegistry = new PackingRegistry()
```

### Creación de Estrategias Personalizadas

Los usuarios pueden crear estrategias propias:

```typescript
import type { PackingStrategy } from '@cristiancosano/pallet-builder'

class MyCustomStrategy implements PackingStrategy {
  readonly id = 'my-custom'
  readonly name = 'My Custom Algorithm'

  pack(boxes: Box[], pallet: Pallet): PackingResult {
    // Implementación personalizada
  }
}

// Registrar y usar
const registry = new PackingRegistry()
registry.register(new MyCustomStrategy())
const result = registry.get('my-custom').pack(boxes, pallet)
```

## Evolución del Algoritmo MaterialGroupingStrategy

Este algoritmo ha evolucionado con validaciones adicionales:

### Validación de Soporte (70%)
- Las cajas en capas superiores deben tener al menos 70% de su base apoyada en cajas inferiores
- Previene cajas "colgadas" sin soporte adecuado

### Validación de Footprint
- Las cajas en capas superiores no pueden extenderse más allá del bounding box de la capa directamente inferior
- Fuerza a usar la capa inferior como base antes de apilar
- Resuelve el problema: "Siempre hay que intentar ocupar la capa inferior, y usarla como base"

Estas validaciones se añadieron en Febrero 2026 sin afectar a otras estrategias.

## Referencias

- [Design Patterns: Strategy Pattern - Gang of Four](https://en.wikipedia.org/wiki/Strategy_pattern)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Maximal Rectangles Algorithm - Jukka Jylänki](http://clb.demon.fi/files/RectangleBinPack.pdf)

## Notas

Esta decisión debería revisarse si:
- El número de estrategias crece excesivamente (>10), considerar categorización
- Los requisitos de configuración por estrategia se vuelven muy complejos
- La abstracción `PackingStrategy` limita la implementación de nuevos algoritmos

## Historial de Cambios

- **2026-02-08**: Decisión inicial, implementación de 4 estrategias base
- **2026-02-15**: Añadidas validaciones de soporte y footprint a MaterialGroupingStrategy
