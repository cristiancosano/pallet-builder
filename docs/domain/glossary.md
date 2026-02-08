# Glosario del Dominio

Diccionario de términos utilizados en el proyecto. Este es nuestro **Lenguaje Ubicuo** (Ubiquitous Language).

## 📚 Términos Principales

### A

**AABB (Axis-Aligned Bounding Box)**
- Caja delimitadora alineada con los ejes
- Se usa para detección de colisiones eficiente
- Definida por puntos mínimo y máximo en cada eje

**Apilamiento (Stacking)**
- Acción de colocar un objeto sobre otro
- Debe respetar reglas de peso y estabilidad
- Algunos objetos no son apilables

### B

**Bin Packing**
- Algoritmo de optimización para empaquetar objetos
- Objetivo: maximizar uso del espacio
- Versión 3D aplicada a pallets

**Bounded Context**
- Límite explícito dentro del cual aplica un modelo de dominio
- Ej: Contexto de visualización vs contexto de cálculos

**Bounding Box**
- Ver AABB
- Representación simple de los límites de un objeto

### C

**Capacidad de Carga (Load Capacity)**
- Peso máximo que puede soportar un pallet
- Típicamente entre 500kg y 2000kg
- Varía según material y construcción

**Centro de Gravedad (Center of Gravity / CoG)**
- Punto donde se concentra el peso total
- Crucial para estabilidad
- Debe estar cerca del centro del pallet

**Centro de Masa (Center of Mass)**
- Sinónimo de Centro de Gravedad
- Calculado como promedio ponderado de posiciones

**Colisión (Collision)**
- Superposición física entre dos objetos
- Debe evitarse en configuraciones válidas
- Detectada mediante AABB o algoritmos más precisos

**Configuración (Configuration)**
- Disposición completa de objetos en un pallet
- Incluye posiciones, rotaciones y metadatos
- Puede guardarse y cargarse

**Contenedor (Container)**
- En este contexto, sinónimo de Pallet
- Evitar usar para no confundir con contenedores de transporte

### D

**Densidad (Density)**
- Relación peso/volumen de un objeto
- Afecta cálculos de estabilidad
- `densidad = peso / volumen`

**Dimensiones (Dimensions)**
- Medidas espaciales de un objeto o pallet
- Expresadas como: ancho (width), alto (height), profundidad (depth)
- También: largo, ancho, alto (length, width, height)

**Domain Event**
- Evento significativo que ocurre en el dominio
- Ej: ObjectPlaced, WeightLimitExceeded
- Usado para comunicación entre componentes

### E

**Entidad (Entity)**
- Objeto con identidad única
- Su identidad persiste aunque cambien sus atributos
- Ej: Pallet, PackableObject

**Estabilidad (Stability)**
- Medida de qué tan segura es una configuración
- Afectada por centro de gravedad y distribución de peso
- Score de 0-100

**Euro Pallet / EUR-Pallet / EPAL**
- Pallet estándar europeo
- Dimensiones: 1200mm x 800mm x 144mm
- Capacidad típica: 1000kg

### F

**Fragilidad (Fragility)**
- Nivel de resistencia de un objeto a daños
- Niveles: Very Fragile, Fragile, Normal, Robust, Very Robust
- Afecta reglas de apilamiento

### G

**Geometría (Geometry)**
- Representación 3D de un objeto
- En Three.js: BoxGeometry, etc.
- Define la forma visual

**Grid**
- Rejilla de referencia en escena 3D
- Ayuda a posicionar objetos
- Típicamente alineada con plano XZ

### I

**Invariante (Invariant)**
- Regla que SIEMPRE debe cumplirse
- Ej: peso total ≤ capacidad máxima
- Core del modelo de dominio

### L

**Layout**
- Disposición espacial de objetos
- Puede ser manual o generado automáticamente
- Sinónimo de Configuration en algunos contextos

**Límite Físico (Physical Boundary)**
- Restricción espacial del pallet
- Los objetos no pueden superarlo
- Definido por dimensiones del pallet

### M

**Material**
- Tipo de construcción del pallet
- Tipos: Madera (Wood), Plástico (Plastic), Metal, Composite
- Afecta peso y capacidad del pallet

**Mesh**
- Objeto 3D renderizable en Three.js
- Combina geometría y material
- Representa visualmente un objeto

### O

**Objeto Empaquetable (Packable Object)**
- Cualquier ítem que puede colocarse en el pallet
- Tiene dimensiones, peso, categoría
- Puede tener restricciones de apilamiento

**Objeto Colocado (Placed Object)**
- Packable Object que ya tiene posición en el pallet
- Incluye position, rotation
- Parte de una configuración

**Optimización (Optimization)**
- Proceso de encontrar mejor disposición
- Criterios: maximizar espacio, minimizar espacio vacío
- Usa algoritmos de bin packing

### P

**Pallet**
- Plataforma para transporte y almacenamiento
- Base sobre la que se colocan objetos
- Entidad raíz del dominio

**Peso (Weight)**
- Masa de un objeto en kilogramos (kg)
- Restricción crítica en validación
- Se suma para calcular carga total

**Posición (Position)**
- Coordenadas 3D de un objeto
- Expresadas como [x, y, z] o {x, y, z}
- Relativas al centro del pallet (típicamente)

### R

**R3F (React Three Fiber)**
- React renderer para Three.js
- Permite usar Three.js declarativamente
- Core de nuestra visualización 3D

**Restricción (Constraint)**
- Limitación o regla que debe cumplirse
- Ej: peso máximo, altura máxima
- Validadas antes de aplicar cambios

**Rotación (Rotation)**
- Orientación de un objeto en 3D
- Expresada en grados o radianes
- Ejes: X (pitch), Y (yaw), Z (roll)

### S

**SKU (Stock Keeping Unit)**
- Código único de identificación de producto
- Opcional en PackableObject
- Usado para integración con sistemas externos

**Soporte (Support)**
- Objeto o superficie debajo que sostiene otro objeto
- Necesario para validación física
- Un objeto debe estar en base O tener soporte

**Stacking Rules**
- Reglas de apilamiento de objetos
- Define qué puede apilarse sobre qué
- Incluye peso máximo soportable

**Stability Score**
- Puntuación de estabilidad (0-100)
- 100 = perfectamente estable
- < 50 = inestable, requiere atención

### T

**Three.js**
- Librería JavaScript para gráficos 3D WebGL
- Base de nuestra visualización
- Usada a través de React Three Fiber

**Transformación (Transformation)**
- Cambio de posición, rotación o escala
- Matriz 4x4 en gráficos 3D
- Aplicada a objetos para posicionarlos

### U

**Utilización (Utilization)**
- Porcentaje de espacio usado
- `utilización = volumen_usado / volumen_total * 100`
- Métrica clave de eficiencia

### V

**Validación (Validation)**
- Proceso de verificar reglas de negocio
- Retorna lista de errores/advertencias
- Ejecutada antes de confirmar cambios

**Value Object**
- Objeto sin identidad, definido por sus valores
- Inmutable
- Ej: Dimensions, Position, Weight

**Vector3**
- Vector tridimensional (x, y, z)
- Usado para posiciones, direcciones, escalas
- Clase de Three.js

**Viewport**
- Área visible de la escena 3D
- Donde se renderiza el Canvas
- Usuario interactúa con él

**Volumen (Volume)**
- Espacio ocupado por un objeto
- `volumen = ancho × alto × profundidad`
- Medido en unidades cúbicas

### W

**WebGL (Web Graphics Library)**
- API de JavaScript para renderizar gráficos 3D
- Usado por Three.js internamente
- Acceleration por GPU

**Weight Limit**
- Peso máximo permitido
- Puede ser del pallet o de un objeto (para apilar)
- Invariante crítica

## 🔤 Acrónimos

| Acrónimo | Significado | Contexto |
|----------|-------------|----------|
| AABB | Axis-Aligned Bounding Box | Colisiones |
| ADR | Architecture Decision Record | Documentación |
| API | Application Programming Interface | General |
| CoG | Center of Gravity | Física |
| DDD | Domain-Driven Design | Arquitectura |
| EPAL | European Pallet Association | Estándares |
| EUR | European (pallet) | Estándares |
| HMR | Hot Module Replacement | Desarrollo |
| R3F | React Three Fiber | Framework 3D |
| SKU | Stock Keeping Unit | Inventario |
| UI | User Interface | Interfaz |
| UX | User Experience | Experiencia |
| WCAG | Web Content Accessibility Guidelines | Accesibilidad |

## 📏 Unidades de Medida

### Dimensiones
- **Milímetros (mm)**: Sistema métrico, usado por EUR pallets
- **Metros (m)**: Para cálculos a mayor escala
- **Pulgadas (in)**: Sistema imperial, usado en pallets americanos
- **Pies (ft)**: Altura máxima común (ej: 7 ft)

### Peso
- **Kilogramos (kg)**: Unidad principal del sistema
- **Gramos (g)**: Para objetos pequeños
- **Toneladas (t)**: Para capacidades grandes
- **Libras (lb)**: Sistema imperial (1 lb ≈ 0.453 kg)

### Volumen
- **Metros cúbicos (m³)**: Volumen de pallet
- **Centímetros cúbicos (cm³)**: Objetos pequeños
- **Litros (L)**: Fluidos o capacidad

## 🌍 Estándares de Pallets

### Dimensiones Comunes

| Nombre | Dimensiones (mm) | Región | Capacidad típica |
|--------|------------------|--------|------------------|
| EUR/EPAL | 1200 × 800 | Europa | 1000 kg |
| ISO 1 | 1200 × 1000 | ISO | 1200 kg |
| American | 1219 × 1016 | USA | 1200 kg |
| Asia | 1100 × 1100 | Asia | 1000 kg |
| Australia | 1165 × 1165 | Australia | 1000 kg |

## 💬 Frases del Lenguaje Ubicuo

Ejemplos de cómo hablamos del dominio:

- ❌ "Añadir un ítem al contenedor"
- ✅ "Colocar un objeto empaquetable en el pallet"

- ❌ "Chequear si cabe"
- ✅ "Validar restricciones de carga"

- ❌ "Calcular el centro"
- ✅ "Calcular el centro de gravedad"

- ❌ "Poner una caja encima"
- ✅ "Apilar un objeto sobre otro respetando reglas de stacking"

- ❌ "Está muy pesado"
- ✅ "Excede la capacidad de carga del pallet"

---

Este glosario debe mantenerse sincronizado con el código. Si introduces un nuevo concepto del dominio, documéntalo aquí.
