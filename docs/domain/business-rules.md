# Reglas de Negocio

Las reglas de negocio definen las restricciones y validaciones que debe cumplir el sistema. Son invariantes del dominio que SIEMPRE deben respetarse.

> **Nota**: Todas las reglas se implementan en el core layer (TypeScript puro) y se exponen al desarrollador consumidor mediante hooks y funciones de validación.

## Categorías de Reglas

| Cat. | Nombre | Aplica a |
|------|--------|----------|
| 1 | Restricciones Físicas | Todos los contenedores |
| 2 | Restricciones de Peso | Todos los contenedores |
| 3 | Restricciones de Apilamiento de Cajas | Palet |
| 4 | Restricciones de Apilamiento de Palets | StackedPallet |
| 5 | Restricciones de Estancia / Camión | Room, Truck |
| 6 | Restricciones de Estabilidad | Palet, StackedPallet |

---

## 1. Restricciones Físicas

### BR-001: Límites de Caja en Palet

**Regla**: Ninguna caja puede extenderse fuera de los límites del palet.
**Razón**: Objetos que sobresalen caen durante transporte.

```typescript
function validateBoxInPalletBounds(pallet: Pallet, box: PlacedBox): ValidationResult
// box.bounds debe estar contenido en el volumen del palet (ancho × prof × maxStackHeight)
```

### BR-002: Sin Colisiones entre Cajas

**Regla**: Dos cajas no pueden ocupar el mismo espacio dentro de un palet.
**Razón**: Imposibilidad física.
**Método**: Detección AABB (Axis-Aligned Bounding Box) con tolerancia de 1 mm.

```typescript
function validateNoBoxCollisions(boxes: PlacedBox[]): ValidationResult
// Para cada par (i, j): AABB(i) ∩ AABB(j) === ∅
```

### BR-003: Sin Colisiones entre Palets

**Regla**: Dos palets posicionados no pueden ocupar el mismo espacio dentro de un contenedor (estancia o camión).
**Método**: AABB sobre la huella 3D del `StackedPallet` completo (incluyendo pisos y separadores).

```typescript
function validateNoPalletCollisions(pallets: PlacedPallet[]): ValidationResult
```

### BR-004: Objetos No Flotan (Gravedad)

**Regla**: Toda caja debe tener soporte debajo: el suelo del palet u otra caja.
**Criterio**: Al menos 60 % del área base de la caja debe estar sobre una superficie de soporte.
**Aplicación**: Al colocar, mover o eliminar una caja se recalculan los soportes; las cajas sin soporte caen hasta encontrar superficie.

```typescript
function validateSupport(box: PlacedBox, allBoxes: PlacedBox[]): ValidationResult
// box.position.y ≈ 0 (base) OR supportArea(box, objectsBelow) ≥ 60%
```

---

## 2. Restricciones de Peso

### BR-101: Peso Máximo de Palet

**Regla**: Peso total de cajas en un piso de palet ≤ `pallet.maxWeight`.
**Factor de seguridad**: Se recomienda no superar el 90 % (warning a partir de 90 %, error a partir de 100 %).

```typescript
function validatePalletWeight(floor: PalletFloor): ValidationResult
// Σ boxes[i].weight ≤ floor.pallet.maxWeight
```

### BR-102: Peso Máximo de Camión

**Regla**: Peso total de todos los palets cargados ≤ `truck.maxWeight`.

```typescript
function validateTruckWeight(truck: Truck): ValidationResult
// Σ placedPallets[i].totalWeight ≤ truck.maxWeight
```

### BR-103: Peso Sobre Caja Frágil

**Regla**: Si una caja tiene `fragile = true`, el peso soportado encima no puede exceder `fragilityMaxWeight`.
**Si `fragilityMaxWeight` no está definido y `fragile = true`**: peso encima = 0 kg.

```typescript
function validateFragileLoad(box: PlacedBox, weightAbove: number): ValidationResult
```

### BR-104: Distribución de Peso en Palet

**Regla**: El centro de gravedad del palet cargado debe estar dentro del tercio central de su planta.
**Severidad**: Warning (no bloquea).

```typescript
function validateWeightDistribution(pallet: Pallet, boxes: PlacedBox[]): ValidationResult
// |CoG.x - center.x| ≤ pallet.width / 6
// |CoG.z - center.z| ≤ pallet.depth / 6
```

---

## 3. Restricciones de Apilamiento de Cajas

### BR-201: Caja Apilable

**Regla**: Solo las cajas con `stackable = true` pueden tener otras cajas encima.

### BR-202: Capacidad de Soporte de Caja

**Regla**: El peso acumulado sobre una caja ≤ `box.fragilityMaxWeight` (si está definido). Si `stackable = true` y `fragilityMaxWeight` no está definido, no hay límite.

### BR-203: Pirámide Invertida

**Regla**: No se permite que una caja más pesada y con mayor área base se apoye sobre una caja más pequeña y ligera.
**Severidad**: Warning.

```typescript
// Si topBox.weight > bottomBox.weight × 1.5 AND topBox.baseArea > bottomBox.baseArea × 1.2 → warning
```

---

## 4. Restricciones de Apilamiento de Palets (StackedPallet)

### BR-301: Mismas Dimensiones de Planta

**Regla**: Todos los palets dentro de un `StackedPallet` deben tener las mismas dimensiones de ancho × profundidad.
**Razón**: Un palet de distinto formato no encajaría sobre el separador/palet inferior.

### BR-302: Separador Obligatorio

**Regla**: Entre un piso de palet y el siguiente siempre debe haber un separador.
**Razón**: Estabilidad y protección de la carga inferior.

### BR-303: Altura Total del Stack

**Regla**: La altura total del `StackedPallet` (sumando palets + cajas + separadores) ≤ altura del contenedor donde está posicionado.

```typescript
function validateStackHeight(stack: StackedPallet, containerHeight: number): ValidationResult
// Σ (pallet[i].height + maxBoxHeight[i] + separator[i].height) ≤ containerHeight
```

### BR-304: Peso Acumulado del Stack

**Regla**: El peso total del stack completo (todos los pisos + separadores) ≤ `pallet_base.maxWeight`.
**Razón**: El palet de la base soporta toda la carga superior.

```typescript
function validateStackWeight(stack: StackedPallet): ValidationResult
// El peso total de pisos 1..N + separadores ≤ stack.floors[0].pallet.maxWeight
```

---

## 5. Restricciones de Contenedor (Room / Truck)

### BR-401: Palet Dentro de Estancia (Polígono)

**Regla**: La huella 2D (planta) de un palet posicionado debe estar completamente dentro del polígono de la estancia.
**Método**: Point-in-polygon test para las 4 esquinas del palet, más verificación de que ningún borde del palet cruza un borde del polígono.

```typescript
function validatePalletInRoom(pallet: PlacedPallet, room: Room): ValidationResult
```

### BR-402: Palet Dentro de Camión

**Regla**: La AABB del `StackedPallet` posicionado debe estar dentro del volumen rectangular del camión.

```typescript
function validatePalletInTruck(pallet: PlacedPallet, truck: Truck): ValidationResult
```

### BR-403: Altura de Estancia

**Regla**: La altura total de un palet posicionado ≤ `room.ceilingHeight`.

### BR-404: Altura de Camión

**Regla**: La altura total de un palet cargado ≤ `truck.dimensions.height`.

---

## 6. Restricciones de Estabilidad

### BR-501: Score de Estabilidad Mínimo

**Regla**: El score de estabilidad de un palet cargado debe ser ≥ 50 para permitir la configuración.
**Recomendado**: ≥ 70.
**Severidad**: Warning entre 50-70; error < 50.

### BR-502: Centro de Gravedad

**Regla**: El centro de gravedad (CoG) del palet cargado debe proyectarse dentro del polígono de soporte (la planta del palet).
**Razón**: Si el CoG proyectado sale del perímetro, hay riesgo de volcado.

```typescript
function calculateCenterOfGravity(boxes: PlacedBox[]): Position3D
function isCoGInsideSupportPolygon(cog: Position3D, palletDims: Dimensions3D): boolean
```

### BR-503: Altura del Centro de Gravedad

**Regla**: Un CoG alto (> 60 % de la altura total de carga) con distribución desigual genera warning de volcado.

---

## Resumen de Severidades

### Errores (Bloquean — configuración inválida)
| Código | Regla |
|--------|-------|
| BR-001 | Caja fuera de palet |
| BR-002 | Colisión entre cajas |
| BR-003 | Colisión entre palets |
| BR-004 | Objeto flotando sin soporte |
| BR-101 | Peso de palet excedido |
| BR-102 | Peso de camión excedido |
| BR-103 | Peso sobre caja frágil excedido |
| BR-201 | Apilamiento sobre caja no apilable |
| BR-301 | Dimensiones de planta distintas en stack |
| BR-302 | Falta separador entre pisos |
| BR-303 | Stack excede altura del contenedor |
| BR-304 | Stack excede peso del palet base |
| BR-401 | Palet fuera del polígono de estancia |
| BR-402 | Palet fuera del camión |
| BR-403 | Palet excede techo de estancia |
| BR-404 | Palet excede techo de camión |
| BR-502 | CoG fuera de polígono de soporte |

### Warnings (Permiten continuar con aviso)
| Código | Regla |
|--------|-------|
| BR-104 | Distribución de peso descentrada |
| BR-203 | Pirámide invertida |
| BR-501 | Estabilidad baja (50-70) |
| BR-503 | CoG alto con distribución desigual |

---

## Testing de Reglas

Cada regla debe tener al menos:
- Test positivo (configuración válida → sin violaciones).
- Test negativo (violación → error/warning correcto con código e IDs involucrados).
- Test límite (en el borde exacto de la restricción).

```typescript
describe('BR-001: Box in Pallet Bounds', () => {
  it('acepta caja dentro de límites')
  it('rechaza caja que sobresale por X')
  it('rechaza caja que sobresale por Z')
  it('acepta caja en el borde exacto')
})
```

---

Las reglas de negocio se implementan como funciones puras en el domain layer. Los componentes visuales las consumen a través de hooks (`usePhysicsValidation`). La librería NO decide qué hacer ante un error — reporta violaciones y el desarrollador decide la UX.
