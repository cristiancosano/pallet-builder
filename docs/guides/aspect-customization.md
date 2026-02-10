# Personalización con AspectConfig

## Descripción

El sistema `AspectConfig` permite personalizar la apariencia visual de cada componente (Pallet, Box) de forma individual, ofreciendo tres niveles de personalización:

1. **Valores por defecto hardcodeados** - Definidos en cada componente
2. **Configuración global** - Definida en `ConfigurationProvider`
3. **Configuración por componente** - Usando el prop `aspect`

## Prioridad de Resolución

```
aspect prop > ConfigurationProvider > defaults
```

Si defines un aspecto en el componente individual, este **sobreescribe** la configuración global.

## Interfaz AspectConfig

```typescript
interface AspectConfig {
  modelUrl?: string;      // URL del modelo 3D (GLB) a usar
  textureUrl?: string;    // URL de la textura a aplicar
  color?: string;         // Color en formato hexadecimal
  useModel?: boolean;     // true: usa modelo GLB, false: usa geometría básica
}
```

## Ejemplos de Uso

### 1. Personalización Global

Define configuración que aplica a **todos** los pallets:

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

### 2. Personalización Individual de Pallets

Cada pallet puede tener su propia textura o modelo:

```tsx
<ConfigurationProvider config={{ usePalletModel: true }}>
  {/* Pallet 1: Textura de madera clara */}
  <PalletBuilder 
    palletType="EURO"
    palletAspect={{ 
      textureUrl: '/textures/light_wood.png' 
    }}
  >
    <Box dimensions={[400, 300, 200]} position={[0, 0, 0]} color="#ff6b35" />
  </PalletBuilder>

  {/* Pallet 2: Textura de madera oscura */}
  <PalletBuilder 
    palletType="ISO"
    palletAspect={{ 
      textureUrl: '/textures/dark_wood.png' 
    }}
  >
    <Box dimensions={[400, 300, 200]} position={[0, 0, 0]} color="#004e89" />
  </PalletBuilder>

  {/* Pallet 3: Usa geometría básica en vez de modelo */}
  <PalletBuilder 
    palletType="CUSTOM"
    palletAspect={{ 
      useModel: false,
      textureUrl: '/textures/metal.png' 
    }}
  >
    <Box dimensions={[400, 300, 200]} position={[0, 0, 0]} color="#f77f00" />
  </PalletBuilder>
</ConfigurationProvider>
```

### 3. Personalización de Cajas

Cada caja puede tener su propio color, textura o modelo 3D:

```tsx
<PalletBuilder palletType="EURO">
  {/* Caja con modelo y textura por defecto */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 0]} 
    label="Caja Normal"
  />
  
  {/* Caja con color personalizado via aspect (sin modelo) */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[400, 0, 0]} 
    color="#004e89"
    aspect={{ 
      useModel: false,
      color: "#00d9ff" 
    }}
    label="Caja Cyan"
  />
  
  {/* Caja con textura personalizada */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[0, 0, 400]} 
    aspect={{ textureUrl: '/textures/cardboard.png' }}
    label="Caja Cartón"
  />
  
  {/* Caja con modelo 3D personalizado */}
  <Box 
    dimensions={[400, 300, 200]} 
    position={[400, 0, 400]} 
    aspect={{ 
      modelUrl: '/objects/custom_box.glb',
      textureUrl: '/textures/metal.png'
    }}
    label="Caja Metal"
  />
</PalletBuilder>
```

### 4. Combinación de Configuraciones

Ejemplo completo mostrando todos los niveles:

```tsx
import { ConfigurationProvider, PalletBuilder, Box } from '@cristiancosano/pallet-builder';
import type { AspectConfig } from '@cristiancosano/pallet-builder';

function App() {
  // Configuración global: todos los pallets usan modelo GLB por defecto
  const globalConfig = {
    usePalletModel: true,
    palletModelUrl: '/objects/pallet.glb',
    palletTextureUrl: '/textures/default_wood.png'
  };

  // Aspect para un pallet específico
  const darkWoodAspect: AspectConfig = {
    textureUrl: '/textures/dark_wood.png'
  };

  // Aspect para cajas especiales
  const fragilBoxAspect: AspectConfig = {
    color: '#ffeb3b',
    textureUrl: '/textures/warning_stripes.png'
  };

  return (
    <ConfigurationProvider config={globalConfig}>
      <PalletBuilder palletType="EURO" palletAspect={darkWoodAspect}>
        {/* Caja normal: usa color por defecto */}
        <Box 
          dimensions={[400, 300, 200]} 
          position={[0, 0, 0]} 
          color="#8bc34a" 
          label="Normal"
        />
        
        {/* Caja frágil: usa aspect personalizado */}
        <Box 
          dimensions={[400, 300, 200]} 
          position={[400, 0, 0]} 
          color="#ffffff"
          aspect={fragilBoxAspect}
          label="FRAGIL"
        />
      </PalletBuilder>
    </ConfigurationProvider>
  );
}
```

## Casos de Uso Comunes

### Diferenciación por Cliente

```tsx
const clientAspects = {
  clienteA: { textureUrl: '/textures/logo_cliente_a.png' },
  clienteB: { textureUrl: '/textures/logo_cliente_b.png' },
  clienteC: { color: '#e91e63' }
};

<PalletBuilder palletType="EURO">
  <Box aspect={clientAspects.clienteA} dimensions={[400, 300, 200]} position={[0, 0, 0]} />
  <Box aspect={clientAspects.clienteB} dimensions={[400, 300, 200]} position={[400, 0, 0]} />
  <Box aspect={clientAspects.clienteC} dimensions={[400, 300, 200]} position={[0, 0, 400]} />
</PalletBuilder>
```

### Categorización por Tipo de Producto

```tsx
const productAspects = {
  alimentos: { color: '#4caf50' }, // Verde
  electronicos: { color: '#2196f3' }, // Azul
  quimicos: { color: '#ff9800', textureUrl: '/textures/hazard.png' } // Naranja con advertencia
};

<PalletBuilder palletType="EURO">
  <Box aspect={productAspects.alimentos} dimensions={[400, 300, 200]} position={[0, 0, 0]} label="Verduras" />
  <Box aspect={productAspects.electronicos} dimensions={[400, 300, 200]} position={[400, 0, 0]} label="Laptops" />
  <Box aspect={productAspects.quimicos} dimensions={[400, 300, 200]} position={[0, 0, 400]} label="Productos Químicos" />
</PalletBuilder>
```

### Estado de Envío

```tsx
const shippingStatus = {
  pendiente: { color: '#9e9e9e' },
  enTransito: { color: '#ff9800' },
  entregado: { color: '#4caf50' },
  devuelto: { color: '#f44336' }
};

<PalletBuilder palletType="EURO">
  <Box aspect={shippingStatus.pendiente} dimensions={[400, 300, 200]} position={[0, 0, 0]} label="Pedido #001" />
  <Box aspect={shippingStatus.enTransito} dimensions={[400, 300, 200]} position={[400, 0, 0]} label="Pedido #002" />
  <Box aspect={shippingStatus.entregado} dimensions={[400, 300, 200]} position={[0, 0, 400]} label="Pedido #003" />
</PalletBuilder>
```

## Notas Técnicas

### Texturas

- Las texturas se cargan mediante `useTexture` de `@react-three/drei`
- Se recomienda usar imágenes optimizadas (JPG/PNG)
- Las texturas se aplican con `RepeatWrapping` para modelos básicos
- Para modelos GLB, las texturas reemplazan el material original

### Modelos GLB

- Los modelos se escalan automáticamente para ajustarse a las dimensiones del pallet
- La textura externa se aplica a **todos los meshes** del modelo vía `traverse()`
- Los materiales originales se clonan antes de aplicar la nueva textura

### Rendimiento

- Las texturas se cachean automáticamente por `useTexture`
- Los modelos GLB se cachean automáticamente por `useGLTF`
- Reutiliza los mismos `AspectConfig` para múltiples componentes cuando sea posible

## API Reference

### PalletBuilder Props

```typescript
interface PalletBuilderProps {
  palletType?: PalletType;
  palletAspect?: AspectConfig; // Personalización del pallet
  showGrid?: boolean;
  children?: React.ReactNode;
}
```

### Box Props

```typescript
interface BoxProps {
  dimensions: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  label?: string;
  aspect?: AspectConfig; // Personalización de la caja
}
```

### Pallet Props

```typescript
interface PalletProps {
  type?: PalletType;
  position?: [number, number, number];
  rotation?: [number, number, number];
  customDimensions?: [number, number, number];
  showHelpers?: boolean;
  aspect?: AspectConfig; // Personalización del pallet
  children?: React.ReactNode;
}
```
