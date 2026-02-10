# Project Overview — Pallet Builder

> **Propósito**: Visión general del proyecto para herramientas de IA y nuevos desarrolladores.

## Qué es Pallet Builder

Pallet Builder es una **librería npm de componentes React / React Three Fiber** para visualizar y gestionar la carga logística en 3D. **No es una aplicación** — exporta primitivas 3D, escenas precompuestas, entidades de dominio, hooks y funciones de validación que los desarrolladores integran en sus propias apps.

## Problema que resuelve

En logística de almacenamiento y transporte, planificar la disposición de mercancía sobre palets, dentro de camiones y en estancias de almacén requiere:

- Validar restricciones físicas (colisiones, peso, estabilidad).
- Optimizar el uso del volumen disponible.
- Visualizar la configuración antes de la carga física.

Pallet Builder proporciona los **building blocks 3D** para construir estas herramientas.

## Tres espacios de visualización

| Espacio | Descripción |
|---------|-------------|
| **Almacén (Warehouse)** | Conjunto de estancias (rooms) con planta poligonal irregular y techo. Se colocan palets apilados en el suelo. |
| **Camión (Truck)** | Contenedor rectangular con presets por tipo (caja seca, refrigerado, plataforma, cortina). Se colocan palets dentro. |
| **Palet (Pallet)** | Unidad individual con cajas empaquetadas en pisos, separadores opcionales y apilamiento de palets. |

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Lenguaje | TypeScript 5+ (strict mode) |
| UI / Rendering | React 18+, React Three Fiber, @react-three/drei |
| 3D Engine | Three.js |
| Build tool | Vite (modo library) |
| Test runner | Vitest |
| Package manager | pnpm |
| Linter | ESLint (flat config) |

## Arquitectura de Alto Nivel

```
┌──────────────────────────────────────────────────────────┐
│                    Aplicación del consumidor              │
│         (store propio, UI propia, flujos propios)         │
└────────────────────────┬─────────────────────────────────┘
                         │  props / callbacks
                         ▼
┌──────────────────────────────────────────────────────────┐
│               Scenes (Escenas precompuestas)              │
│     WarehouseScene · TruckScene · PalletScene             │
└────────────────────────┬─────────────────────────────────┘
                         │  compone
                         ▼
┌──────────────────────────────────────────────────────────┐
│          Components (Primitivas 3D + Environments)        │
│  <Box/> <Pallet/> <StackedPallet/> <Separator/> <Label/> │
│  <WarehouseEnvironment/> <TruckEnvironment/>              │
└────────────────────────┬─────────────────────────────────┘
                         │  usa
                         ▼
┌──────────────────────────────────────────────────────────┐
│                        Hooks                              │
│  usePhysicsValidation · usePalletMetrics                  │
│  usePackingStrategy                                       │
└────────────────────────┬─────────────────────────────────┘
                         │  invoca
                         ▼
┌──────────────────────────────────────────────────────────┐
│              Core (TypeScript puro)                        │
│  entities/ · validation/ · packing/ · factories/          │
│  SIN React · SIN Three.js · Testeable en Node             │
└──────────────────────────────────────────────────────────┘
```

## Principios de diseño

1. **Library, not app** — Solo exporta bloques reutilizables. `App.tsx` es una demo.
2. **Controlled components** — Sin estado interno; todo llega por props, todo sale por callbacks.
3. **Core puro** — La lógica de dominio no depende de React ni Three.js.
4. **Adapter pattern** — Los algoritmos de empaquetado son intercambiables y extensibles.
5. **No incluye state management** — El consumidor elige su solución (Zustand, Redux, Context…).

## Estructura del proyecto

```
pallet-builder/
├── src/
│   ├── core/              # Entidades, validación, packing, factories
│   ├── components/        # Primitives, environments, controls, scenes
│   ├── hooks/             # Custom hooks React
│   ├── lib.ts             # Entry point librería (exports públicos)
│   ├── App.tsx            # Demo / playground (NO se publica)
│   └── main.tsx           # Bootstrap demo
├── docs/                  # Documentación completa
├── public/                # Assets de la demo
├── vite.config.ts         # Configuración Vite (modo lib)
└── package.json
```

## Público objetivo

- **Desarrolladores frontend** que construyen herramientas logísticas.
- **Equipos de producto** en empresas de transporte, almacenaje y 3PL.
- **Integradores** que necesitan visualización 3D de carga en sus plataformas.

## Estado actual

**Versión**: 0.1.0 (desarrollo inicial)

Se ha completado la fase de análisis de requisitos y diseño de arquitectura. La documentación está lista y la implementación del código comienza a continuación.

## Documentación relacionada

- [Arquitectura](../architecture/ARCHITECTURE.md)
- [Requisitos funcionales](../domain/requirements.md)
- [Entidades de dominio](../domain/entities.md)
- [Reglas de negocio](../domain/business-rules.md)
- [Glosario](../domain/glossary.md)
- [Tech Stack](tech-stack.md)
- [Coding Conventions](coding-conventions.md)
