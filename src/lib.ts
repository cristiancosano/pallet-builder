/**
 * Pallet Builder — Public API entry point
 *
 * This file re-exports everything that consumers of the library need.
 * It is used as the Vite library entry point.
 */

// ──────────────────────────────────────────────
// Core — Types & Value Objects
// ──────────────────────────────────────────────
export type {
  Dimensions3D,
  Position3D,
  Point2D,
  BoundingBox,
  DiscreteRotation,
  ValidationResult,
  Violation,
  PackingMetrics,
  PalletPreset,
  TruckPreset,
} from "@/core/types";

export { PalletMaterial, SeparatorMaterial, TruckType } from "@/core/types";

// ──────────────────────────────────────────────
// Core — Constants & Presets
// ──────────────────────────────────────────────
export {
  STANDARD_PALLETS,
  TRUCK_PRESETS,
  SEPARATOR_DEFAULTS,
  UNITS,
  COLLISION_TOLERANCE,
  MIN_SUPPORT_PERCENTAGE,
  WEIGHT_WARNING_THRESHOLD,
} from "@/core/constants";

// ──────────────────────────────────────────────
// Core — Scene Presets (visual themes)
// ──────────────────────────────────────────────
export type {
  ScenePreset,
  BoxStyle,
  PalletStyle,
  SeparatorStyle,
  SelectionStyle,
  WarehouseStyle,
  TruckStyle,
} from "@/core/presets";

export {
  PRESET_UNSTYLED,
  PRESET_INDUSTRIAL,
  SCENE_PRESETS,
  DEFAULT_PRESET,
} from "@/core/presets";

export { PresetProvider, usePreset } from "@/context/PresetContext";

// ──────────────────────────────────────────────
// Core — Entities
// ──────────────────────────────────────────────
export type { Box } from "@/core/entities/Box";
export type { PlacedBox } from "@/core/entities/PlacedBox";
export type { Pallet } from "@/core/entities/Pallet";
export type { Separator } from "@/core/entities/Separator";
export type { PalletFloor } from "@/core/entities/PalletFloor";
export type { StackedPallet } from "@/core/entities/StackedPallet";
export {
  getStackedPalletTotalHeight,
  getStackedPalletTotalWeight,
  ensureUniqueBoxIds,
} from "@/core/entities/StackedPallet";
export type { PlacedPallet } from "@/core/entities/PlacedPallet";
export type { Room } from "@/core/entities/Room";
export type { Warehouse } from "@/core/entities/Warehouse";
export type { Truck } from "@/core/entities/Truck";

// ──────────────────────────────────────────────
// Core — Validation
// ──────────────────────────────────────────────
export {
  // Collision
  getBoxBoundingBox,
  getPalletBoundingBox,
  aabbIntersects,
  validateNoBoxCollisions,
  validateNoPalletCollisions,
  // Bounds
  validateBoxInPalletBounds,
  validateAllBoxesInPalletBounds,
  validatePalletInTruck,
  validatePalletHeight,
  // Weight
  validatePalletWeight,
  validateTruckWeight,
  validateFragileLoad,
  validateWeightDistribution,
  // Stacking
  validateBoxStackability,
  validateInvertedPyramid,
  validateStackDimensions,
  validateSeparators,
  validateStackHeight,
  validateStackWeight,
  // Gravity
  validateSupport,
  // Stability
  calculateCenterOfGravity,
  calculateStabilityScore,
  validateCogInsideSupport,
  validateStability,
  // Polygon
  pointInPolygon,
  validatePalletInRoom,
} from "@/core/validation";

// ──────────────────────────────────────────────
// Core — Packing Strategies
// ──────────────────────────────────────────────
export type {
  PackingStrategy,
  PackingResult,
} from "@/core/packing/PackingStrategy";
export { ColumnStrategy } from "@/core/packing/ColumnStrategy";
export { BinPacking3DStrategy } from "@/core/packing/BinPacking3D";
export { TypeGroupStrategy } from "@/core/packing/TypeGroupStrategy";
export { MaterialGroupingStrategy } from "@/core/packing/MaterialGroupingStrategy";
export { MultiPalletBuilder } from "@/core/packing/MultiPalletBuilder";
export type { MultiPalletPackOptions } from "@/core/packing/MultiPalletBuilder";
export { PackingRegistry, defaultRegistry } from "@/core/packing/registry";

// ──────────────────────────────────────────────
// Core — Factories
// ──────────────────────────────────────────────
export { PalletFactory } from "@/core/factories/PalletFactory";
export { TruckFactory } from "@/core/factories/TruckFactory";
export { BoxFactory } from "@/core/factories/BoxFactory";

// ──────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────
export { usePhysicsValidation } from "@/hooks/usePhysicsValidation";
export type { PhysicsValidationResult } from "@/hooks/usePhysicsValidation";

export { usePalletMetrics } from "@/hooks/usePalletMetrics";
export type { PalletMetricsResult } from "@/hooks/usePalletMetrics";

export { usePackingStrategy } from "@/hooks/usePackingStrategy";
export type { UsePackingStrategyReturn } from "@/hooks/usePackingStrategy";

export { useWarehouseValidation } from "@/hooks/useWarehouseValidation";
export type { WarehouseValidationResult } from "@/hooks/useWarehouseValidation";

// ──────────────────────────────────────────────
// Components — Primitives
// ──────────────────────────────────────────────
export { BoxComponent } from "@/components/primitives/Box";
export type { BoxProps } from "@/components/primitives/Box";

export { PalletComponent } from "@/components/primitives/Pallet";
export type { PalletComponentProps } from "@/components/primitives/Pallet";

export { SeparatorComponent } from "@/components/primitives/Separator";
export type { SeparatorComponentProps } from "@/components/primitives/Separator";

export { StackedPalletComponent } from "@/components/primitives/StackedPallet";
export type { StackedPalletComponentProps } from "@/components/primitives/StackedPallet";

export { Label } from "@/components/primitives/Label";
export type { LabelProps } from "@/components/primitives/Label";

// ──────────────────────────────────────────────
// Components — Environments
// ──────────────────────────────────────────────
export { WarehouseEnvironment } from "@/components/environments/WarehouseEnvironment";
export type { WarehouseEnvironmentProps } from "@/components/environments/WarehouseEnvironment";

export { TruckEnvironment } from "@/components/environments/TruckEnvironment";
export type { TruckEnvironmentProps } from "@/components/environments/TruckEnvironment";

// ──────────────────────────────────────────────
// Components — Controls
// ──────────────────────────────────────────────
export { CameraControlsComponent } from "@/components/controls/CameraControls";
export type {
  CameraControlsProps,
  CameraPreset,
} from "@/components/controls/CameraControls";

// ──────────────────────────────────────────────
// Components — Scenes (pre-composed)
// ──────────────────────────────────────────────
export { PalletScene } from "@/components/scenes/PalletScene";
export type { PalletSceneProps } from "@/components/scenes/PalletScene";

export { TruckScene } from "@/components/scenes/TruckScene";
export type { TruckSceneProps } from "@/components/scenes/TruckScene";

export { WarehouseScene } from "@/components/scenes/WarehouseScene";
export type { WarehouseSceneProps } from "@/components/scenes/WarehouseScene";
