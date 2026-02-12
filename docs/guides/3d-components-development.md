# Desarrollo de Componentes 3D

Esta guía cubre las mejores prácticas para desarrollar componentes 3D usando React Three Fiber en el proyecto Pallet Builder.

## 🎯 Fundamentos

### Estructura Básica de un Componente 3D

```typescript
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface PalletProps {
  dimensions: {
    width: number
    height: number
    depth: number
  }
  position?: [number, number, number]
  color?: string
}

export function Pallet({ 
  dimensions, 
  position = [0, 0, 0], 
  color = '#8B4513' 
}: PalletProps) {
  const meshRef = useRef<Mesh>(null)
  
  return (
    <group position={position}>
      {/* Base del pallet */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[
          dimensions.width,
          dimensions.height,
          dimensions.depth
        ]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Detalles adicionales */}
      {/* ... */}
    </group>
  )
}
```

## 🏗️ Patrones de Diseño

### 1. Composición de Componentes

```typescript
// Componente compuesto de otros componentes 3D
export function CompletePallet({ config }: { config: PalletConfig }) {
  return (
    <group>
      <PalletBase dimensions={config.dimensions} />
      <PalletSlats count={config.slatCount} />
      <PalletBlocks positions={config.blockPositions} />
    </group>
  )
}
```

### 2. Uso de Refs para Acceso Directo

```typescript
export function AnimatedBox() {
  const meshRef = useRef<Mesh>(null)
  
  // Acceso directo al objeto Three.js
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

### 3. Hooks Personalizados para Lógica 3D

```typescript
// hooks/use3DObjectPlacement.ts
import { useState, useCallback } from 'react'
import { Vector3 } from 'three'

export function use3DObjectPlacement() {
  const [objects, setObjects] = useState<PlacedObject[]>([])
  
  const addObject = useCallback((position: Vector3, dimensions: Dimensions) => {
    const newObject: PlacedObject = {
      id: crypto.randomUUID(),
      position: position.toArray(),
      dimensions,
      timestamp: Date.now()
    }
    setObjects(prev => [...prev, newObject])
  }, [])
  
  const removeObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setObjects([])
  }, [])
  
  return { objects, addObject, removeObject, clearAll }
}

// Uso en componente
function PalletBuilder() {
  const { objects, addObject } = use3DObjectPlacement()
  
  return (
    <Canvas>
      {objects.map(obj => (
        <Box key={obj.id} position={obj.position} {...obj.dimensions} />
      ))}
    </Canvas>
  )
}
```

## 🎨 Materiales y Texturas

### Materiales Básicos

```typescript
// Material simple con color
<meshStandardMaterial color="#8B4513" />

// Material con propiedades físicas
<meshStandardMaterial 
  color="#8B4513"
  roughness={0.8}
  metalness={0.2}
/>

// Material con transparencia
<meshStandardMaterial 
  color="#00ff00"
  transparent
  opacity={0.5}
/>
```

### Carga de Texturas

```typescript
import { useTexture } from '@react-three/drei'

function TexturedPallet() {
  const [colorMap, normalMap, roughnessMap] = useTexture([
    '/textures/wood-color.jpg',
    '/textures/wood-normal.jpg',
    '/textures/wood-roughness.jpg',
  ])
  
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial 
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  )
}
```

## 💡 Iluminación

### Setup Básico de Luces

```typescript
function SceneLighting() {
  return (
    <>
      {/* Luz ambiental suave */}
      <ambientLight intensity={0.4} />
      
      {/* Luz direccional (sol) */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Luz de relleno */}
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
    </>
  )
}
```

## 🎮 Interactividad

### Eventos de Mouse

```typescript
function InteractiveCube() {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  
  return (
    <mesh
      onClick={() => setActive(!active)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={active ? 1.5 : 1}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}
```

## ⚡ Optimización de Rendimiento

### 1. Instanced Meshes (para muchos objetos idénticos)

```typescript
import { useRef, useMemo } from 'react'
import { InstancedMesh, Object3D } from 'three'

function ManyBoxes({ count = 1000 }) {
  const meshRef = useRef<InstancedMesh>(null)
  
  const tempObject = useMemo(() => new Object3D(), [])
  
  useMemo(() => {
    if (!meshRef.current) return
    
    for (let i = 0; i < count; i++) {
      tempObject.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      )
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count, tempObject])
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

### 2. Memo para Componentes Complejos

```typescript
import { memo } from 'react'

export const ComplexPallet = memo(function ComplexPallet({ config }: Props) {
  // Renderizado complejo...
  return <group>{/* ... */}</group>
}, (prevProps, nextProps) => {
  // Comparación personalizada
  return prevProps.config.id === nextProps.config.id
})
```

### 3. useMemo para Geometrías Complejas

```typescript
function ComplexGeometry({ points }: { points: Vector3[] }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    // Crear geometría compleja...
    return geo
  }, [points])
  
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial />
    </mesh>
  )
}
```

## 🔧 Helpers de drei

### OrbitControls

```typescript
import { OrbitControls } from '@react-three/drei'

function Scene() {
  return (
    <Canvas>
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />
      {/* resto de la escena */}
    </Canvas>
  )
}
```

### Grid y Helpers Visuales

```typescript
import { Grid, GizmoHelper, GizmoViewport } from '@react-three/drei'

function SceneHelpers() {
  return (
    <>
      <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
      
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport 
          axisColors={['red', 'green', 'blue']} 
          labelColor="black" 
        />
      </GizmoHelper>
    </>
  )
}
```

## 🐛 Debugging

### Stats para Performance

```typescript
import { Stats } from '@react-three/drei'

function App() {
  return (
    <Canvas>
      <Stats />
      {/* escena */}
    </Canvas>
  )
}
```

### useHelper para Visualizar

```typescript
import { useRef } from 'react'
import { DirectionalLightHelper } from 'three'
import { useHelper } from '@react-three/drei'

function Light() {
  const lightRef = useRef()
  useHelper(lightRef, DirectionalLightHelper, 1, 'red')
  
  return <directionalLight ref={lightRef} position={[0, 5, 0]} />
}
```

## 📚 Recursos Adicionales

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Components](https://github.com/pmndrs/drei)
- [Three.js Docs](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)

## 💡 Tips Finales

1. **Empaqueta objetos relacionados en `<group>`** para manipularlos juntos
2. **Usa `castShadow` y `receiveShadow`** para sombras realistas
3. **Aprovecha los hooks de R3F** (`useFrame`, `useThree`, `useLoader`)
4. **Mantén la lógica compleja fuera del render** usando hooks personalizados
5. **Profile regularmente** con Stats y DevTools
6. **Documenta las matemáticas complejas** con comentarios claros
