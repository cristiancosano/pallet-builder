# ADR-003: Vite como Build Tool

**Estado**: Aceptada  
**Fecha**: 2026-02-08  
**Decisores**: Equipo de Desarrollo  

## Contexto

Necesitamos un sistema de build y servidor de desarrollo para nuestro proyecto React + TypeScript + Three.js. Los requisitos incluyen:

- Hot Module Replacement (HMR) rápido para desarrollo ágil
- Soporte nativo para TypeScript
- Optimización de bundles para producción
- Buena experiencia de desarrollo
- Tiempos de build rápidos
- Soporte para imports de módulos ESM

## Decisión

Hemos decidido utilizar **Vite** como nuestra herramienta de build y servidor de desarrollo.

### Configuración Base

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
})
```

## Consecuencias

### Positivas

- ✅ **Velocidad de desarrollo**: HMR instantáneo, servidor de desarrollo extremadamente rápido
- ✅ **Sin configuración compleja**: Funciona out-of-the-box con React y TypeScript
- ✅ **Build optimizado**: Usa Rollup para producción con optimizaciones automáticas
- ✅ **ESM nativo**: Aprovecha módulos ES nativos del navegador en desarrollo
- ✅ **Plugins**: Ecosistema rico de plugins para extender funcionalidad
- ✅ **Tree shaking**: Eliminación automática de código no utilizado
- ✅ **Code splitting**: Separación inteligente de bundles

### Negativas

- ⚠️ **Ecosistema más joven**: Menos maduro que webpack (aunque muy estable ya)
- ⚠️ **Algunas librerías legacy**: Ocasionalmente puede haber problemas con librerías muy antiguas (raramente un problema con librerías modernas)
- ⚠️ **Less plugins disponibles**: Comparado con webpack, aunque los esenciales están cubiertos

### Riesgos Mitigados

- **Riesgo**: Incompatibilidad con librerías
  - **Mitigación**: Vite tiene excelente soporte para CommonJS y puede configurarse para librerías problemáticas
  
- **Riesgo**: Adopción limitada
  - **Mitigación**: Vite es ahora ampliamente adoptado y recomendado oficialmente por frameworks modernos

## Alternativas Consideradas

### 1. Create React App (CRA)

**Pros**:
- Configuración cero
- Muy establecido y probado
- Gran comunidad

**Contras**:
- Basado en webpack, más lento
- HMR más lento
- Configuración difícil de personalizar sin eject
- Mantenimiento limitado (casi deprecated)
- Builds más lentos

**Razón de rechazo**: Vite ofrece una experiencia de desarrollo significativamente mejor y CRA está siendo dejado de lado por la comunidad.

### 2. Webpack Manual

**Pros**:
- Máxima flexibilidad
- Ecosistema más maduro
- Más plugins disponibles
- Documentación extensa

**Contras**:
- Configuración compleja y verbosa
- Curva de aprendizaje pronunciada
- Builds y HMR más lentos que Vite
- Requiere mucho tiempo de setup y mantenimiento

**Razón de rechazo**: La complejidad de configuración y los tiempos más lentos no justifican la flexibilidad adicional que no necesitamos.

### 3. Parcel

**Pros**:
- Configuración cero
- Rápido
- Fácil de usar

**Contras**:
- Menos flexible que Vite
- Ecosistema de plugins más pequeño
- Menos adopción en la comunidad
- Algunas limitaciones con proyectos complejos

**Razón de rechazo**: Vite ofrece mejor balance entre simplicidad y flexibilidad, con mayor adopción.

### 4. esbuild Directo

**Pros**:
- Extremadamente rápido
- Simple

**Contras**:
- Sin HMR out-of-the-box
- Requiere más configuración manual
- Ecosistema limitado
- Menos características que un bundler completo

**Razón de rechazo**: Vite ya usa esbuild internamente pero añade las características de DX que necesitamos.

## Características Clave Utilizadas

### 1. Hot Module Replacement (HMR)
```typescript
// Vite maneja automáticamente HMR para React
// No necesita configuración adicional
```

### 2. Import de Assets
```typescript
// Imports directos de assets estáticos
import logo from './logo.svg'
import worker from './worker?worker'
```

### 3. Variables de Entorno
```typescript
// Acceso a variables de entorno
const apiUrl = import.meta.env.VITE_API_URL
```

### 4. Build Optimizado
```bash
# Preview del build de producción localmente
pnpm build
pnpm preview
```

## Métricas de Rendimiento

### Objetivos (para verificar periódicamente):
- **Tiempo de inicio del dev server**: < 1 segundo
- **HMR**: < 100ms para cambios en componentes
- **Build producción**: < 30 segundos para el proyecto completo
- **Tamaño de bundle**: < 500KB (inicial, sin code splitting)

## Plugins Esenciales

### Actuales
- `@vitejs/plugin-react` - Soporte para React con Fast Refresh

### Considerados para el Futuro
- `vite-plugin-pwa` - Progressive Web App
- `rollup-plugin-visualizer` - Análisis de bundle size
- `vite-plugin-checker` - Type checking en desarrollo

## Configuraciones Avanzadas (Futuro)

```typescript
// Ejemplos de configuraciones que podríamos necesitar

// Alias de paths
resolve: {
  alias: {
    '@': '/src',
    '@components': '/src/components',
    '@hooks': '/src/hooks',
  }
}

// Optimización de dependencias
optimizeDeps: {
  include: ['three', '@react-three/fiber', '@react-three/drei']
}

// Code splitting manual
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'three-vendor': ['three'],
        'r3f-vendor': ['@react-three/fiber', '@react-three/drei'],
      }
    }
  }
}
```

## Revisión

Esta decisión debería revisarse si:
- Los tiempos de build se vuelven problemáticos
- Necesitamos características específicas de webpack que Vite no ofrece
- Aparecen herramientas significativamente superiores

## Referencias

- [Vite Documentation](https://vitejs.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Why Vite](https://vitejs.dev/guide/why.html)
- [Vite Plugins](https://vitejs.dev/plugins/)

## Notas

- Vite 5+ requiere Node.js 18+
- Para casos edge con librerías legacy, consultar [Dep Optimization Options](https://vitejs.dev/config/dep-optimization-options.html)
- El plugin de React incluye Fast Refresh automáticamente
