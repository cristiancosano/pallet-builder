# 📦 @cristiancosano/pallet-builder

Modular system for 3D logistics visualization based on React and React Three Fiber.

## 🎯 Description

React component library that allows building interactive 3D scenes to visualize logistics operations such as warehouses, pallets, boxes, and shipping containers.

## ✨ Features

- 🧱 **Modular System**: Clean architecture with separation between core logic and visualization
- 🎨 **Declarative Components**: Simple API based on React components
- 📐 **Industry Standards**: Support for EURO, ISO, and custom pallets
- 🔄 **Real-time**: Interactive 3D visualization with camera controls
- 📊 **Validations**: Business logic to validate dimensions, weights, and occupancy
- 🎯 **Agnostic**: Core in pure TypeScript without dependencies on visualization frameworks

## 🚀 Quick Start

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view the demo.

## 📖 Basic Usage

```tsx
import { Warehouse, Pallet, Box } from '@cristiancosano/pallet-builder';

function MyLogisticsApp() {
  return (
    <Warehouse width={5000} depth={5000} showGrid>
      
      <Pallet id="pallet-A" position={[0, 0, 0]} type="EURO">
        <Box 
          dimensions={[400, 300, 200]} 
          position={[0, 0, 0]} 
          color="orange" 
          label="Box 1"
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

## 🏗️ Architecture

### Core (Pure TypeScript)

Framework-agnostic business logic:

```typescript
import { BoxEntity, PalletEntity, ContainerEntity } from '@cristiancosano/pallet-builder';

// Create a pallet with validations
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

// Validate configuration
const validation = pallet.validate();
console.log('Total weight:', pallet.getTotalWeight(), 'kg');
console.log('Occupancy:', pallet.getOccupancyRate(), '%');
```

### Components (React + R3F)

3D visual components built with React Three Fiber:

- **`<Warehouse>`**: Main container of the 3D scene
- **`<Pallet>`**: Represents a pallet with support for EURO, ISO, or custom
- **`<Box>`**: Box/package positionable inside a pallet
- **`<CameraControls>`**: Camera controls (orbit, first person, etc.)

## 📐 Pallet Standards

### EUR-Pallet (EURO)
- Dimensions: 800 x 1200 x 144 mm
- Maximum weight: 1500 kg
- Maximum height: 2200 mm

### ISO Pallet (ISO)
- Dimensions: 1000 x 1200 x 144 mm
- Maximum weight: 2000 kg
- Maximum height: 2200 mm

### Custom
- Customizable dimensions
- Flexible configuration

## 🎨 Available Components

### Warehouse

Main container that creates the 3D scene with lighting and controls.

```tsx
<Warehouse 
  width={5000}      // mm
  depth={5000}      // mm
  height={3000}     // mm (optional)
  showGrid={true}   // Show ground grid
  backgroundColor="#f0f0f0"
>
  {/* Content */}
</Warehouse>
```

### Pallet

Represents a standard or custom pallet.

```tsx
<Pallet 
  id="pallet-1"
  type="EURO"             // 'EURO' | 'ISO' | 'CUSTOM'
  position={[0, 0, 0]}    // [x, y, z] in mm
  rotation={[0, 0, 0]}    // [x, y, z] in radians
  color="#8B4513"
  showDimensions={false}
  customDimensions={[1000, 144, 1200]}  // For CUSTOM
>
  {/* Boxes */}
</Pallet>
```

### Box

Box or package inside a pallet.

```tsx
<Box 
  dimensions={[400, 300, 200]}  // [width, height, depth] in mm
  position={[0, 0, 0]}           // [x, y, z] inside the pallet
  color="#ff6b35"
  label="Box 1"
  onClick={() => console.log('Click!')}
  onHover={(hovered) => console.log(hovered)}
/>
```

## 🎨 Customization with AspectConfig

The `AspectConfig` system allows customizing the visual appearance of each component individually.

### Global Configuration

Define default values for all components:

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

### Component-level Customization

Each pallet or box can have its own texture, model, or color:

```tsx
<PalletBuilder 
  palletType="EURO"
  palletAspect={{ textureUrl: '/textures/dark_wood.png' }}
>
  {/* Box with custom color */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 0]}
    aspect={{ color: '#00d9ff' }}
    label="Blue Box"
  />
  
  {/* Box with custom texture */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[400, 0, 0]}
    aspect={{ textureUrl: '/textures/cardboard.png' }}
    label="Cardboard Box"
  />
  
  {/* Box with custom 3D model */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 400]}
    aspect={{ 
      modelUrl: '/objects/custom_box.glb',
      textureUrl: '/textures/metal.png'
    }}
    label="Metal Box"
  />
</PalletBuilder>
```

### Default 3D Models and Textures

The library comes configured with default models and textures:

**Pallets:**
- Model: `/objects/pallet.glb`
- Texture: `/textures/pallet_planks.png`

**Boxes:**
- Model: `/objects/box.glb`
- Texture: `/textures/crate_roughness.png`

You can use your own GLB models and textures by customizing the global configuration or using the `aspect` prop on each individual component.

**Priority**: `aspect prop` > `ConfigurationProvider` > `defaults`

See [docs/guides/aspect-customization.md](./docs/guides/aspect-customization.md) for full examples.

## 🔮 Roadmap

- [ ] **`<Truck>`**: Component for truck visualization
- [ ] **`<Container>`**: Shipping container
- [ ] **Optimization Algorithms**: Automatic placement suggestions
- [ ] **Export**: Generate reports and visualizations
- [ ] **Physics**: Weight and stability simulation
- [ ] **Multiplayer**: Real-time collaboration

## 📚 Documentation

Check the `/docs` folder for more information:

- [3D Components Guide](./docs/guides/3d-components-development.md)
- [Domain Model](./docs/context/domain-model.md)
- [Coding Conventions](./docs/context/coding-conventions.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/guides/contributing.md)

## 📄 Attributions

This project uses third-party assets:

- **HDR Environment Map**: [HDRI Haven/Poly Haven](https://polyhaven.com/) (CC0 License) via [pmndrs/drei-assets](https://github.com/pmndrs/drei-assets)

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for full details.

## 📄 License

MIT © Cristian Cosano

---

**Made with ❤️ using React Three Fiber**
