# Requisitos del Sistema

> **Naturaleza del proyecto**: Pallet Builder es una **librería de componentes React/R3F**, no una aplicación final. Exporta primitivas 3D, escenas precompuestas y utilidades que otros desarrolladores consumen para construir sus propias aplicaciones logísticas. El fichero `App.tsx` sirve únicamente como demo de referencia.

---

## Requisitos Funcionales

### Área 1 · Escenas y Espacios

#### RF-001: Escena Almacén (`<WarehouseScene />`)
- **Prioridad**: Alta
- **Descripción**: La librería debe exponer una escena 3D que represente un almacén compuesto por una o más estancias.
- **Criterios de Aceptación**:
  - Cada estancia tiene un identificador único y un nombre visible.
  - Las estancias admiten formas irregulares (rectangulares, L, U…) definidas mediante polígonos 2D extruidos a una altura de techo configurable.
  - Distintas estancias pueden tener distintas alturas de techo.
  - La escena renderiza decorado de almacén (suelo industrial, paredes, iluminación cenital).
  - Permite cambiar la estancia activa (vista) programáticamente o mediante navegación del usuario.

#### RF-002: Escena Camión (`<TruckScene />`)
- **Prioridad**: Alta
- **Descripción**: La librería debe exponer una escena 3D que represente el interior de un camión, con decorado propio (paredes metálicas, suelo, rampa trasera).
- **Criterios de Aceptación**:
  - Se ofrecen configuraciones predefinidas de camión: caja cerrada estándar, frigorífico, plataforma, tautliner.
  - Cada tipo tiene dimensiones internas, peso máximo admitido y restricciones propias.
  - El desarrollador puede crear tipos custom proporcionando dimensiones, peso máximo y modelo 3D opcional.
  - La carga (palets) se visualiza dentro del espacio útil del camión.
  - Se valida que ningún palet ni caja exceda los límites del camión ni su peso máximo.

#### RF-003: Escena Palet (`<PalletScene />`)
- **Prioridad**: Alta
- **Descripción**: Vista individualizada de un palet con sus cajas. Es la escena principal del constructor de palets.
- **Criterios de Aceptación**:
  - Se renderiza un palet con sus dimensiones configurables y las cajas colocadas sobre él.
  - Permite interacción directa con las cajas (seleccionar, mover, rotar, eliminar).
  - Muestra indicadores visuales de restricciones violadas (solapamiento, exceso de peso, etc.).
  - Permite alternar entre vista 3D libre y vistas ortogonales (planta, alzado, perfil).

---

### Área 2 · Gestión de Estancias del Almacén

#### RF-004: Definición de Estancias
- **Prioridad**: Alta
- **Descripción**: El desarrollador debe poder definir múltiples estancias dentro de un almacén.
- **Criterios de Aceptación**:
  - Cada estancia se define por un polígono 2D (array de puntos) y una altura de techo.
  - Se admiten formas convexas y cóncavas (L, U, T...).
  - Las dimensiones se especifican en milímetros.
  - Se valida que el polígono sea cerrado y tenga al menos 3 vértices.

#### RF-005: Navegación entre Estancias
- **Prioridad**: Alta
- **Descripción**: El usuario debe poder navegar entre estancias del almacén.
- **Criterios de Aceptación**:
  - La escena permite cambiar la estancia activa mostrando solo el contenido de esa estancia.
  - El cambio de estancia se puede disparar vía prop, callback o control UI delegado al desarrollador.
  - Se mantiene el estado de cámara independiente por estancia (posición, zoom).

#### RF-006: Posicionamiento de Palets en Estancias
- **Prioridad**: Alta
- **Descripción**: Los palets deben poder posicionarse en el suelo de una estancia y moverse entre estancias.
- **Criterios de Aceptación**:
  - Un palet se posiciona en una estancia mediante coordenadas XZ (planta) sobre el suelo.
  - Se detectan colisiones entre palets; no se permite superposición en el mismo plano.
  - Un palet puede reasignarse de una estancia a otra programáticamente.
  - Los palets respetan los límites físicos de la estancia (no pueden salirse del polígono).

---

### Área 3 · Gestión de Palets

#### RF-007: Creación y Configuración de Palets
- **Prioridad**: Alta
- **Descripción**: La librería permite crear palets con dimensiones y propiedades configurables.
- **Criterios de Aceptación**:
  - Dimensiones configurables: ancho, alto (grosor del palet) y profundidad, en milímetros.
  - Material configurable: madera, plástico, metal, composite.
  - Peso máximo admitido (capacidad de carga).
  - Altura máxima de apilamiento de cajas.
  - Identificador único y metadatos extensibles.

#### RF-008: Apilamiento de Palets (Palet Parcial)
- **Prioridad**: Alta
- **Descripción**: El sistema permite apilar un palet encima de otro usando un separador intermedio, formando un palet parcial/compuesto.
- **Criterios de Aceptación**:
  - Se puede insertar un separador (entidad con grosor y dimensiones configurables) sobre un palet cargado.
  - Encima del separador se puede colocar un nuevo palet del mismo formato.
  - El apilamiento puede repetirse indefinidamente; el límite lo impone la altura del contenedor (estancia o camión).
  - Cada piso (palet + separador) se trata como unidad independiente con su propio contenido.
  - La validación física aplica al conjunto apilado completo (colisiones, altura total, peso acumulado).

#### RF-009: Separadores
- **Prioridad**: Media
- **Descripción**: Entidad que se coloca entre pisos de palet para permitir apilamiento.
- **Criterios de Aceptación**:
  - Dimensiones configurables (ancho, profundidad, grosor).
  - Material configurable (cartón, madera, plástico).
  - Se renderiza visualmente entre los pisos de palet.
  - Aporta su propio peso al cálculo total de carga.

---

### Área 4 · Gestión de Cajas

#### RF-010: Creación y Configuración de Cajas
- **Prioridad**: Alta
- **Descripción**: La librería permite crear cajas con dimensiones y metadatos ricos.
- **Criterios de Aceptación**:
  - Dimensiones configurables: ancho, alto, profundidad (en milímetros).
  - **Campos fijos**: peso, fragilidad (booleano + nivel), apilable (booleano), tipo/SKU.
  - **Metadatos extensibles**: mapa clave-valor libre (`Record<string, unknown>`) para que el desarrollador añada producto, lote, fecha de caducidad, categoría, etc.
  - Identificador único.
  - Aspecto visual configurable: color, textura, modelo 3D custom.

#### RF-011: Colocación de Cajas en Palet
- **Prioridad**: Alta
- **Descripción**: Las cajas se colocan dentro del espacio de un palet respetando restricciones físicas.
- **Criterios de Aceptación**:
  - Posición mediante coordenadas XYZ relativas al palet.
  - Rotación discreta (0°, 90°, 180°, 270° en cada eje).
  - Validación de colisiones con otras cajas (AABB).
  - Validación de límites del palet (la caja no sobrepasa el borde).
  - Validación de peso acumulado.
  - Validación de fragilidad: una caja frágil no debe soportar peso excesivo encima.

---

### Área 5 · Algoritmos de Empaquetado (Adapter Pattern)

#### RF-012: Interfaz de Estrategia de Empaquetado
- **Prioridad**: Alta
- **Descripción**: La librería define una interfaz `PackingStrategy` (adapter) que permite intercambiar algoritmos de colocación de cajas en un palet.
- **Criterios de Aceptación**:
  - Interfaz con método `pack(boxes: Box[], pallet: Pallet): PlacementResult[]`.
  - El desarrollador puede implementar y registrar estrategias custom.
  - La estrategia activa se puede cambiar en runtime.
  - El resultado incluye la posición y rotación calculada de cada caja + métricas (utilización de volumen, estabilidad).

#### RF-013: Algoritmo por Columnas
- **Prioridad**: Alta
- **Descripción**: Estrategia incluida de serie que organiza las cajas en columnas verticales por tipo.
- **Criterios de Aceptación**:
  - Se calcula cuántas columnas caben en la base del palet (según las dimensiones de la caja más común).
  - Cada columna se rellena con cajas del mismo tipo (SKU/tipo).
  - Si un tipo no llena una columna completa, se marca como columna parcial.
  - Las columnas se distribuyen optimizando el espacio en planta del palet.

#### RF-014: Algoritmo por Tipo de Caja
- **Prioridad**: Media
- **Descripción**: Estrategia que agrupa cajas del mismo tipo juntas, rellenando capa a capa.
- **Criterios de Aceptación**:
  - Las cajas se ordenan por tipo.
  - Se rellena cada capa horizontal completa antes de pasar a la siguiente.
  - Dentro de cada capa, se agrupan cajas del mismo tipo en zonas contiguas.
  - Respeta restricciones de fragilidad (cajas frágiles arriba).

#### RF-015: Algoritmo 3D Bin Packing
- **Prioridad**: Media
- **Descripción**: Estrategia que optimiza la utilización volumétrica del palet.
- **Criterios de Aceptación**:
  - Aplica un algoritmo de bin packing 3D (ej: First Fit Decreasing Height, Guillotine, Shelf…).
  - Maximiza la ocupación de volumen.
  - Respeta restricciones de peso, fragilidad y apilabilidad.
  - Devuelve métricas: porcentaje de utilización, centro de gravedad, score de estabilidad.

#### RF-016: Registro de Estrategias Custom
- **Prioridad**: Media
- **Descripción**: El desarrollador puede registrar sus propias estrategias de empaquetado.
- **Criterios de Aceptación**:
  - API para registrar una implementación de `PackingStrategy` con un identificador.
  - API para listar estrategias disponibles.
  - API para seleccionar la estrategia activa por identificador.

---

### Área 6 · Reglas Físicas y Validación

#### RF-017: Detección de Colisiones (AABB)
- **Prioridad**: Alta
- **Descripción**: Ningún objeto sólido puede ocupar el mismo espacio que otro.
- **Criterios de Aceptación**:
  - Se detectan colisiones entre cajas dentro de un palet.
  - Se detectan colisiones entre palets dentro de una estancia o camión.
  - El sistema reporta las colisiones con identificadores de los objetos involucrados.
  - Las colisiones se señalizan visualmente (borde rojo, transparencia, etc.).

#### RF-018: Validación de Límites de Contenedor
- **Prioridad**: Alta
- **Descripción**: Ningún objeto puede exceder los límites físicos de su contenedor.
- **Criterios de Aceptación**:
  - Una caja no puede sobresalir del palet.
  - Un palet no puede sobresalir de la estancia (polígono) ni del camión.
  - Un palet apilado no puede superar la altura del techo de la estancia o del camión.
  - Se señaliza visualmente cuándo un objeto viola los límites.

#### RF-019: Gravedad Simulada
- **Prioridad**: Alta
- **Descripción**: Los objetos deben comportarse de acuerdo a gravedad básica.
- **Criterios de Aceptación**:
  - Una caja sin soporte debajo (ni suelo de palet ni otra caja) cae hasta encontrar soporte.
  - Un palet se posa en el suelo de la estancia o sobre un separador.
  - La gravedad se aplica al colocar, mover o eliminar un objeto.
  - Los objetos no flotan.

#### RF-020: Cálculo de Estabilidad
- **Prioridad**: Alta
- **Descripción**: El sistema calcula la estabilidad de la configuración de carga.
- **Criterios de Aceptación**:
  - Se calcula el centro de gravedad del palet cargado (posición XYZ).
  - Se calcula un score de estabilidad (0-100) basado en la distribución de peso.
  - Se detecta riesgo de volcado (centro de gravedad fuera del polígono de soporte).
  - Se exponen estos datos al desarrollador para que los presente como considere.

#### RF-021: Restricciones de Peso
- **Prioridad**: Alta
- **Descripción**: Se valida el peso en todos los niveles de jerarquía.
- **Criterios de Aceptación**:
  - Peso total de cajas en un palet ≤ peso máximo del palet.
  - Peso total de palets en un camión ≤ peso máximo del camión.
  - Peso sobre una caja frágil ≤ umbral de fragilidad de esa caja.
  - Los separadores aportan peso al cálculo total.

---

### Área 7 · Metadatos y Exposición de Datos

#### RF-022: Metadatos Estructurados
- **Prioridad**: Alta
- **Descripción**: Cada entidad (caja, palet, estancia, camión) soporta metadatos mixtos.
- **Criterios de Aceptación**:
  - **Campos fijos por caja**: `weight`, `fragile`, `stackable`, `sku`, `type`.
  - **Campos fijos por palet**: `material`, `maxWeight`, `maxHeight`.
  - **Campos fijos por camión**: `truckType`, `maxWeight`, `licensePlate`.
  - **Metadatos extensibles** en todas las entidades: `metadata: Record<string, unknown>`.
  - El desarrollador puede inyectar los metadatos que necesite (producto, lote, caducidad, categoría, proveedor…).

#### RF-023: Exposición de Datos para Consulta
- **Prioridad**: Alta
- **Descripción**: La librería expone los datos completos del estado actual para que el desarrollador implemente búsqueda, filtrado y consultas de stock.
- **Criterios de Aceptación**:
  - API (hooks o getters) para obtener el listado completo de cajas con sus metadatos y posiciones.
  - API para obtener palets con su contenido.
  - API para obtener estancias con sus palets.
  - API para obtener el estado de carga de un camión.
  - Los datos incluyen la jerarquía completa: camión/estancia → palet → separador → palet → cajas.
  - La librería NO implementa búsqueda/filtrado; solo expone datos estructurados para que el desarrollador construya la capa de consulta.

---

### Área 8 · Visualización 3D

#### RF-024: Renderizado 3D Interactivo
- **Prioridad**: Alta
- **Descripción**: Todas las escenas se renderizan en 3D con interacción en tiempo real.
- **Criterios de Aceptación**:
  - Controles de cámara: órbita, zoom, pan.
  - Iluminación realista (HDR environment map).
  - Sombras (opcional según rendimiento).
  - Anti-aliasing.

#### RF-025: Configuración de Aspecto Visual
- **Prioridad**: Media
- **Descripción**: Los elementos 3D permiten personalización visual.
- **Criterios de Aceptación**:
  - Cajas: color, textura, modelo 3D custom.
  - Palets: color, material visual.
  - Escena almacén: textura de suelo y paredes configurable.
  - Escena camión: aspecto del camión configurable por tipo.

#### RF-026: Interacción con Elementos 3D
- **Prioridad**: Media
- **Descripción**: Los elementos 3D responden a eventos del usuario.
- **Criterios de Aceptación**:
  - Click para seleccionar un elemento (caja, palet).
  - Hover para resaltar (highlight).
  - Callbacks configurables: `onClick`, `onHover`, `onSelect`, `onDeselect`.
  - El desarrollador puede inyectar el comportamiento que necesite ante cada evento.

#### RF-027: Etiquetado Visual
- **Prioridad**: Baja
- **Descripción**: Los elementos pueden mostrar etiquetas flotantes con información.
- **Criterios de Aceptación**:
  - Texto configurable (nombre, SKU, peso…).
  - Posicionamiento automático sobre el elemento.
  - Visibilidad togglable.
  - Estilo (tamaño, color, fondo) configurable.

---

### Área 9 · Exportación de la Librería

#### RF-028: Componentes Granulares
- **Prioridad**: Alta
- **Descripción**: La librería exporta componentes React primitivos reutilizables.
- **Criterios de Aceptación**:
  - `<Box />` — caja individual con props de dimensiones, posición, aspecto y metadatos.
  - `<Pallet />` — palet individual con props.
  - `<Separator />` — separador entre pisos de palet.
  - `<StackedPallet />` — composición de palets apilados con separadores.
  - `<CameraControls />` — controles de cámara configurables.
  - `<Warehouse />` — decorado de almacén (suelo, paredes, luces) para una estancia.
  - `<Truck />` — decorado de camión según tipo.
  - Todos los componentes están tipados con TypeScript estricto.

#### RF-029: Escenas Precompuestas
- **Prioridad**: Alta
- **Descripción**: La librería exporta escenas completas que componen los primitivos en contextos habituales.
- **Criterios de Aceptación**:
  - `<WarehouseScene />` — almacén con soporte multi-estancia, navegación y posicionamiento de palets.
  - `<TruckScene />` — camión con configuración de tipo y carga de palets.
  - `<PalletScene />` — vista individual de palet con constructor y algoritmos de empaquetado.
  - Cada escena acepta children para que el desarrollador añada elementos propios.
  - Las escenas incluyen Canvas R3F, iluminación y controles de cámara por defecto.

#### RF-030: Utilidades y Hooks
- **Prioridad**: Alta
- **Descripción**: La librería exporta funciones de utilidad y hooks React.
- **Criterios de Aceptación**:
  - `usePhysicsValidation()` — hook que reporta colisiones, violaciones de límites y estabilidad.
  - `usePalletMetrics()` — hook que calcula utilización volumétrica, peso total, centro de gravedad.
  - `usePackingStrategy()` — hook para seleccionar y ejecutar algoritmos de empaquetado.
  - Funciones puras de validación exportadas para uso fuera de React (server-side, tests).
  - Tipos TypeScript exportados para todas las entidades y configuraciones.

#### RF-031: Independencia de Estado
- **Prioridad**: Alta
- **Descripción**: La librería NO incluye store global; el estado lo gestiona el desarrollador consumidor.
- **Criterios de Aceptación**:
  - Todos los componentes son controlados (reciben datos vía props).
  - No hay Redux, Zustand ni ningún state manager empaquetado.
  - Los callbacks devuelven los datos suficientes para que el desarrollador actualice su propio store.
  - Se proporcionan demos en `App.tsx` que muestran cómo integrar con distintos state managers.

---

### Área 10 · Demos

#### RF-032: Demo de Almacén
- **Prioridad**: Media
- **Descripción**: `App.tsx` incluye una demo funcional de la escena almacén.
- **Criterios de Aceptación**:
  - Almacén con al menos dos estancias de formas distintas.
  - Varios palets distribuidos.
  - Navegación entre estancias.
  - Movimiento de un palet de una estancia a otra.

#### RF-033: Demo de Camión
- **Prioridad**: Media
- **Descripción**: Demo funcional de la escena camión.
- **Criterios de Aceptación**:
  - Camión de tipo caja cerrada con palets cargados.
  - Visualización de peso y ocupación.
  - Detección visible de violación de límites si se añade carga excedente.

#### RF-034: Demo de Constructor de Palet
- **Prioridad**: Media
- **Descripción**: Demo funcional de la escena palet.
- **Criterios de Aceptación**:
  - Palet con cajas de distintos tipos.
  - Selector de algoritmo de empaquetado (columnas, tipo, bin packing).
  - Palet parcial: demostrar apilamiento con separador.
  - Métricas visibles (utilización, estabilidad, peso).

---

## Requisitos No Funcionales

### RNF-001: Rendimiento
- **Descripción**: La librería debe mantener un rendimiento fluido en la visualización 3D.
- **Métricas**:
  - Mínimo 30 FPS con hasta 200 cajas renderizadas en una escena.
  - Tiempo de montaje de escena < 2 segundos.
  - Respuesta a interacciones (click, hover) < 100 ms.
  - Cálculo de empaquetado < 500 ms para 100 cajas.

### RNF-002: Usabilidad
- **Descripción**: Las escenas deben ser intuitivas para operarios y gerentes.
- **Criterios**:
  - Controles de cámara estándar (órbita, zoom, pan).
  - Feedback visual inmediato en interacciones.
  - Indicadores claros de restricciones violadas.

### RNF-003: Compatibilidad
- **Descripción**: La librería debe funcionar en navegadores modernos.
- **Requisitos**:
  - Chrome/Edge (últimas 2 versiones)
  - Firefox (últimas 2 versiones)
  - Safari (últimas 2 versiones)
  - Soporte WebGL 2.0

### RNF-004: Escalabilidad
- **Descripción**: La librería debe soportar escenas de distintas complejidades.
- **Criterios**:
  - Hasta 1000 cajas por escena.
  - Hasta 50 palets por estancia.
  - Hasta 10 estancias por almacén.
  - Optimización de renderizado (frustum culling, instancing, LOD).

### RNF-005: Mantenibilidad
- **Descripción**: El código debe ser fácil de mantener y extender.
- **Criterios**:
  - Arquitectura modular basada en componentes.
  - TypeScript con tipado estricto.
  - Documentación inline y externa.
  - Cobertura de testing (objetivo: > 70%).
  - Patrón Adapter para algoritmos de empaquetado.

### RNF-006: Accesibilidad
- **Descripción**: Los controles accesibles que pueda proveer la librería deben implementarse.
- **Criterios**:
  - Controles mediante teclado para navegación de cámara.
  - Contraste de colores adecuado en etiquetas e indicadores.
  - Etiquetas ARIA en elementos interactivos HTML.
  - Soporte básico para lectores de pantalla en elementos no-canvas.

### RNF-007: Portabilidad
- **Descripción**: La librería debe ser consumible fácilmente por cualquier proyecto React.
- **Criterios**:
  - Publicable en npm.
  - Build reproducible con pnpm.
  - Peer dependencies claras (React, Three.js, R3F).
  - Tree-shakeable (ESM).
  - Documentación de integración completa.

### RNF-008: Calidad Visual
- **Descripción**: La visualización 3D debe tener calidad profesional.
- **Criterios**:
  - Sombras suaves (opcional según rendimiento).
  - Anti-aliasing.
  - Texturas y materiales PBR.
  - Iluminación HDR realista.
  - Decorados creíbles para almacén y camión.

---

## Restricciones

### REST-001: Tecnología
- React 18+ con React Three Fiber.
- TypeScript 5+.
- Vite como build tool.
- Three.js como motor 3D.

### REST-002: Navegador
- Requiere soporte WebGL 2.0.
- JavaScript habilitado.
- Canvas API disponible.

### REST-003: Hardware
- GPU compatible con WebGL 2.0.
- Mínimo 4 GB RAM recomendado.
- Procesador moderno (últimos 5 años).

### REST-004: Naturaleza de Librería
- No incluye store/state management propio.
- No implementa búsqueda/filtrado de datos.
- No define flujos de trabajo de usuario; eso lo hace el consumidor.
- Los componentes son controlados (datos vía props, cambios vía callbacks).

---

## Dependencias

### DEP-001: Bibliotecas Externas
- React Three Fiber para renderizado 3D.
- Three.js para gráficos 3D.
- @react-three/drei para utilidades 3D.

### DEP-002: Assets
- Texturas en formato PNG/JPG.
- Modelos 3D en formato GLTF/GLB.
- Archivos HDR para iluminación.

---

## Notas

- Los requisitos pueden evolucionar durante el desarrollo.
- Prioridades sujetas a cambio según feedback.
- Fecha de última actualización: 10 de febrero de 2026.
