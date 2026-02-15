# API Reference

Referencia de la API pública de Pallet Builder. Se generará conforme avance la implementación.

## Documentación Disponible

| Documento | Descripción |
|-----------|-------------|
| [packing-strategies.md](./packing-strategies.md) | API de estrategias de empaquetado (PackingStrategy, PackingRegistry, estrategias disponibles) |

## Estructura prevista

| Sección | Contenido |
|---------|----------|
| Componentes primitivos | `<Box />`, `<Pallet />`, `<Separator />`, `<StackedPallet />`, `<Label />` |
| Environments | `<WarehouseEnvironment />`, `<TruckEnvironment />` |
| Scenes | `<PalletScene />`, `<TruckScene />`, `<WarehouseScene />` |
| Hooks | `usePhysicsValidation`, `usePalletMetrics`, `usePackingStrategy` |
| Core/Validation | Funciones puras: `validateNoBoxCollisions`, `validateBounds`, `validateWeight`, etc. |
| Core/Packing | `PackingStrategy` (interfaz), `ColumnStrategy`, `BinPacking3DStrategy`, `PackingRegistry` |
| Core/Factories | `PalletFactory`, `TruckFactory` |
| Tipos | `Box`, `Pallet`, `Warehouse`, `Room`, `Truck`, `StackedPallet`, `Dimensions3D`, etc. |

Ver [entities.md](../domain/entities.md) para las interfaces TypeScript completas.

## 📝 Formato de Documentación

Cada archivo de documentación sigue este formato:

```markdown
# NombreDelComponente/Hook/Util

Breve descripción de qué hace y para qué sirve.

## Import

\`\`\`typescript
import { NombreDelComponente } from '@/components/NombreDelComponente'
\`\`\`

## Tipo/Interfaz

\`\`\`typescript
interface Props {
  prop1: string
  prop2?: number
}
\`\`\`

## Uso

\`\`\`typescript
ejemplo de código
\`\`\`

## Props/Parámetros

Tabla con descripción detallada

## Retorna

Qué retorna (si aplica)

## Ejemplos

Ejemplos de uso comunes

## Notas

Consideraciones especiales
```

## 🔍 Índice Rápido

### Componentes Principales (Próximamente)
- `Canvas` - Contenedor principal de la escena 3D
- `Pallet` - Componente de pallet 3D
- `PalletBuilder` - Constructor interactivo de pallets
- `ControlPanel` - Panel de controles UI

### Hooks Principales (Próximamente)
- `usePalletBuilder` - Gestión de estado del constructor
- `use3DObjectPlacement` - Colocación de objetos 3D
- `usePalletValidation` - Validación de configuraciones

### Utilidades Principales (Próximamente)
- `calculateVolume` - Cálculo de volúmenes
- `validateDimensions` - Validación de dimensiones
- `formatMeasurement` - Formateo de medidas

## 🚀 Cómo Usar Esta Documentación

1. **Navegación**: Explora las subcarpetas para encontrar lo que necesitas
2. **Búsqueda**: Usa Cmd/Ctrl+F para búsqueda rápida
3. **Ejemplos**: Copia y adapta los ejemplos de código
4. **Tipos**: Revisa las interfaces para entender las props/params

## 🤝 Contribuir

Al añadir nuevos componentes/hooks/utils:

1. Crea un archivo `.md` correspondiente en la carpeta apropiada
2. Sigue el formato estándar de documentación
3. Incluye ejemplos de uso prácticos
4. Actualiza este índice

## 📌 Convenciones

- **Nombres de archivo**: `ComponentName.md`, `hookName.md`, `utilityName.md`
- **Código**: Incluye tipos TypeScript completos
- **Ejemplos**: Proporciona al menos 1-2 ejemplos de uso
- **Links**: Enlaza a documentación relacionada cuando sea relevante

---

**Nota**: Esta documentación se genera automáticamente en el futuro mediante herramientas de documentación como TypeDoc o similar.
