# Tech Stack

> **Propósito**: Tecnologías, versiones y convenciones técnicas de Pallet Builder.

## Dependencias Principales

### Core 3D

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `three` | Latest compat. R3F | Motor 3D WebGL |
| `@react-three/fiber` | Latest | React renderer para Three.js — API declarativa |
| `@react-three/drei` | Latest | Helpers R3F: OrbitControls, Environment, Grid, etc. |

### Framework

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | 18.x | UI framework |
| `react-dom` | 18.x | DOM renderer |
| `typescript` | 5.x | Lenguaje — strict mode habilitado |

### Build & Dev

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `vite` | Latest | Build tool — modo library para producción |
| `vitest` | Latest | Test runner compatible con Vite |
| `eslint` | Latest | Linter — flat config |
| `pnpm` | Latest | Package manager |

---

## Vite — Modo Library

Pallet Builder se compila como **librería** con Vite:

```typescript
// vite.config.ts (concepto)
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'PalletBuilder',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
    },
  },
})
```

- **Entry point**: `src/lib.ts`
- **Formats**: ESM + CJS
- **Externals**: React, Three.js y R3F son peer dependencies — no se bundlean.

---

## TypeScript — Configuración

- **Strict mode**: habilitado (`strict: true`)
- **Target**: ES2020+
- **Module**: ESNext
- **Path aliases**: `@/` → `src/`

Convenciones TS:
- `interface` para shapes de objetos y props de componentes.
- `type` para uniones, intersecciones y tipos utilitarios.
- Evitar `any` — usar `unknown` y narrowing.
- Tipos explícitos en firmas de funciones públicas.

---

## React Three Fiber — Convenciones

```tsx
// Canvas como raíz de toda escena 3D
import { Canvas } from '@react-three/fiber'

<Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
  <ambientLight intensity={0.5} />
  <directionalLight position={[10, 10, 5]} />
  {children}
</Canvas>
```

- Los componentes R3F solo se usan **dentro** de `<Canvas>`.
- Usar `useFrame` con moderación — no hacer cálculos pesados en cada frame.
- Geometrías y materiales se memoizan con `useMemo`.
- Para muchas instancias del mismo mesh: `<InstancedMesh>`.

### Drei — Componentes útiles

| Componente | Uso en Pallet Builder |
|-----------|----------------------|
| `OrbitControls` | Controles de cámara (orbit + pan + zoom) |
| `Environment` | HDRI para iluminación realista (`warehouse.hdr`) |
| `Grid` | Rejilla de referencia en decorados |
| `Html` | Overlays HTML dentro de la escena 3D (labels) |
| `Center` | Centrar geometrías automáticamente |

---

## Gestión de Estado

La librería **NO incluye state management**. Todos los componentes son controlados (props in, callbacks out). El consumidor elige su propia solución:

- Zustand, Jotai, Redux, React Context — cualquiera funciona.
- La demo (`App.tsx`) puede usar un store local para mostrar funcionalidad.

---

## Testing

| Herramienta | Capa |
|-------------|------|
| `vitest` | Core (unit tests — funciones puras) |
| `@testing-library/react` | Hooks (integration) |
| `@react-three/test-renderer` | Componentes 3D (smoke tests) |

Estrategia: el core tiene > 90% cobertura. Los componentes 3D se testean como smoke tests (montan sin errores).

---

## Rendimiento — Guía rápida

1. **`React.memo`** en primitivas 3D para evitar re-renders.
2. **`useMemo`** para geometrías, materiales y datos calculados.
3. **`InstancedMesh`** cuando hay > 50 cajas iguales.
4. **Frustum culling** automático de Three.js.
5. **Lazy loading** con `<Suspense>` para modelos GLTF.
6. **Validaciones bajo demanda** — solo cuando cambian los datos, no en cada frame.

---

## Compatibilidad

### Navegadores objetivo
- Chrome / Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)

### Requisitos
- WebGL 2.0 (obligatorio para Three.js moderno)
- ES2020+ en el runtime del consumidor

---

## Referencias

- [R3F Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Docs](https://github.com/pmndrs/drei)
- [Three.js Docs](https://threejs.org/docs/)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [Vitest](https://vitest.dev/)
