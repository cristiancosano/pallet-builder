/**
 * Validation barrel export
 */

// Collision
export {
  getBoxBoundingBox,
  getPalletBoundingBox,
  aabbIntersects,
  validateNoBoxCollisions,
  validateNoPalletCollisions,
} from './collision'

// Bounds
export {
  validateBoxInPalletBounds,
  validateAllBoxesInPalletBounds,
  validatePalletInTruck,
  validatePalletHeight,
} from './bounds'

// Weight
export {
  validatePalletWeight,
  validateTruckWeight,
  validateFragileLoad,
  validateWeightDistribution,
} from './weight'

// Stacking
export {
  validateBoxStackability,
  validateInvertedPyramid,
  validateStackDimensions,
  validateSeparators,
  validateStackHeight,
  validateStackWeight,
} from './stacking'

// Gravity
export { validateSupport } from './gravity'

// Stability
export {
  calculateCenterOfGravity,
  calculateStabilityScore,
  validateCogInsideSupport,
  validateStability,
} from './stability'

// Polygon
export {
  pointInPolygon,
  validatePalletInRoom,
} from './polygon'
