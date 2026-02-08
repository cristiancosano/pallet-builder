# Documentación de Diseño

Esta carpeta contiene decisiones de diseño, patrones UI/UX, sistema de diseño y especificaciones visuales del proyecto.

## 🎨 Contenido

### [design-system/](./design-system)
Sistema de diseño y componentes visuales:
- Colores y paletas
- Tipografía
- Espaciado y grid
- Componentes UI
- Iconografía

### [patterns/](./patterns)
Patrones de diseño y UX:
- Patrones de interacción
- Flujos de usuario
- Navegación
- Feedback visual

### [decisions/](./decisions)
Decisiones de diseño documentadas:
- Wireframes
- Mockups
- Iteraciones de diseño
- Justificaciones de diseño

### [accessibility/](./accessibility)
Consideraciones de accesibilidad:
- Contraste de colores
- Navegación por teclado
- Screen readers
- WCAG compliance

## 🎯 Principios de Diseño

### 1. Claridad
El diseño debe ser claro e intuitivo. Los usuarios deben entender inmediatamente cómo interactuar con la aplicación.

### 2. Consistencia
Mantener consistencia visual y de interacción en toda la aplicación.

### 3. Feedback Visual
Proporcionar retroalimentación clara para todas las acciones del usuario.

### 4. Accesibilidad
Diseñar para todos los usuarios, incluyendo aquellos con discapacidades.

### 5. Performance
El diseño no debe comprometer el rendimiento de la aplicación 3D.

## 🎨 Sistema de Colores (Propuesto)

### Paleta Principal

```css
/* Colores primarios */
--primary-50: #E3F2FD;
--primary-100: #BBDEFB;
--primary-500: #2196F3;  /* Principal */
--primary-700: #1976D2;
--primary-900: #0D47A1;

/* Colores de pallets y madera */
--wood-light: #D4A574;
--wood-medium: #8B4513;
--wood-dark: #654321;

/* Estados */
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;

/* Neutrales */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-500: #9E9E9E;
--gray-900: #212121;

/* Fondos */
--background-default: #FFFFFF;
--background-paper: #F5F5F5;
--background-3d: #1A1A1A;
```

### Uso de Colores

```typescript
// Objetos 3D por categoría
const objectColors = {
  fragile: '#FF6B6B',      // Rojo suave
  heavy: '#4ECDC4',        // Turquesa
  standard: '#95E1D3',     // Verde menta
  priority: '#FFD93D',     // Amarillo
  hazard: '#F38181',       // Rosa coral
}

// Estados de validación
const validationColors = {
  valid: '#4CAF50',        // Verde
  invalid: '#F44336',      // Rojo
  warning: '#FF9800',      // Naranja
  neutral: '#9E9E9E',      // Gris
}
```

## 📐 Layout y Espaciado

### Grid System

```typescript
// Espaciado base: 8px
const spacing = {
  xs: 4,    // 0.5 unidades
  sm: 8,    // 1 unidad
  md: 16,   // 2 unidades
  lg: 24,   // 3 unidades
  xl: 32,   // 4 unidades
  xxl: 48,  // 6 unidades
}

// Breakpoints
const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
}
```

### Layout Principal

```
┌─────────────────────────────────────┐
│           Top Bar / Header          │
├─────────────┬───────────────────────┤
│             │                       │
│   Control   │                       │
│   Panel     │     3D Viewport       │
│   (Sidebar) │     (Canvas)          │
│             │                       │
│             │                       │
├─────────────┴───────────────────────┤
│         Bottom Bar / Stats          │
└─────────────────────────────────────┘
```

## 🖼️ Componentes UI Principales

### 1. Control Panel

**Propósito**: Panel lateral para controles y configuración del pallet

**Características**:
- Dimensiones del pallet
- Lista de objetos
- Acciones (añadir, eliminar, limpiar)
- Validación en tiempo real

### 2. 3D Viewport

**Propósito**: Área principal de visualización 3D

**Características**:
- Controles de cámara intuitivos
- Grid de referencia
- Indicadores de orientación
- Selección de objetos

### 3. Object Properties Panel

**Propósito**: Propiedades detalladas del objeto seleccionado

**Características**:
- Posición (X, Y, Z)
- Dimensiones (W, H, D)
- Peso
- Categoría/Tipo

### 4. Validation Feedback

**Propósito**: Mostrar errores y advertencias

**Características**:
- Lista de problemas
- Código de colores
- Sugerencias de corrección

## 🖱️ Patrones de Interacción

### Navegación 3D

```typescript
// Controles estándar de cámara
- Clic izquierdo + arrastrar: Rotar cámara
- Rueda del mouse: Zoom in/out
- Clic derecho + arrastrar: Pan (desplazar)
- Doble clic en objeto: Enfocar objeto
```

### Manipulación de Objetos

```typescript
// Interacción con objetos 3D
- Clic en objeto: Seleccionar
- Arrastrar objeto: Mover en plano XZ
- Shift + arrastrar: Mover en eje Y
- Ctrl + clic: Selección múltiple
- Delete/Backspace: Eliminar objeto
```

### Feedback Visual

```typescript
// Estados visuales
- Hover: Outline sutil
- Seleccionado: Outline marcado + gizmo
- Error: Color rojo con pulsación
- Válido: Color verde con check
- Cargando: Spinner + skeleton UI
```

## ♿ Accesibilidad

### Contraste de Colores

- Todos los textos cumplen WCAG AA (4.5:1 para texto normal)
- Elementos interactivos cumplen WCAG AA (3:1)
- Modo de alto contraste disponible

### Navegación por Teclado

```
Tab: Navegar entre elementos
Space/Enter: Activar botón/acción
Arrow keys: Ajustar valores numéricos
Escape: Cancelar/cerrar
```

### Screen Readers

- Todos los elementos interactivos tienen labels
- Cambios de estado se anuncian
- Shortcuts se describen
- Mensajes de error son accesibles

## 📱 Responsive Design

### Mobile (< 768px)
- Panel de control se convierte en drawer
- Controles simplificados
- Viewport 3D ocupa pantalla completa
- Gestos táctiles para navegación

### Tablet (768px - 1024px)
- Panel lateral colapsable
- Viewport 3D ajustado
- Controles touch-friendly

### Desktop (> 1024px)
- Layout completo con sidebar fijo
- Viewport 3D maximizado
- Todos los controles visibles

## 🎭 Animaciones y Transiciones

```css
/* Transiciones suaves */
--transition-fast: 150ms ease-in-out;
--transition-base: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;

/* Easing curves */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Animaciones 3D

- Suaves transiciones de cámara
- Fade in/out de objetos
- Pulsaciones sutiles para feedback
- Animaciones de carga

## 🎯 Próximas Decisiones de Diseño

- [ ] Modo oscuro completo
- [ ] Temas personalizables
- [ ] Iconografía personalizada
- [ ] Animaciones de micro-interacciones
- [ ] Tour guiado para nuevos usuarios

## 📚 Referencias

- [Material Design Guidelines](https://material.io/design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

Este documento evoluciona con el proyecto. Las sugerencias de mejora son bienvenidas.
