# Guía de Contribución

¡Gracias por tu interés en contribuir a Pallet Builder 3D! Este documento proporciona lineamientos para contribuir al proyecto.

## 🌟 Cómo Contribuir

### Reportar Bugs

1. **Verifica** que el bug no haya sido reportado ya en [Issues](https://github.com/usuario/pallet-builder/issues)
2. **Abre un nuevo issue** con:
   - Título descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots/videos si aplica
   - Información del entorno (navegador, OS, versión)

### Sugerir Mejoras

1. Abre un issue con el tag "enhancement"
2. Describe claramente la mejora propuesta
3. Explica por qué sería útil
4. Si es posible, propón una implementación

### Pull Requests

#### Antes de Empezar

1. Discute cambios grandes en un issue primero
2. Asegúrate de tener el entorno configurado correctamente
3. Lee las [Convenciones de Código](../context/coding-conventions.md)

#### Proceso

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   # o
   git checkout -b fix/bug-description
   ```

3. **Haz tus cambios** siguiendo las convenciones del proyecto

4. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: añade visualización de peso del pallet"
   git commit -m "fix: corrige cálculo de volumen"
   git commit -m "docs: actualiza guía de contribución"
   ```

5. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```

6. **Abre un Pull Request** en GitHub

#### Formato de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, espacios, etc (no afecta el código)
- `refactor`: Refactorización (ni feat ni fix)
- `perf`: Mejoras de performance
- `test`: Añadir o corregir tests
- `chore`: Mantenimiento, configuración, etc

**Ejemplos**:
```bash
feat(pallet): añade validación de dimensiones
fix(3d-scene): corrige posicionamiento de objetos
docs(readme): actualiza instrucciones de instalación
refactor(hooks): simplifica usePalletBuilder
```

## 📋 Checklist del PR

Antes de enviar tu PR, verifica:

- [ ] El código sigue las [convenciones del proyecto](../context/coding-conventions.md)
- [ ] Los commits siguen el formato Conventional Commits- [ ] El código compila sin errores (`pnpm build`)
- [ ] No hay errores de linting (`pnpm lint`)
- [ ] No hay errores de TypeScript
- [ ] Has probado los cambios localmente
- [ ] La documentación está actualizada si es necesario
- [ ] Has añadido comentarios para código complejo

## 🎨 Estándares de Código

### TypeScript
- Usa tipos explícitos
- Evita `any`
- Documenta funciones públicas con JSDoc

### React
- Componentes funcionales con hooks
- Props con TypeScript interfaces
- Usa `memo` para componentes que renderizan frecuentemente

### React Three Fiber
- Mantén la lógica 3D en componentes separados
- Usa hooks de R3F (`useFrame`, `useThree`, etc)
- Documenta las transformaciones y matemáticas complejas

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
pnpm test

# Tests en modo watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📝 Documentación

Si tu cambio afecta:
- **API pública**: Actualiza [docs/api](../api)
- **Arquitectura**: Considera crear un ADR en [docs/architecture](../architecture)
- **Uso**: Añade ejemplos en [docs/examples](../examples)
- **Setup**: Actualiza [docs/setup](../setup)

## 🔍 Code Review

Tu PR será revisado considerando:

1. **Funcionalidad**: ¿Hace lo que se supone?
2. **Calidad**: ¿Sigue las mejores prácticas?
3. **Tests**: ¿Está apropiadamente testeado?
4. **Documentación**: ¿Está bien documentado?
5. **Performance**: ¿Tiene impacto en performance?
6. **Compatibilidad**: ¿Rompe funcionalidad existente?

## 🚀 Después del Merge

Después de que tu PR sea mergeado:
1. Puedes eliminar tu rama
2. Actualiza tu fork con los cambios de main
3. ¡Celebra tu contribución! 🎉

## 💡 Ideas de Contribución

Si buscas algo en qué trabajar:

1. Revisa [issues con label "good first issue"](https://github.com/usuario/pallet-builder/labels/good%20first%20issue)
2. Busca [issues con label "help wanted"](https://github.com/usuario/pallet-builder/labels/help%20wanted)
3. Mejora la documentación
4. Añade tests
5. Optimiza performance
6. Reporta bugs que encuentres

## 🤝 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos.

### Estándares

**Comportamiento positivo**:
- Uso de lenguaje acogedor e inclusivo
- Respeto por diferentes puntos de vista
- Aceptación de crítica constructiva
- Enfoque en lo mejor para la comunidad

**Comportamiento inaceptable**:
- Lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes
- Acoso público o privado
- Publicar información privada de otros

### Aplicación

Instancias de comportamiento abusivo pueden ser reportadas contactando al equipo del proyecto. Todas las quejas serán revisadas e investigadas.

## ❓ Preguntas

¿Tienes preguntas sobre cómo contribuir? 

- Abre un [issue de discusión](https://github.com/usuario/pallet-builder/discussions)
- Contacta a los mantenedores
- Revisa la documentación existente

## 🙏 Reconocimientos

Todos los contribuidores serán reconocidos en el proyecto. ¡Gracias por hacer mejor este proyecto!

---

**Nota**: Esta es una guía viva que evoluciona con el proyecto. Las sugerencias para mejorarla son bienvenidas.
