# Project Overview - Pallet Builder 3D

> **Propósito**: Este documento proporciona una visión general del proyecto para herramientas de desarrollo asistidas por IA.

## 🎯 Objetivo del Proyecto

Pallet Builder 3D es una aplicación web interactiva que permite a los usuarios construir y visualizar configuraciones de pallets en un entorno 3D. El objetivo es proporcionar una herramienta intuitiva para planificar y optimizar la disposición de cargas en pallets.

## 🛠️ Stack Tecnológico

### Core
- **React** - Framework de UI
- **TypeScript** - Lenguaje de programación
- **Vite** - Build tool y dev server

### 3D & Visualización
- **Three.js** - Librería 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers y abstracciones para R3F

### Herramientas de Desarrollo
- **ESLint** - Linting
- **pnpm** - Package manager

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────┐
│         React Application           │
│  ┌───────────────────────────────┐  │
│  │   React Three Fiber (R3F)    │  │
│  │  ┌─────────────────────────┐ │  │
│  │  │      Three.js Scene     │ │  │
│  │  │  - Pallet Models        │ │  │
│  │  │  - Camera Controls      │ │  │
│  │  │  - Lights & Materials   │ │  │
│  │  └─────────────────────────┘ │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   State Management Layer     │  │
│  │  - Pallet Configuration      │  │
│  │  - Object Placement          │  │
│  │  - User Interactions         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🎨 Características Principales

1. **Visualización 3D Interactiva**
   - Manipulación de objetos en tiempo real
   - Vista isométrica y perspectiva
   - Controles de cámara intuitivos

2. **Constructor de Pallets**
   - Añadir/eliminar objetos
   - Configuración de dimensiones
   - Validación de restricciones

3. **Optimización de Espacio**
   - Cálculos de carga
   - Sugerencias de disposición
   - Exportación de configuraciones

## 📦 Estructura del Proyecto

```
pallet-builder/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilidades y helpers
│   ├── types/          # Definiciones TypeScript
│   ├── scenes/         # Escenas 3D
│   └── assets/         # Recursos estáticos
├── public/             # Archivos públicos
└── docs/               # Documentación
```

## 🎯 Casos de Uso

1. **Planificación Logística**: Empresas que necesitan optimizar la carga de mercancías
2. **Educación**: Estudiantes aprendiendo sobre logística y optimización espacial
3. **Visualización**: Visualizar configuraciones antes de la carga física

## 🔄 Flujo de Trabajo Típico

1. Usuario abre la aplicación
2. Selecciona dimensiones del pallet
3. Añade objetos con sus dimensiones
4. Posiciona objetos en el espacio 3D
5. Valida la configuración
6. Exporta o guarda la configuración

## 🚀 Estado Actual

**Version**: 0.1.0 (Desarrollo Inicial)
**Fase**: Setup del proyecto y configuración base

### Próximos Hitos
- [ ] Implementar escena 3D básica
- [ ] Crear componentes de UI principales
- [ ] Añadir sistema de estado
- [ ] Implementar controles de interacción 3D

## 📝 Notas para IA

Este proyecto está en fase inicial. Al generar código:
- Prioriza TypeScript estricto
- Usa componentes funcionales de React
- Sigue las convenciones de react-three-fiber
- Mantén la separación de responsabilidades
- Documenta funciones complejas
