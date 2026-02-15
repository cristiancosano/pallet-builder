# Guías de Desarrollo

Guías y tutoriales para desarrolladores que trabajan en Pallet Builder.

## Índice

| Guía | Descripción |
|------|-------------|
| [contributing.md](./contributing.md) | Proceso de contribución, formato de commits, checklist de PR |
| [3d-components-development.md](./3d-components-development.md) | Fundamentos de desarrollo de componentes React Three Fiber |
| [aspect-customization.md](./aspect-customization.md) | Sistema AspectConfig para personalización visual |
| [pallet-types.md](./pallet-types.md) | Tipos de palets estándar internacionales y cómo usarlos |
| [testing.md](./testing.md) | Estrategia de tests unitarios del core, convenciones y cobertura |
| [packing-strategy-selection.md](./packing-strategy-selection.md) | Guía para elegir la estrategia de empaquetado apropiada |

## Para comenzar

1. Lee el [Project Overview](../context/project-overview.md)
2. Revisa las [Coding Conventions](../context/coding-conventions.md)
3. Consulta la [Arquitectura](../architecture/ARCHITECTURE.md)
4. Revisa el [Plan de Implementación](../implementation-plan.md)

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
