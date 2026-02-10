# Glosario del Dominio

Diccionario de términos utilizados en el proyecto. Este es nuestro **Lenguaje Ubicuo** (Ubiquitous Language).

> **Nota**: Pallet Builder es una librería. En los puntos donde se habla de "usuario", se refiere tanto al operario/gerente que usa la aplicación final como al desarrollador que integra la librería. El contexto lo aclarará.

---

## Términos Principales

### A

**AABB (Axis-Aligned Bounding Box)**
- Caja delimitadora alineada con los ejes.
- Se usa para detección de colisiones eficiente.
- Definida por puntos mínimo y máximo en cada eje.

**Almacén (Warehouse)**
- Entidad raíz que agrupa una o más estancias.
- Representa la totalidad de un espacio de almacenamiento.
- Ver → Warehouse.

**Apilamiento (Stacking)**
- Colocar un objeto sobre otro respetando reglas de peso y estabilidad.
- Aplica a cajas sobre palet y a palets sobre palets (con separador).

**Apilamiento de Palets (Pallet Stacking)**
- Colocar un palet encima de otro (del mismo formato de planta) con un separador intermedio.
- Permite "palets parciales" — pedidos pequeños que comparten palet base.
- Ver → StackedPallet, Separator.

### B

**Bin Packing**
- Algoritmo de optimización para empaquetar objetos maximizando uso del espacio.
- Versión 3D aplicada a palets.
- Ver → PackingStrategy.

**Bounding Box**
- Ver AABB.

### C

**Caja (Box)**
- Elemento individual que se coloca sobre un palet.
- Tiene dimensiones, peso, SKU, fragilidad, metadatos.
- Unidad básica de carga.

**Caja Colocada (PlacedBox)**
- Una Box ya posicionada en un palet con coordenadas XYZ y rotación.

**Cualificación de IDs (Scoped Selection)**
- En escenas multi-palet, los IDs de cajas se cualifican con el ID del palet contenedor (`palletId:boxId`) para garantizar unicidad.
- Evita selecciones cruzadas cuando varios palets comparten la misma referencia de `StackedPallet`.
- Se activa automáticamente vía el prop `palletId` en `StackedPalletComponent`.
- Registra relaciones de soporte (qué hay encima/debajo).

**Camión (Truck)**
- Entidad raíz que representa el espacio útil de carga de un vehículo.
- Se define por tipo (caja cerrada, frigorífico, plataforma, tautliner, custom), dimensiones internas y peso máximo.

**Capacidad de Carga (Load Capacity)**
- Peso máximo que puede soportar un palet o camión.
- Típicamente 500 kg – 2000 kg para palets; 20-25 t para camiones.

**Centro de Gravedad (Center of Gravity / CoG)**
- Punto donde se concentra el peso total de la carga.
- Debe estar dentro del polígono de soporte para evitar volcado.
- Calculado como promedio ponderado de posiciones por peso.

**Colisión (Collision)**
- Superposición física entre dos objetos.
- Detectada mediante AABB.
- Siempre es un error bloqueante (BR-002, BR-003).

**Columna (Column)**
- En el contexto de empaquetado: apilamiento vertical de cajas del mismo tipo sobre la base del palet.
- Ej: "en la base caben 4 cajas → 4 columnas, cada una de un tipo".
- Ver → ColumnPackingStrategy.

**Componentes Granulares (Granular Components)**
- Los componentes React primitivos que exporta la librería: `<Box />`, `<Pallet />`, `<Separator />`, etc.
- Usados para componer escenas personalizadas.

### D

**Dimensiones (Dimensions3D)**
- Medidas espaciales: ancho (width, X), alto (height, Y), profundidad (depth, Z).
- Siempre en milímetros (mm).

### E

**Escena (Scene)**
- Composición completa de un Canvas R3F con iluminación, cámara y decorado.
- Tres escenas estandarizadas: WarehouseScene, TruckScene, PalletScene.

**Escenas Precompuestas (Pre-composed Scenes)**
- Los componentes React de alto nivel que exporta la librería y combinan primitivas + cámara + iluminación.

**Estabilidad (Stability)**
- Medida de seguridad de una configuración de carga.
- Score 0-100, basado en CoG, distribución de peso y soporte.

**Estancia (Room)**
- Espacio individual dentro de un almacén.
- Definido por un polígono 2D (planta) y una altura de techo.
- Puede tener forma irregular (L, U, T…).

**Euro Pallet / EPAL**
- Pallet estándar europeo: 1200 × 800 × 144 mm, 1000 kg.

### F

**Fragilidad (Fragility)**
- Propiedad de una caja que indica si es frágil y cuánto peso soporta encima.
- Si `fragile = true` y `fragilityMaxWeight` no definido → nada encima.

### G

**Gravedad Simulada (Simulated Gravity)**
- Regla que impide que los objetos floten.
- Una caja sin soporte cae hasta encontrar superficie.
- Ver → BR-004.

### H

**Hook**
- Función React que encapsula lógica reutilizable.
- La librería exporta: `usePhysicsValidation`, `usePalletMetrics`, `usePackingStrategy`.

### I

**Instancing**
- Técnica de renderizado Three.js para dibujar muchos objetos idénticos con una sola llamada.
- Relevante cuando hay muchas cajas del mismo tipo.

### L

**Librería (Library)**
- Naturaleza del proyecto: NO es una aplicación, es un paquete npm consumible.
- Exporta componentes, hooks, entidades y utilidades.
- El desarrollador final compone la aplicación con store y UX propia.

### M

**Metadatos (Metadata)**
- `Record<string, unknown>` presente en todas las entidades.
- El desarrollador inyecta datos de negocio: producto, lote, caducidad, proveedor, etc.
- La librería NO filtra ni busca en metadatos; solo los almacena y expone.

### O

**Operario (Operator)**
- Usuario final de la aplicación construida con la librería.
- Usa la herramienta para visualizar dónde está cada palet/caja y gestionar stock.

### P

**Palet (Pallet)**
- Plataforma para transporte y almacenamiento.
- Base sobre la que se colocan cajas.
- Tiene dimensiones, material, peso máximo, peso propio.

**Tipos de Palets Estándar (Standard Pallet Types)**
- El sistema incluye presets para los principales tipos de palets utilizados en logística internacional:
  - **EUR/EPAL** — Palet europeo (1200×800×144mm, ISO 6780). El más común en Europa. También conocido como Europallet. Factory: `PalletFactory.euro()`
  - **GMA** — Palet norteamericano estándar (1219×1016×145mm, 48"×40"). Estándar de la Grocery Manufacturers Association. Factory: `PalletFactory.gma()`
  - **UK Standard** — Palet estándar del Reino Unido (1200×1000×150mm). Factory: `PalletFactory.uk()`
  - **Asia Pallet** — Palet estándar asiático (1100×1100×150mm, ISO 6780). Factory: `PalletFactory.asia()`
  - **Australian** — Palet estándar australiano (1165×1165×150mm). Factory: `PalletFactory.australian()`
  - **Half EUR** — Medio palet europeo (800×600×144mm). Útil para cargas pequeñas. Factory: `PalletFactory.halfEuro()`
  - **Quarter EUR** — Cuarto de palet europeo (600×400×144mm). Factory: `PalletFactory.quarterEuro()`
  - **ISO 1** — Palet ISO 6780-1 (1200×1000×150mm). Equivalente al UK. Factory: `PalletFactory.iso1()`
  - **ISO 2** — Palet ISO 6780-2 (1200×800×144mm). Equivalente al EUR. Factory: `PalletFactory.iso2()`
- Los presets se definen en `STANDARD_PALLETS` (constants.ts) e incluyen dimensiones, material, peso máximo y peso propio.
- Factory genérico: `PalletFactory.fromPreset('EUR')` o usar métodos específicos.
- Ver → PalletFactory, PalletPreset.

**Palet Parcial (Partial Pallet)**
- Un palet cargado parcialmente.
- Se puede apilar con separador encima de otro palet para optimizar espacio en camión cuando los pedidos son pequeños.
- Ver → StackedPallet.

**Palet Posicionado (PlacedPallet)**
- StackedPallet ya colocado en una estancia o camión con posición XZ y rotación Y.

**Piso de Palet (PalletFloor)**
- Un nivel dentro de un StackedPallet: palet + cajas + separador opcional encima.

**PackingStrategy (Estrategia de Empaquetado)**
- Interfaz adapter que define el contrato `pack(boxes, pallet) → PlacementResult`.
- Se intercambia en runtime.
- Implementaciones incluidas: ColumnPackingStrategy, TypeGroupPackingStrategy, BinPacking3DStrategy.

**Polígono (Polygon)**
- Forma 2D que define la planta de una estancia.
- Array de Point2D. Mínimo 3 vértices.
- Admite formas convexas y cóncavas.

**Posición (Position3D)**
- Coordenadas 3D `{ x, y, z }` en mm.
- x: ancho, y: vertical, z: profundidad.

### R

**R3F (React Three Fiber)**
- React renderer para Three.js.
- Base de la visualización 3D de la librería.

**Rotación Discreta (Discrete Rotation)**
- Rotación limitada a 0°, 90°, 180°, 270° por eje.
- Las cajas y palets solo se rotan en incrementos de 90°.

### S

**Separador (Separator)**
- Plano rígido (cartón, madera, plástico) que se coloca entre pisos de palet.
- Tiene grosor, dimensiones y peso propio.
- Obligatorio entre pisos de un StackedPallet (BR-302).

**SKU (Stock Keeping Unit)**
- Código único de producto en una caja.
- Campo fijo (no metadata) para facilitar agrupaciones y algoritmos.

**StackedPallet (Palet Apilado)**
- Composición de 1+ pisos de palet con separadores intermedios.
- Todos los pisos comparten dimensiones de planta.
- El límite de altura lo dicta el contenedor (estancia o camión).

**Stability Score**
- Puntuación 0-100 de estabilidad de un palet cargado.
- ≥ 70 = bueno, 50-70 = warning, < 50 = inestable (error).

### T

**Truck (Camión)**
- Ver → Camión.

**TruckType (Tipo de Camión)**
- Enum: BOX, REFRIGERATED, FLATBED, TAUTLINER, CUSTOM.
- Cada tipo tiene dimensiones y peso máximo predefinidos.

### U

**Utilización (Utilization)**
- Porcentaje de volumen/peso usado respecto al disponible.
- Métrica clave de eficiencia en PackingMetrics.

### V

**Validación (Validation)**
- Proceso de comprobar reglas de negocio.
- Retorna `ValidationResult` con violations tipadas (code, severity, message).

**Value Object**
- Objeto sin identidad, definido por sus valores, inmutable.
- Ej: Dimensions3D, Position3D, BoundingBox.

**Violation**
- Una infracción de regla de negocio detectada.
- Tiene code, severity (error|warning) y message.

### W

**Warehouse (Almacén)**
- Aggregate root que contiene estancias (Room[]).
- Ver → Almacén.

**WarehouseScene**
- Escena precompuesta que renderiza un almacén con estancias navegables.

---

## Acrónimos

| Acrónimo | Significado | Contexto |
|----------|-------------|----------|
| AABB | Axis-Aligned Bounding Box | Colisiones |
| ADR | Architecture Decision Record | Documentación |
| CoG | Center of Gravity | Física |
| DDD | Domain-Driven Design | Arquitectura |
| EPAL | European Pallet Association | Estándares |
| ESM | ECMAScript Modules | Build |
| R3F | React Three Fiber | Framework 3D |
| SKU | Stock Keeping Unit | Inventario |

---

## Unidades de Medida

| Magnitud | Unidad | Notas |
|----------|--------|-------|
| Dimensiones | mm (milímetros) | Toda la API usa mm |
| Peso | kg (kilogramos) | |
| Rotación | grados (0/90/180/270) | Solo discreta en esta librería |
| Volumen | mm³ | Derivado de Dimensions3D |
| Coordenadas 3D | mm | Componentes convierten a metros internamente para Three.js |

---

## Estándares de Palets

| Nombre | Dimensiones (mm) | Región | Capacidad típica |
|--------|------------------|--------|------------------|
| EUR/EPAL | 1200 × 800 × 144 | Europa | 1000 kg |
| ISO 1 | 1200 × 1000 × 150 | ISO | 1200 kg |
| American | 1219 × 1016 × 145 | USA | 1200 kg |
| Asia | 1100 × 1100 × 150 | Asia | 1000 kg |

---

## Lenguaje Ubicuo — Frases Correctas

- ✅ "Colocar una caja en el palet"  — ❌ "Añadir un ítem al contenedor"
- ✅ "Posicionar un palet en la estancia"  — ❌ "Poner un palet en el almacén"
- ✅ "Apilar un palet parcial con separador"  — ❌ "Poner un palet encima"
- ✅ "Ejecutar la estrategia de empaquetado por columnas"  — ❌ "Ordenar las cajas"
- ✅ "Validar restricciones de carga"  — ❌ "Chequear si cabe"
- ✅ "Calcular el centro de gravedad"  — ❌ "Calcular el centro"
- ✅ "La caja excede el peso máximo del palet"  — ❌ "Está muy pesado"
- ✅ "El desarrollador registra una estrategia custom"  — ❌ "El usuario añade un algoritmo"

---

Este glosario debe mantenerse sincronizado con el código. Si introduces un nuevo concepto del dominio, documéntalo aquí.
