# Tech Stack Details

> **Propósito**: Información detallada sobre las tecnologías utilizadas en el proyecto y sus versiones.

## 📚 Dependencias Principales

### React Three Fiber Ecosystem

#### @react-three/fiber
- **Versión**: Latest
- **Propósito**: React renderer para Three.js que permite usar Three.js declarativamente
- **Documentación**: https://docs.pmnd.rs/react-three-fiber

**Convenciones de uso**:
```typescript
// Usar Canvas como contenedor principal
import { Canvas } from '@react-three/fiber'

// Componentes 3D dentro de Canvas
<Canvas>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</Canvas>
```

#### @react-three/drei
- **Versión**: Latest
- **Propósito**: Colección de helpers útiles para react-three-fiber
- **Documentación**: https://github.com/pmndrs/drei

**Componentes útiles**:
- `OrbitControls`: Controles de cámara
- `Sky`: Cielo procedural
- `Environment`: Entorno HDR
- `Grid`: Rejilla de referencia
- `GizmoHelper`: Gizmo de orientación

#### Three.js
- **Versión**: Latest compatible con R3F
- **Propósito**: Librería 3D WebGL
- **Documentación**: https://threejs.org/docs/

## 🎨 Framework & Build Tools

### React
- **Versión**: 18.x
- **Características utilizadas**:
  - Hooks (useState, useEffect, useRef, etc.)
  - Suspense para carga asíncrona
  - Concurrent features

### TypeScript
- **Versión**: 5.x
- **Configuración**: Strict mode habilitado
- **Convenciones**:
  - Tipos explícitos para props
  - Interfaces para objetos complejos
  - Tipos utilitarios de React (@types/react)

### Vite
- **Versión**: Latest
- **Propósito**: Build tool ultra-rápido
- **Características**:
  - HMR (Hot Module Replacement)
  - TypeScript out-of-the-box
  - Optimización de producción

## 🔧 Herramientas de Desarrollo

### ESLint
- **Configuración**: Basada en estándares de TypeScript y React
- **Plugins**: TypeScript, React Hooks

### pnpm
- **Versión**: Latest
- **Propósito**: Package manager eficiente
- **Ventajas**: 
  - Espacio en disco optimizado
  - Instalación más rápida
  - Gestión estricta de dependencias

## 📦 Gestión de Estado (Futuro)

### Opciones a considerar:
1. **Zustand** (Recomendado para estado global simple)
2. **Jotai** (Atoms para estado atómico)
3. **React Context + Hooks** (Para estado simple)

## 🎯 Librerías de Utilidad (Futuro)

### Consideradas para incorporar:
- **@react-three/postprocessing**: Efectos de post-procesamiento
- **@react-three/rapier**: Física 3D
- **leva**: GUI de controles para desarrollo
- **zustand**: State management minimalista

## 🔒 Consideraciones de Rendimiento

### Three.js / R3F
- Usar `useMemo` y `useCallback` para evitar re-renders innecesarios
- Implementar `InstancedMesh` para muchos objetos similares
- Considerar `Level of Detail (LOD)` para escenas complejas
- Usar `useFrame` con precaución, evitar operaciones pesadas

### React
- Code splitting con lazy loading
- Memoización de componentes pesados
- Virtualización de listas largas (si aplica)

## 🌐 Compatibilidad

### Navegadores Objetivo
- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)

### Requisitos de WebGL
- WebGL 2.0 preferido
- Fallback a WebGL 1.0 si es necesario

## 📝 Notas de Implementación

### Estructura de Componentes 3D
```typescript
// Patrón recomendado para componentes 3D
interface PalletProps {
  dimensions: { width: number; height: number; depth: number }
  position?: [number, number, number]
}

export function Pallet({ dimensions, position = [0, 0, 0] }: PalletProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshStandardMaterial color="brown" />
    </mesh>
  )
}
```

### Hooks Personalizados
```typescript
// Ejemplo de hook para gestión de objetos 3D
function usePalletBuilder() {
  const [objects, setObjects] = useState<Object3D[]>([])
  
  const addObject = useCallback((object: Object3D) => {
    setObjects(prev => [...prev, object])
  }, [])
  
  return { objects, addObject }
}
```
