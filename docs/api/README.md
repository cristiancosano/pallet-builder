# Documentación de API

Esta carpeta contiene la documentación de referencia para componentes, hooks, utilidades y tipos utilizados en el proyecto.

## 📚 Estructura

### [components/](./components)
Documentación de todos los componentes React del proyecto:
- Componentes 3D (Three.js/R3F)
- Componentes UI
- Componentes de layout

### [hooks/](./hooks)
Documentación de custom hooks:
- Hooks de estado
- Hooks de R3F
- Hooks de utilidad

### [utils/](./utils)
Funciones utilitarias y helpers:
- Cálculos matemáticos
- Formateo y validación
- Helpers diversos

### [types/](./types)
Definiciones de tipos TypeScript:
- Interfaces
- Types
- Enums

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
