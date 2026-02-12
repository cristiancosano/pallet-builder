# Ejemplos de Uso

Esta carpeta contiene ejemplos prácticos de implementación y casos de uso del proyecto Pallet Builder 3D.

## 📂 Estructura

### [basic/](./basic)
Ejemplos básicos para comenzar:
- Configuración simple de pallet
- Añadir objetos básicos
- Navegación de cámara

### [intermediate/](./intermediate)
Ejemplos de complejidad media:
- Múltiples objetos con restricciones
- Validación de peso y volumen
- Guardado y carga de configuraciones

### [advanced/](./advanced)
Ejemplos avanzados:
- Algoritmos de optimización de espacio
- Física y colisiones
- Exportación a diferentes formatos

### [patterns/](./patterns)
Patrones de diseño y arquitectura:
- Composición de componentes
- Gestión de estado compleja
- Hooks personalizados reutilizables

## 🎯 Ejemplos Rápidos

### 1. Escena 3D Básica

```typescript
// examples/basic/simple-scene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

export function SimpleScene() {
  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      {/* Iluminación */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Pallet simple */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.14, 0.8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Objeto sobre el pallet */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      
      {/* Helpers */}
      <Grid />
      <OrbitControls />
    </Canvas>
  )
}
```

### 2. Constructor Interactivo

```typescript
// examples/intermediate/interactive-builder.tsx
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface Box3D {
  id: string
  position: [number, number, number]
  dimensions: [number, number, number]
  color: string
}

export function InteractiveBuilder() {
  const [boxes, setBoxes] = useState<Box3D[]>([])
  
  const addBox = () => {
    const newBox: Box3D = {
      id: crypto.randomUUID(),
      position: [
        Math.random() * 2 - 1,
        0.5,
        Math.random() * 2 - 1
      ],
      dimensions: [0.3, 0.3, 0.3],
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
    setBoxes([...boxes, newBox])
  }
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        
        {/* Pallet base */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.1, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Objetos dinámicos */}
        {boxes.map((box) => (
          <mesh key={box.id} position={box.position}>
            <boxGeometry args={box.dimensions} />
            <meshStandardMaterial color={box.color} />
          </mesh>
        ))}
        
        <OrbitControls />
      </Canvas>
      
      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'white',
        padding: '20px',
        borderRadius: '8px'
      }}>
        <button onClick={addBox}>Añadir Caja</button>
        <p>Objetos: {boxes.length}</p>
      </div>
    </div>
  )
}
```

### 3. Hook Personalizado para Gestión de Pallets

```typescript
// examples/patterns/use-pallet-builder-hook.ts
import { useState, useCallback } from 'react'

interface PalletObject {
  id: string
  position: [number, number, number]
  dimensions: [number, number, number]
  weight: number
}

interface PalletConfig {
  dimensions: [number, number, number]
  maxWeight: number
}

export function usePalletBuilder(config: PalletConfig) {
  const [objects, setObjects] = useState<PalletObject[]>([])
  
  const totalWeight = objects.reduce((sum, obj) => sum + obj.weight, 0)
  const isOverWeight = totalWeight > config.maxWeight
  
  const addObject = useCallback((object: Omit<PalletObject, 'id'>) => {
    const newObject: PalletObject = {
      ...object,
      id: crypto.randomUUID()
    }
    
    if (totalWeight + object.weight > config.maxWeight) {
      console.warn('Excede el peso máximo')
      return false
    }
    
    setObjects(prev => [...prev, newObject])
    return true
  }, [totalWeight, config.maxWeight])
  
  const removeObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setObjects([])
  }, [])
  
  const getObjectById = useCallback((id: string) => {
    return objects.find(obj => obj.id === id)
  }, [objects])
  
  return {
    objects,
    totalWeight,
    isOverWeight,
    remainingWeight: config.maxWeight - totalWeight,
    addObject,
    removeObject,
    clearAll,
    getObjectById
  }
}

// Uso del hook
function PalletBuilderComponent() {
  const {
    objects,
    totalWeight,
    remainingWeight,
    addObject,
    clearAll
  } = usePalletBuilder({
    dimensions: [1.2, 0.14, 0.8],
    maxWeight: 1000
  })
  
  return (
    <div>
      <p>Peso total: {totalWeight}kg</p>
      <p>Peso restante: {remainingWeight}kg</p>
      <button onClick={() => addObject({
        position: [0, 0.5, 0],
        dimensions: [0.3, 0.3, 0.3],
        weight: 50
      })}>
        Añadir objeto (50kg)
      </button>
      <button onClick={clearAll}>Limpiar todo</button>
    </div>
  )
}
```

### 4. Validación de Configuración

```typescript
// examples/patterns/pallet-validation.ts

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validatePalletConfiguration(
  palletSize: [number, number, number],
  objects: Array<{
    position: [number, number, number]
    dimensions: [number, number, number]
  }>
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validar que los objetos no se salgan del pallet
  objects.forEach((obj, index) => {
    const [x, y, z] = obj.position
    const [w, h, d] = obj.dimensions
    const [pw, ph, pd] = palletSize
    
    if (Math.abs(x) + w/2 > pw/2) {
      errors.push(`Objeto ${index + 1} se sale horizontalmente (X)`)
    }
    if (Math.abs(z) + d/2 > pd/2) {
      errors.push(`Objeto ${index + 1} se sale horizontalmente (Z)`)
    }
    if (y - h/2 < 0) {
      errors.push(`Objeto ${index + 1} atraviesa el pallet`)
    }
  })
  
  // Verificar colisiones entre objetos (simplificado)
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (checkCollision(objects[i], objects[j])) {
        warnings.push(`Posible colisión entre objetos ${i + 1} y ${j + 1}`)
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function checkCollision(
  a: { position: [number, number, number], dimensions: [number, number, number] },
  b: { position: [number, number, number], dimensions: [number, number, number] }
): boolean {
  // Detección básica de colisión AABB
  const [ax, ay, az] = a.position
  const [aw, ah, ad] = a.dimensions
  const [bx, by, bz] = b.position
  const [bw, bh, bd] = b.dimensions
  
  return (
    Math.abs(ax - bx) < (aw + bw) / 2 &&
    Math.abs(ay - by) < (ah + bh) / 2 &&
    Math.abs(az - bz) < (ad + bd) / 2
  )
}
```

## 📚 Categorías de Ejemplos

### Por Caso de Uso
- 📦 **Warehouse Planning**: Planificación de almacenes
- 🚚 **Logistics Optimization**: Optimización logística
- 📊 **Visualization**: Visualización de datos 3D
- 🎓 **Educational**: Herramientas educativas

### Por Tecnología
- ⚛️ **React Patterns**: Patrones de React
- 🎨 **Three.js Techniques**: Técnicas avanzadas de Three.js
- 🔧 **R3F Best Practices**: Mejores prácticas de R3F
- 💾 **State Management**: Gestión de estado

### Por Complejidad
- 🟢 **Beginner**: Principiante
- 🟡 **Intermediate**: Intermedio
- 🔴 **Advanced**: Avanzado

## 🚀 Cómo Usar los Ejemplos

1. **Navega** a la carpeta del ejemplo que te interesa
2. **Lee** el README.md de esa carpeta para contexto
3. **Copia** el código que necesites
4. **Adapta** a tu caso de uso específico
5. **Experimenta** modificando parámetros y comportamientos

## 🤝 Contribuir con Ejemplos

¿Tienes un caso de uso interesante? ¡Compártelo!

1. Crea un nuevo archivo en la carpeta apropiada
2. Documenta claramente el propósito del ejemplo
3. Incluye comentarios explicativos en el código
4. Añade screenshots o GIFs si es visual
5. Actualiza este README con el índice

## 💡 Consejos

- Empieza con ejemplos básicos antes de avanzados
- Modifica los ejemplos para aprender cómo funcionan
- Combina diferentes ejemplos para crear algo único
- Lee los comentarios en el código para entender las decisiones

---

**Próximos Ejemplos Planeados**:
- [ ] Exportación a GLB/GLTF
- [ ] Integración con física (Rapier)
- [ ] Algoritmo de bin packing 3D
- [ ] Tour guiado 3D de la configuración
