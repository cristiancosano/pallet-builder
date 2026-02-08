# ADR-002: TypeScript como Lenguaje Principal

**Estado**: Aceptada  
**Fecha**: 2026-02-08  
**Decisores**: Equipo de Desarrollo  

## Contexto

Necesitamos elegir entre JavaScript y TypeScript para el desarrollo del proyecto. Consideraciones clave:

- Proyecto de mediano a largo plazo con potencial crecimiento
- Múltiples desarrolladores potencialmente colaborando
- Necesidad de modelar objetos 3D con propiedades específicas
- Integración con librerías que tienen tipos (React, Three.js)
- Prevención de errores en tiempo de desarrollo

## Decisión

Hemos decidido utilizar **TypeScript** como lenguaje principal del proyecto, con configuración en modo estricto (`strict: true`).

### Configuración

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

## Consecuencias

### Positivas

- ✅ **Type Safety**: Detección de errores en tiempo de desarrollo
- ✅ **IntelliSense mejorado**: Mejor experiencia de desarrollo con autocompletado
- ✅ **Refactoring seguro**: Los cambios de API son detectados automáticamente
- ✅ **Documentación implícita**: Los tipos sirven como documentación del código
- ✅ **Mejor mantenibilidad**: Código más fácil de entender y modificar
- ✅ **Integración con librerías**: Three.js, React y R3F tienen excelente soporte de tipos

### Negativas

- ⚠️ **Curva de aprendizaje**: Desarrolladores nuevos en TypeScript necesitan tiempo de adaptación
- ⚠️ **Tiempo de desarrollo inicial**: Escribir tipos puede ser más lento inicialmente
- ⚠️ **Complejidad adicional**: Sistema de tipos puede ser complejo en casos avanzados
- ⚠️ **Configuración**: Requiere configuración y mantenimiento de tsconfig.json

### Neutrales

- Transpilación necesaria (aunque Vite lo maneja automáticamente)
- Archivos ligeramente más grandes (pero no afecta bundle final)

## Alternativas Consideradas

### 1. JavaScript Puro (ES6+)

**Pros**:
- Sin curva de aprendizaje adicional
- Desarrollo más rápido inicialmente
- Sin necesidad de compilación para desarrollo

**Contras**:
- Sin verificación de tipos
- Errores solo detectables en runtime
- IntelliSense limitado
- Refactoring más propenso a errores
- Dificulta el trabajo en equipo

**Razón de rechazo**: Los beneficios de type safety superan la simplicidad inicial, especialmente para un proyecto que crecerá en complejidad.

### 2. TypeScript con Modo Permisivo

**Pros**:
- Permite adopción gradual de TypeScript
- Menos restrictivo, más rápido inicialmente
- Puede usar `any` libremente

**Contras**:
- Pierde muchos beneficios de TypeScript
- Puede crear falsa sensación de seguridad
- Dificulta establecer buenas prácticas

**Razón de rechazo**: Si vamos a usar TypeScript, es mejor aprovecharlo al máximo desde el inicio.

### 3. JSDoc con Type Checking

**Pros**:
- Sigue siendo JavaScript puro
- Algunos beneficios de types
- Compatible con herramientas modernas

**Contras**:
- Sintaxis más verbosa que TypeScript
- Type checking menos robusto
- Menos soporte de herramientas

**Razón de rechazo**: Si vamos a escribir tipos de todas formas, mejor usar TypeScript nativo.

## Estándares de Implementación

### Uso de Any
```typescript
// ❌ Evitar
const data: any = fetchData()

// ✅ Preferir tipos específicos
const data: PalletData = fetchData()

// ✅ Si el tipo es complejo, usar unknown y type guards
const data: unknown = fetchData()
if (isPalletData(data)) {
  // usar data como PalletData
}
```

### Tipos vs Interfaces
```typescript
// Usar type para uniones y aliases
type Status = 'idle' | 'loading' | 'success' | 'error'
type Vector3 = [number, number, number]

// Usar interface para objetos y props de componentes
interface PalletConfig {
  dimensions: Dimensions
  objects: PlacedObject[]
}
```

### Genéricos
```typescript
// Usar genéricos para código reutilizable y type-safe
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value)
}
```

## Métricas de Éxito

- Reducción de errores en runtime relacionados con tipos
- Tiempo de onboarding de nuevos desarrolladores
- Facilidad de refactoring
- Satisfacción del equipo de desarrollo

## Revisión

Esta decisión debería revisarse si:
- El equipo encuentra que el sistema de tipos es más obstáculo que ayuda
- Aparecen tecnologías superiores para type safety
- La configuración estricta limita significativamente el desarrollo

## Referencias

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## Notas para IA

Al generar código TypeScript para este proyecto:
- Siempre proporcionar tipos explícitos
- Evitar uso de `any` (usar `unknown` si es necesario)
- Usar tipos utilitarios de TypeScript cuando sea apropiado (Partial, Pick, Omit, etc.)
- Preferir interfaces para props de componentes
- Incluir JSDoc para funciones complejas además de los tipos
