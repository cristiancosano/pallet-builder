# Tipos de Palets Estándar

El sistema incluye presets para los principales tipos de palets utilizados en logística internacional. Estos presets facilitan la creación de palets sin necesidad de especificar manualmente las dimensiones y características de cada tipo.

## Referencia Rápida

| Tipo | Dimensiones (mm) | Estándar | Peso máx. | Factory Method |
|------|------------------|----------|-----------|----------------|
| **EUR/EPAL** | 1200×800×144 | ISO 6780 | 1000 kg | `PalletFactory.euro()` |
| **GMA** | 1219×1016×145 | Norteamérica (48"×40") | 1200 kg | `PalletFactory.gma()` |
| **UK** | 1200×1000×150 | Reino Unido | 1000 kg | `PalletFactory.uk()` |
| **Asia** | 1100×1100×150 | ISO 6780 | 1000 kg | `PalletFactory.asia()` |
| **Australian** | 1165×1165×150 | Australia | 1000 kg | `PalletFactory.australian()` |
| **Half EUR** | 800×600×144 | Medio EUR | 500 kg | `PalletFactory.halfEuro()` |
| **Quarter EUR** | 600×400×144 | Cuarto EUR | 250 kg | `PalletFactory.quarterEuro()` |
| **ISO 1** | 1200×1000×150 | ISO 6780-1 | 1000 kg | `PalletFactory.iso1()` |
| **ISO 2** | 1200×800×144 | ISO 6780-2 | 1000 kg | `PalletFactory.iso2()` |

## Descripción Detallada

### EUR/EPAL (Europallet)

```typescript
const pallet = PalletFactory.euro()
```

- **Dimensiones**: 1200×800×144 mm
- **Estándar**: ISO 6780, el más común en Europa
- **Material**: Madera
- **Peso propio**: 25 kg
- **Carga máxima**: 1000 kg
- **Uso**: Logística europea, retail, distribución general

El palet europeo es el estándar de facto en Europa. Su diseño permite optimizar el espacio en camiones y contenedores estándar europeos.

### GMA (Grocery Manufacturers Association)

```typescript
const pallet = PalletFactory.gma()
// Alias para compatibilidad
const pallet = PalletFactory.american()
```

- **Dimensiones**: 1219×1016×145 mm (48"×40")
- **Estándar**: Norteamérica
- **Material**: Madera
- **Peso propio**: 30 kg
- **Carga máxima**: 1200 kg
- **Uso**: Logística norteamericana, el más común en EEUU y Canadá

También conocido como "American pallet" o "48×40". Es el estándar en Norteamérica y se adapta perfectamente a tráilers de 48 pies.

### UK Standard

```typescript
const pallet = PalletFactory.uk()
```

- **Dimensiones**: 1200×1000×150 mm
- **Estándar**: Reino Unido
- **Material**: Madera
- **Peso propio**: 28 kg
- **Carga máxima**: 1000 kg
- **Uso**: Reino Unido, compatible con ISO 1

Estándar británico, ligeramente más profundo que el EUR. Compatible con el estándar ISO 1.

### Asia Pallet

```typescript
const pallet = PalletFactory.asia()
```

- **Dimensiones**: 1100×1100×150 mm
- **Estándar**: ISO 6780, Asia
- **Material**: Madera
- **Peso propio**: 28 kg
- **Carga máxima**: 1000 kg
- **Uso**: Logística asiática, especialmente Japón y China

Palet cuadrado utilizado principalmente en Asia. Su formato cuadrado facilita la carga en contenedores ISO.

### Australian Standard

```typescript
const pallet = PalletFactory.australian()
```

- **Dimensiones**: 1165×1165×150 mm
- **Estándar**: Australia
- **Material**: Madera
- **Peso propio**: 29 kg
- **Carga máxima**: 1000 kg
- **Uso**: Australia, Nueva Zelanda

Estándar australiano, ligeramente más grande que el palet asiático.

### Half EUR (Medio Europallet)

```typescript
const pallet = PalletFactory.halfEuro()
```

- **Dimensiones**: 800×600×144 mm
- **Estándar**: Europa
- **Material**: Madera
- **Peso propio**: 12 kg
- **Carga máxima**: 500 kg
- **Uso**: Cargas pequeñas, retail, picking

Mitad exacta de un EUR. Útil para pedidos pequeños o en sistemas de picking donde se necesitan unidades más manejables.

### Quarter EUR (Cuarto Europallet)

```typescript
const pallet = PalletFactory.quarterEuro()
```

- **Dimensiones**: 600×400×144 mm
- **Estándar**: Europa
- **Material**: Madera
- **Peso propio**: 6 kg
- **Carga máxima**: 250 kg
- **Uso**: Cargas muy pequeñas, display, promociones

Cuarto de un EUR. Común en displays de punto de venta y para cargas promocionales.

### ISO 1 y ISO 2

```typescript
const pallet1 = PalletFactory.iso1()  // 1200×1000
const pallet2 = PalletFactory.iso2()  // 1200×800
```

Palets definidos por el estándar internacional ISO 6780:
- **ISO 1**: Equivalente al UK Standard (1200×1000×150 mm)
- **ISO 2**: Equivalente al EUR/EPAL (1200×800×144 mm)

## Uso del Factory Genérico

Si prefieres trabajar con strings o construir el tipo dinámicamente:

```typescript
import { PalletFactory, STANDARD_PALLETS } from '@/lib'

// Método genérico
const pallet = PalletFactory.fromPreset('EUR')

// Listar todos los presets disponibles
const presets = Object.keys(STANDARD_PALLETS)
// ['EUR', 'GMA', 'UK', 'ASIA', 'AUSTRALIAN', 'HALF_EUR', 'QUARTER_EUR', 'ISO_1', 'ISO_2']

// Obtener información de un preset
const info = STANDARD_PALLETS.EUR
// { dimensions: {...}, material: 'WOOD', maxWeight: 1000, ... }

// Listar con PalletFactory
const list = PalletFactory.listPresets()
// [{ key: 'EUR', dimensions: {...}, maxWeight: 1000, weight: 25 }, ...]
```

## Overrides

Todos los factory methods aceptan overrides parciales:

```typescript
const customEuro = PalletFactory.euro({
  maxWeight: 1500,  // Aumentar carga máxima
  material: PalletMaterial.PLASTIC,  // Cambiar material
  metadata: { client: 'ACME Corp' }  // Metadatos custom
})
```

## Palets Custom

Para dimensiones no estándar:

```typescript
const custom = PalletFactory.custom(
  { width: 900, height: 140, depth: 750 },
  {
    maxWeight: 800,
    material: PalletMaterial.COMPOSITE
  }
)
```

## Mejores Prácticas

1. **Usa presets cuando sea posible**: Garantiza compatibilidad con estándares internacionales
2. **EUR para Europa**: Si tu logística es europea, usa EUR como predeterminado
3. **GMA para Norteamérica**: Si operas en EEUU/Canadá, usa GMA
4. **Considera el destino**: Elige el tipo según el mercado objetivo
5. **Half/Quarter para picking**: Útiles en almacenes con alta rotación
6. **Documenta customs**: Si creas palets custom, documenta las razones en metadata

## Referencias

- [ISO 6780:2003](https://www.iso.org/standard/36369.html) - Flat pallets for intercontinental materials handling
- [EPAL European Pallet Association](https://www.epal-pallets.org/)
- [GMA Pallet Specifications](https://www.gmaonline.org/)

## Conversión de Unidades

Todas las dimensiones en la librería se expresan en **milímetros (mm)**:

- 1 metro = 1000 mm
- 1 pulgada = 25.4 mm
- 48" = 1219.2 mm ≈ 1219 mm
- 40" = 1016 mm

Para trabajar en Three.js (metros):

```typescript
import { UNITS } from '@/lib'

const widthInMeters = pallet.dimensions.width * UNITS.MM_TO_M  // 1.2 m
```
