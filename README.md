# 📦 @cristiancosano/pallet-builder

Sistema modular para visualización 3D de logística basado en React y React Three Fiber.

## 🎯 Descripción

Librería de componentes React que permite construir escenas 3D interactivas para visualizar operaciones logísticas como almacenes, pallets, cajas y contenedores de transporte.

## ✨ Características

- 🧱 **Sistema Modular**: Arquitectura limpia con separación entre lógica core y visualización
- 🎨 **Componentes Declarativos**: API simple basada en componentes React
- 📐 **Estándares Industriales**: Soporte para pallets EURO, ISO y personalizados  
- 🔄 **Real-time**: Visualización 3D interactiva con controles de cámara
- 📊 **Validaciones**: Lógica de negocio para validar dimensiones, pesos y ocupación
- 🎯 **Agnóstico**: Core en TypeScript puro sin dependencias de frameworks de visualización

## 🚀 Inicio Rápido

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:5173](http://localhost:5173) para ver la demo.

## 📖 Uso Básico

```tsx
import { Warehouse, Pallet, Box } from '@cristiancosano/pallet-builder';

function MiAppLogistica() {
  return (
    <Warehouse width={5000} depth={5000} showGrid>
      
      <Pallet id="pallet-A" position={[0, 0, 0]} type="EURO">
        <Box 
          dimensions={[400, 300, 200]} 
          position={[0, 0, 0]} 
          color="orange" 
          label="Caja 1"
        />
      </Pallet>

      <Pallet id="pallet-B" position={[1500, 0, 0]} type="ISO">
        <Box 
          dimensions={[500, 400, 300]} 
          position={[0, 0, 0]} 
          color="blue" 
        />
      </Pallet>

    </Warehouse>
  );
}
```

## 🏗️ Arquitectura

### Core (TypeScript Puro)

Lógica de negocio agnóstica al framework de visualización:

```typescript
import { BoxEntity, PalletEntity, ContainerEntity } from '@cristiancosano/pallet-builder';

// Crear un pallet con validaciones
const pallet = new PalletEntity({
  id: 'pallet-1',
  type: 'EURO',
  position: [0, 0, 0],
  boxes: [
    {
      id: 'box-1',
      dimensions: [400, 300, 200], // mm
      position: [0, 0, 0],
      weight: 25, // kg
    }
  ]
});

// Validar configuración
const validation = pallet.validate();
console.log('Peso total:', pallet.getTotalWeight(), 'kg');
console.log('Ocupación:', pallet.getOccupancyRate(), '%');
```

### Componentes (React + R3F)

Componentes visuales 3D construidos con React Three Fiber:

- **`<Warehouse>`**: Contenedor principal de la escena 3D
- **`<Pallet>`**: Representa un pallet con soporte para EURO, ISO o custom
- **`<Box>`**: Caja/paquete posicionable dentro de un pallet
- **`<CameraControls>`**: Controles de cámara (órbita, primera persona, etc.)

## 📐 Estándares de Pallets

### EUR-Pallet (EURO)
- Dimensiones: 800 x 1200 x 144 mm
- Peso máximo: 1500 kg
- Altura máxima: 2200 mm

### ISO Pallet (ISO)
- Dimensiones: 1000 x 1200 x 144 mm
- Peso máximo: 2000 kg
- Altura máxima: 2200 mm

### Custom
- Dimensiones personalizables
- Configuración flexible

## 🎨 Componentes Disponibles

### Warehouse

Contenedor principal que crea la escena 3D con iluminación y controles.

```tsx
<Warehouse 
  width={5000}      // mm
  depth={5000}      // mm
  height={3000}     // mm (opcional)
  showGrid={true}   // Mostrar grid del suelo
  backgroundColor="#f0f0f0"
>
  {/* Contenido */}
</Warehouse>
```

### Pallet

Representa un pallet estándar o personalizado.

```tsx
<Pallet 
  id="pallet-1"
  type="EURO"             // 'EURO' | 'ISO' | 'CUSTOM'
  position={[0, 0, 0]}    // [x, y, z] en mm
  rotation={[0, 0, 0]}    // [x, y, z] en radianes
  color="#8B4513"
  showDimensions={false}
  customDimensions={[1000, 144, 1200]}  // Para CUSTOM
>
  {/* Cajas */}
</Pallet>
```

### Box

Caja o paquete dentro de un pallet.

```tsx
<Box 
  dimensions={[400, 300, 200]}  // [ancho, alto, fondo] en mm
  position={[0, 0, 0]}           // [x, y, z] dentro del pallet
  color="#ff6b35"
  label="Caja 1"
  onClick={() => console.log('Click!')}
  onHover={(hovered) => console.log(hovered)}
/>
```

## 🎨 Personalización con AspectConfig

El sistema `AspectConfig` permite personalizar la apariencia visual de cada componente individualmente.

### Configuración Global

Define valores por defecto para todos los componentes:

```tsx
import { ConfigurationProvider, PalletBuilder, Box } from '@cristiancosano/pallet-builder';

function App() {
  return (
    <ConfigurationProvider 
      config={{ 
        usePalletModel: true,
        palletModelUrl: '/objects/pallet.glb',
        palletTextureUrl: '/textures/pallet_planks.png',
        useBoxModel: true,
        boxModelUrl: '/objects/box.glb',
        boxTextureUrl: '/textures/crate_roughness.png'
      }}
    >
      <PalletBuilder palletType="EURO">
        <Box dimensions={[400, 300, 200]} position={[0, 0, 0]} color="#ff6b35" />
      </PalletBuilder>
    </ConfigurationProvider>
  );
}
```

### Personalización por Componente

Cada pallet o caja puede tener su propia textura, modelo o color:

```tsx
<PalletBuilder 
  palletType="EURO"
  palletAspect={{ textureUrl: '/textures/dark_wood.png' }}
>
  {/* Caja con color personalizado */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 0]}
    aspect={{ color: '#00d9ff' }}
    label="Caja Azul"
  />
  
  {/* Caja con textura personalizada */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[400, 0, 0]}
    aspect={{ textureUrl: '/textures/cardboard.png' }}
    label="Caja Cartón"
  />
  
  {/* Caja con modelo 3D personalizado */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 400]}
    aspect={{ 
      modelUrl: '/objects/custom_box.glb',
      textureUrl: '/textures/metal.png'
    }}
    label="Caja Metal"
  />
</PalletBuilder>
```

### Modelos 3D y Texturas por Defecto

La librería viene configurada con modelos y texturas por defecto:

**Pallets:**
- Modelo: `/objects/pallet.glb`
- Textura: `/textures/pallet_planks.png`

**Cajas:**
- Modelo: `/objects/box.glb`
- Textura: `/textures/crate_roughness.png`

Puedes usar tus propios modelos GLB y texturas personalizando la configuración global o usando el prop `aspect` en cada componente individual.

**Prioridad**: `aspect prop` > `ConfigurationProvider` > `defaults`

Ver [docs/guides/aspect-customization.md](./docs/guides/aspect-customization.md) para ejemplos completos.

## 🔮 Roadmap

- [ ] **`<Truck>`**: Componente para visualizar camiones
- [ ] **`<Container>`**: Contenedor marítimo
- [ ] **Algoritmos de optimización**: Sugerencias automáticas de colocación
- [ ] **Exportación**: Generar reportes y visualizaciones
- [ ] **Física**: Simulación de peso y estabilidad
- [ ] **Multiplayer**: Colaboración en tiempo real

## 📚 Documentación

Consulta la carpeta `/docs` para más información:

- [Guía de Componentes 3D](./docs/guides/3d-components-development.md)
- [Modelo de Dominio](./docs/context/domain-model.md)
- [Convenciones de Código](./docs/context/coding-conventions.md)

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./docs/guides/contributing.md)

## � Atribuciones

Este proyecto utiliza assets de terceros:

- **HDR Environment Map**: [HDRI Haven/Poly Haven](https://polyhaven.com/) (CC0 License) via [pmndrs/drei-assets](https://github.com/pmndrs/drei-assets)

Ver [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) para detalles completos.

## �📄 Licencia

MIT © Cristian Cosano

---

**Hecho con ❤️ usando React Three Fiber**
