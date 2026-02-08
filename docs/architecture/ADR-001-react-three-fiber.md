# ADR-001: Uso de React Three Fiber para Renderizado 3D

**Estado**: Aceptada  
**Fecha**: 2026-02-08  
**Decisores**: Equipo de Desarrollo  

## Contexto

Necesitamos una solución para renderizar y manipular gráficos 3D en el navegador para nuestro sistema de construcción de pallets. La solución debe:

- Integrarse bien con React y su ecosistema
- Proporcionar buena performance para escenas 3D interactivas
- Tener una curva de aprendizaje razonable
- Contar con buena documentación y comunidad activa
- Permitir manipulación interactiva de objetos 3D en tiempo real

## Decisión

Hemos decidido utilizar **React Three Fiber (R3F)** como la librería principal para el renderizado 3D, complementada con **@react-three/drei** para componentes y helpers adicionales.

### Justificación

1. **Integración con React**: R3F permite usar Three.js de forma declarativa con JSX, manteniendo el paradigma de React
2. **Ecosistema maduro**: Cuenta con librerías complementarias bien mantenidas (drei, postprocessing, etc.)
3. **Performance**: Aprovecha el reconciliador de React para optimizar renders
4. **Componentes reutilizables**: Facilita la creación de componentes 3D modulares
5. **Comunidad activa**: Gran cantidad de ejemplos, tutoriales y soporte de la comunidad

## Consecuencias

### Positivas

- ✅ Mantiene consistencia con el stack de React
- ✅ Reduce la complejidad al usar JSX para describir escenas 3D
- ✅ Facilita la gestión de estado entre componentes 3D y UI
- ✅ Acceso a todo el poder de Three.js cuando se necesita
- ✅ Hooks personalizados para lógica 3D reutilizable

### Negativas

- ⚠️ Requiere aprender tanto React como conceptos de Three.js
- ⚠️ Abstracción adicional sobre Three.js puro (aunque se puede acceder directamente)
- ⚠️ Dependencia de librerías de terceros (aunque muy estables)

### Riesgos Mitigados

- **Riesgo**: Abstracción limitante
  - **Mitigación**: R3F permite acceso completo a la API de Three.js mediante refs
  
- **Riesgo**: Performance en escenas complejas
  - **Mitigación**: R3F incluye optimizaciones automáticas y permite control manual cuando se necesita

## Alternativas Consideradas

### 1. Three.js Puro

**Pros**:
- Control total sobre el renderizado
- Sin capas de abstracción
- Máximo rendimiento teórico

**Contras**:
- No se integra naturalmente con React
- Más código imperativo y verboso
- Gestión manual del ciclo de vida
- Más difícil de mantener en un proyecto React

**Razón de rechazo**: La falta de integración con React aumentaría significativamente la complejidad del código.

### 2. Babylon.js con React

**Pros**:
- Motor 3D completo y potente
- Buenas herramientas de desarrollo
- Editor visual incluido

**Contras**:
- Ecosistema más pequeño en comparación con Three.js
- Integración con React menos madura
- Curva de aprendizaje más pronunciada
- Menos ejemplos y recursos comunitarios

**Razón de rechazo**: Menor adopción y comunidad más pequeña comparado con Three.js/R3F.

### 3. A-Frame

**Pros**:
- Muy fácil de aprender
- Excelente para VR/AR
- Declarativo desde el inicio

**Contras**:
- Menos flexible para aplicaciones complejas
- Integración con React mediante wrappers adicionales
- Más orientado a experiencias inmersivas que a herramientas de productividad

**Razón de rechazo**: Demasiado opinionado y menos flexible para nuestro caso de uso específico.

## Referencias

- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [Poimandres (Organización mantenedora)](https://github.com/pmndrs)

## Notas

Esta decisión fue tomada en la fase inicial del proyecto. Debería revisarse si:
- Los requisitos de performance cambian significativamente
- Aparecen nuevas tecnologías más apropiadas
- La integración con React se vuelve problemática
