# Guía de Testing

> **Propósito**: Documentar la estrategia de tests unitarios del core de Pallet Builder.

## Stack de Testing

| Herramienta | Uso |
|-------------|-----|
| **Vitest** | Test runner (compatible con Vite, ESM nativo) |
| **vitest.config.ts** | Configuración de tests |

## Comandos

```bash
# Ejecutar todos los tests una vez
pnpm test

# Ejecutar en modo watch (re-ejecuta al guardar)
pnpm test:watch

# Ejecutar con cobertura
pnpm test:coverage
```

## Estructura de Tests

```
src/core/__tests__/
├── helpers.ts          # Factories de datos para tests
├── entities.test.ts    # StackedPallet helpers (altura, peso, IDs únicos)
├── factories.test.ts   # PalletFactory, BoxFactory, TruckFactory
├── collision.test.ts   # BR-002, BR-003: AABB + colisiones
├── bounds.test.ts      # BR-001, BR-402, BR-403, BR-404: límites
├── weight.test.ts      # BR-101, BR-102, BR-103, BR-104: peso
├── gravity.test.ts     # BR-004: soporte y gravedad
├── stacking.test.ts    # BR-201, BR-203, BR-301–BR-304: apilamiento
├── stability.test.ts   # BR-501, BR-502, BR-503: estabilidad y CoG
├── polygon.test.ts     # BR-401: point-in-polygon, palet en estancia
├── packing.test.ts     # RF-013–RF-015: estrategias de empaquetado
└── registry.test.ts    # RF-016: registro de estrategias
```

## Convenciones

### Naming

- Archivos: `<módulo>.test.ts`
- `describe` por regla de negocio: `'BR-001: validateBoxInPalletBounds'`
- `it` descriptivo en español: `'acepta caja dentro de los límites'`

### Helpers

Todos los tests usan factories del archivo `helpers.ts` para crear datos de prueba. Estas factories proporcionan valores por defecto razonables y permiten overrides parciales:

```typescript
import { makePallet, makePlacedBox, makeFloor, dims, pos } from './helpers'

const pallet = makePallet({ maxWeight: 500 })
const box = makePlacedBox({ position: pos(0, 0, 0), box: { weight: 10 } })
```

### Patrón de test por regla de negocio

Cada regla BR-XXX debe tener mínimo:

1. **Test positivo**: configuración válida → sin violaciones
2. **Test negativo**: violación clara → error/warning con código correcto
3. **Test de borde**: valor exacto en el límite de la restricción

```typescript
describe('BR-001: Box in Pallet Bounds', () => {
  it('acepta caja dentro de límites')           // positivo
  it('rechaza caja que sobresale por eje X')     // negativo
  it('acepta caja en el borde exacto del palet') // borde
})
```

### Invariantes de packing

Los tests de estrategias validan:

- `placements.length + unplacedBoxes.length === totalBoxes`
- Métricas en rangos válidos (0–1 para utilización, 0–100 para estabilidad)
- Sin colisiones entre cajas colocadas (validación AABB)

## Cobertura por Módulo

| Módulo | Reglas cubiertas | Tests |
|--------|-----------------|-------|
| `entities/StackedPallet` | Altura, peso, IDs únicos | 8 |
| `factories/` | Presets, custom, IDs únicos | 19 |
| `validation/collision` | BR-002, BR-003 | 14 |
| `validation/bounds` | BR-001, BR-402, BR-403, BR-404 | 13 |
| `validation/weight` | BR-101, BR-102, BR-103, BR-104 | 13 |
| `validation/gravity` | BR-004 | 6 |
| `validation/stacking` | BR-201, BR-203, BR-301–304 | 15 |
| `validation/stability` | BR-501, BR-502, BR-503, CoG | 11 |
| `validation/polygon` | BR-401, point-in-polygon | 7 |
| `packing/` | RF-013, RF-014, RF-015 | 13 |
| `packing/registry` | RF-016 | 8 |
| **Total** | | **127** |

## Principios

1. **Core puro** — Los tests no importan React ni Three.js. Solo TypeScript.
2. **Sin mocks** — Las funciones del core son puras; no necesitan mocks.
3. **Datos realistas** — Los helpers usan dimensiones reales de palets EUR, camiones BOX, etc.
4. **Independientes** — Cada test es autocontenido; no depende del orden de ejecución.
5. **Deterministas** — Sin aleatoriedad ni dependencia de tiempo.
