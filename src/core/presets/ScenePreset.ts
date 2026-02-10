/**
 * ScenePreset — Definiciones de estilos visuales predefinidos
 *
 * Cada preset define colores, materiales e indicadores para todos los
 * elementos de la escena (cajas, palets, separadores, environments).
 * El consumidor puede usar un preset tal cual, extenderlo o crear el suyo propio.
 */

// ─── Tipos ───────────────────────────────────────────────────────

export interface BoxStyle {
  /** Color por defecto de las cajas */
  color: string
  /** Rugosidad del material (0–1) */
  roughness: number
  /** Metalicidad del material (0–1) */
  metalness: number
  /** Opacidad por defecto */
  opacity: number
}

export interface PalletStyle {
  /** Color del palet */
  color: string
  /** Color del borde decorativo */
  edgeColor: string
  roughness: number
  metalness: number
}

export interface SeparatorStyle {
  /** Override de color (null = usa color por material) */
  colorOverride: string | null
  roughness: number
}

export interface SelectionStyle {
  /** Color del borde de selección */
  selectedColor: string
  /** Color del borde de highlight (hover) */
  highlightedColor: string
}

export interface WarehouseStyle {
  /** Color del suelo */
  floorColor: string
  /** Rugosidad del suelo */
  floorRoughness: number
  /** Color de las paredes */
  wallColor: string
  /** Opacidad de las paredes */
  wallOpacity: number
  /** Color de la iluminación ambiente */
  ambientIntensity: number
  /** Intensidad de la luz direccional */
  directionalIntensity: number
  /** Mostrar grid por defecto */
  showGrid: boolean
  /** Color principal del grid */
  gridColor: string
  /** Color secundario del grid */
  gridSecondaryColor: string
}

export interface TruckStyle {
  /** Color del suelo */
  floorColor: string
  /** Color de las paredes */
  wallColor: string
  /** Opacidad de las paredes */
  wallOpacity: number
}

export interface ScenePreset {
  /** Nombre identificador del preset */
  readonly id: string
  /** Nombre legible */
  readonly name: string

  box: BoxStyle
  pallet: PalletStyle
  separator: SeparatorStyle
  selection: SelectionStyle
  warehouse: WarehouseStyle
  truck: TruckStyle
}

// ─── Presets incluidos ───────────────────────────────────────────

/**
 * Preset UNSTYLED — geometría básica con colores planos.
 * Ideal para desarrollo, depuración o cuando el consumidor quiere
 * aplicar su propio estilo desde cero.
 */
export const PRESET_UNSTYLED: ScenePreset = {
  id: 'unstyled',
  name: 'Sin estilo',

  box: {
    color: '#e07b39',
    roughness: 0.6,
    metalness: 0.1,
    opacity: 1,
  },
  pallet: {
    color: '#c4a26e',
    edgeColor: '#8b7355',
    roughness: 0.85,
    metalness: 0.05,
  },
  separator: {
    colorOverride: null,
    roughness: 0.8,
  },
  selection: {
    selectedColor: '#ff0000',
    highlightedColor: '#42a5f5',
  },
  warehouse: {
    floorColor: '#8a8a8a',
    floorRoughness: 0.8,
    wallColor: '#d0d0d0',
    wallOpacity: 0.4,
    ambientIntensity: 0.4,
    directionalIntensity: 0.8,
    showGrid: true,
    gridColor: '#666666',
    gridSecondaryColor: '#999999',
  },
  truck: {
    floorColor: '#8a7e72',
    wallColor: '#b0b0b0',
    wallOpacity: 0.35,
  },
}

/**
 * Preset INDUSTRIAL — aspecto de almacén profesional.
 * Colores más saturados, iluminación más cálida, bordes contrastados.
 * Usa las texturas y HDR incluidos en /public como base.
 */
export const PRESET_INDUSTRIAL: ScenePreset = {
  id: 'industrial',
  name: 'Industrial',

  box: {
    color: '#d4895a',
    roughness: 0.7,
    metalness: 0.05,
    opacity: 1,
  },
  pallet: {
    color: '#a8854a',
    edgeColor: '#6b5030',
    roughness: 0.9,
    metalness: 0.02,
  },
  separator: {
    colorOverride: null,
    roughness: 0.85,
  },
  selection: {
    selectedColor: '#e53935',
    highlightedColor: '#29b6f6',
  },
  warehouse: {
    floorColor: '#5c5c5c',
    floorRoughness: 0.92,
    wallColor: '#b0b8be',
    wallOpacity: 0.5,
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    showGrid: true,
    gridColor: '#4a4a4a',
    gridSecondaryColor: '#6a6a6a',
  },
  truck: {
    floorColor: '#6e6358',
    wallColor: '#9eaab4',
    wallOpacity: 0.4,
  },
}

/** Mapa de presets disponibles por ID */
export const SCENE_PRESETS: Record<string, ScenePreset> = {
  unstyled: PRESET_UNSTYLED,
  industrial: PRESET_INDUSTRIAL,
}

/** Preset por defecto si el consumidor no elige ninguno */
export const DEFAULT_PRESET: ScenePreset = PRESET_INDUSTRIAL
