# Coding Conventions

> **Propósito**: Estándares de código y convenciones para mantener consistencia en el proyecto.

## 🎯 Principios Generales

1. **Claridad sobre Brevedad**: El código debe ser fácil de leer y entender
2. **DRY (Don't Repeat Yourself)**: Evitar duplicación de código
3. **SOLID Principles**: Aplicar cuando sea apropiado
4. **Componentes Pequeños**: Mantener componentes enfocados en una responsabilidad

## 📁 Estructura de Archivos

### Nomenclatura

```typescript
// Componentes: PascalCase
Button.tsx
PalletViewer.tsx

// Hooks: camelCase con prefijo 'use'
usePalletBuilder.ts
useThreeScene.ts

// Utilities: camelCase
formatDimensions.ts
calculateVolume.ts

// Types: PascalCase con sufijo 'Type' o 'Interface'
PalletType.ts
UserPreferencesInterface.ts

// Constants: UPPER_CASE (si son primitivos)
MAX_PALLET_HEIGHT.ts
// o PascalCase si son objetos complejos
DefaultConfig.ts
```

### Organización de Imports

```typescript
// 1. React y librerías externas
import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

// 2. Imports internos - tipos
import type { PalletConfig, ObjectDimensions } from '@/types'

// 3. Imports internos - componentes
import { Pallet } from '@/components/Pallet'
import { ControlPanel } from '@/components/ControlPanel'

// 4. Imports internos - hooks y utils
import { usePalletBuilder } from '@/hooks/usePalletBuilder'
import { calculateVolume } from '@/utils/calculations'

// 5. Estilos
import './Component.css'
```

## 🎨 Componentes React

### Estructura de Componente

```typescript
import { useState, useCallback, memo } from 'react'
import type { FC } from 'react'

// 1. Tipos e Interfaces
interface PalletViewerProps {
  config: PalletConfig
  onUpdate?: (config: PalletConfig) => void
  className?: string
}

// 2. Constantes del componente (si las hay)
const DEFAULT_CAMERA_POSITION = [5, 5, 5] as const

// 3. Componente
export const PalletViewer: FC<PalletViewerProps> = memo(({ 
  config, 
  onUpdate,
  className 
}) => {
  // 3.1 Hooks de estado
  const [isLoading, setIsLoading] = useState(false)
  
  // 3.2 Custom hooks
  const { objects, addObject } = usePalletBuilder()
  
  // 3.3 Callbacks y handlers
  const handleAddObject = useCallback(() => {
    // implementación
  }, [])
  
  // 3.4 Effects
  useEffect(() => {
    // implementación
  }, [config])
  
  // 3.5 Render
  return (
    <div className={className}>
      {/* JSX */}
    </div>
  )
})

// 4. Display name (útil para debugging)
PalletViewer.displayName = 'PalletViewer'
```

### Componentes 3D (React Three Fiber)

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface BoxProps {
  position?: [number, number, number]
  color?: string
}

export function Box({ position = [0, 0, 0], color = 'orange' }: BoxProps) {
  const meshRef = useRef<Mesh>(null)
  
  // Animaciones con useFrame
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
```

## 🔧 TypeScript

### Tipos vs Interfaces

```typescript
// Usar 'type' para:
// - Uniones
type Status = 'idle' | 'loading' | 'success' | 'error'

// - Intersecciones
type UserWithPermissions = User & Permissions

// - Tipos utilitarios
type PartialConfig = Partial<Config>

// Usar 'interface' para:
// - Definiciones de objetos que pueden extenderse
interface PalletConfig {
  width: number
  height: number
  depth: number
}

// - Props de componentes
interface ButtonProps {
  label: string
  onClick: () => void
}
```

### Tipos Genéricos

```typescript
// Funciones genéricas bien tipadas
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value)
}

// Componentes genéricos
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>
}
```

## 🎣 Custom Hooks

```typescript
// Nomenclatura: siempre comenzar con 'use'
// Retornar objeto con propiedades nombradas (no array)
function usePalletBuilder(initialConfig?: PalletConfig) {
  const [config, setConfig] = useState(initialConfig)
  const [objects, setObjects] = useState<Object3D[]>([])
  
  const addObject = useCallback((object: Object3D) => {
    setObjects(prev => [...prev, object])
  }, [])
  
  const removeObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.uuid !== id))
  }, [])
  
  const reset = useCallback(() => {
    setObjects([])
    setConfig(initialConfig)
  }, [initialConfig])
  
  return {
    config,
    objects,
    addObject,
    removeObject,
    reset
  }
}
```

## 📝 Comentarios y Documentación

### JSDoc para funciones complejas

```typescript
/**
 * Calcula el volumen óptimo de empaquetado para un pallet
 * @param dimensions - Dimensiones del pallet (ancho, alto, profundidad)
 * @param objects - Array de objetos a colocar
 * @param options - Opciones de optimización
 * @returns Configuración optimizada con posiciones calculadas
 * @throws {Error} Si las dimensiones son inválidas
 */
function calculateOptimalPacking(
  dimensions: Dimensions,
  objects: PackableObject[],
  options?: OptimizationOptions
): OptimizedConfig {
  // implementación
}
```

### Comentarios en línea

```typescript
// ✅ Buenos comentarios: Explican el "por qué"
// Usamos requestAnimationFrame en lugar de setInterval
// para sincronizar con el refresh rate del navegador
useFrame(() => {
  // ...
})

// ❌ Malos comentarios: Explican el "qué" (ya obvio en el código)
// Incrementa el contador
setCount(count + 1)
```

## 🏗️ Patrones de Diseño

### Composición sobre Herencia

```typescript
// ✅ Bueno: Composición
function PalletWithControls() {
  return (
    <>
      <Pallet />
      <Controls />
    </>
  )
}

// ❌ Evitar: Herencia compleja de clases
```

### Props Drilling vs Context

```typescript
// Para datos que muchos componentes necesitan: Context
const PalletContext = createContext<PalletContextValue | null>(null)

export function PalletProvider({ children }: { children: ReactNode }) {
  const value = usePalletBuilder()
  return <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
}

export function usePalletContext() {
  const context = useContext(PalletContext)
  if (!context) throw new Error('usePalletContext must be used within PalletProvider')
  return context
}
```

## ⚡ Rendimiento

```typescript
// Memoización de componentes pesados
export const ExpensiveComponent = memo(({ data }: Props) => {
  // render pesado
}, (prevProps, nextProps) => {
  // función de comparación personalizada si es necesario
  return prevProps.data.id === nextProps.data.id
})

// useMemo para cálculos pesados
const optimizedLayout = useMemo(() => {
  return calculateComplexLayout(objects, dimensions)
}, [objects, dimensions])

// useCallback para funciones pasadas como props
const handleObjectAdd = useCallback((object: Object3D) => {
  // handler
}, [dependencies])
```

## 🧪 Testing (Futuro)

```typescript
// Nomenclatura de archivos de test
Component.test.tsx
utils.test.ts

// Estructura de tests
describe('PalletBuilder', () => {
  it('should add object to pallet', () => {
    // arrange
    // act
    // assert
  })
  
  it('should throw error when dimensions are invalid', () => {
    // test
  })
})
```

## 🚫 Anti-patrones a Evitar

```typescript
// ❌ Any types
const data: any = fetchData()

// ✅ Tipos apropiados
const data: UserData = fetchData()

// ❌ Mutación directa de estado
objects.push(newObject)

// ✅ Inmutabilidad
setObjects([...objects, newObject])

// ❌ Efectos sin dependencias correctas
useEffect(() => {
  doSomething(prop)
}, []) // falta 'prop'

// ✅ Dependencias completas
useEffect(() => {
  doSomething(prop)
}, [prop])
```

## 📏 Límites de Código

- **Componente**: Máximo 250 líneas (considerar dividir si es más grande)
- **Función**: Máximo 50 líneas
- **Línea de código**: Máximo 100 caracteres
- **Parámetros de función**: Máximo 4 (usar objetos para más)

## 🎨 Estilos

```typescript
// Preferir CSS Modules o Styled Components sobre inline styles
// para estilos complejos

// ✅ CSS Modules
import styles from './Component.module.css'
<div className={styles.container} />

// ✅ Inline styles para valores dinámicos simples
<mesh position={[x, y, z]} />

// ❌ Evitar inline styles complejos
<div style={{ 
  width: '100px', 
  height: '100px', 
  backgroundColor: 'red',
  // ... muchas más propiedades
}} />
```
