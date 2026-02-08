# Guías de Desarrollo

Esta carpeta contiene guías y tutoriales para desarrolladores que trabajan en el proyecto Pallet Builder 3D.

## 📋 Índice de Guías

### Getting Started
- [Guía de Configuración del Entorno](./setup-environment.md) - Configuración inicial del proyecto
- [Primera Contribución](./first-contribution.md) - Cómo hacer tu primera contribución
- [Guía de Contribución](./contributing.md) - Lineamientos para contribuir al proyecto

### Desarrollo
- [Desarrollo de Componentes 3D](./3d-components-development.md) - Cómo crear componentes Three.js/R3F
- [Gestión de Estado](./state-management.md) - Patrones de estado en la aplicación
- [Testing](./testing.md) - Cómo escribir y ejecutar tests

### Best Practices
- [Code Review](./code-review.md) - Proceso y checklist de code review
- [Performance](./performance.md) - Optimización y mejores prácticas de rendimiento
- [Debugging 3D](./debugging-3d.md) - Herramientas y técnicas para debugging de escenas 3D

## 🎯 Para Comenzar

Si eres nuevo en el proyecto:

1. Lee la [Guía de Configuración del Entorno](./setup-environment.md)
2. Familiarízate con el [Project Overview](../context/project-overview.md) 3. Revisa las [Convenciones de Código](../context/coding-conventions.md)
4. Explora los [Ejemplos](../examples)
5. Haz tu [Primera Contribución](./first-contribution.md)

## 🛠️ Flujo de Trabajo Típico

```bash
# 1. Crear una rama nueva
git checkout -b feature/nueva-funcionalidad

# 2. Instalar dependencias
pnpm install

# 3. Iniciar servidor de desarrollo
pnpm dev

# 4. Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"

# 5. Push y crear PR
git push origin feature/nueva-funcionalidad
```

## 📞 Soporte

Si tienes preguntas que no están cubiertas en estas guías:
- Abre un issue en GitHub
- Pregunta en las discusiones del proyecto
- Revisa la documentación de las [tecnologías utilizadas](../context/tech-stack.md)

## 🤝 Contribuir a las Guías

Estas guías están en constante evolución. Si encuentras algo confuso o faltante:
- Abre un issue describiendo el problema
- Propón mejoras mediante PRs
- Comparte tus experiencias para mejorar la documentación
