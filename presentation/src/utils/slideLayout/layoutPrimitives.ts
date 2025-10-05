// ============================================================================
// Layout Primitives - Main Facade
// ============================================================================

// Re-export from layoutConstants
export * from './primitives/layoutConstants';

// Re-export from layoutCalculations
import { calculateTitleLayout, calculateUnifiedFontSizeForLabels } from './primitives/layoutCalculations';
export { calculateTitleLayout, calculateUnifiedFontSizeForLabels } from './primitives/layoutCalculations';

// Re-export from layoutPositioning
import {
  getPosition,
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
  resolveContainerPositions,
  calculateBoundsFromPositioning,
} from './primitives/layoutPositioning';
export {
  getPosition,
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
  resolveContainerPositions,
  calculateBoundsFromPositioning,
} from './primitives/layoutPositioning';

// Re-export from layoutElementCreators
import { createTextElement } from './primitives/layoutElementCreators';
import {
  createItemElementsWithStyles,
  createTextElementsWithUnifiedStyles,
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,
} from './primitives/layoutElementCreators';
export {
  createTextElement,
  createItemElementsWithStyles,
  createTextElementsWithUnifiedStyles,
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,
} from './primitives/layoutElementCreators';

// Re-export from layoutInstanceBuilder
import {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
  fromInstanceToArray,
} from './primitives/layoutInstanceBuilder';
export {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
  fromInstanceToArray,
} from './primitives/layoutInstanceBuilder';

// Re-export from layoutDataProcessing
import {
  normalizeDataStructure,
  collectLabelGroups,
  processFlatObjectData,
  processNestedData,
  processChildrenData,
  collectLabelGroupsRecursive,
  getColumnsLayout,
} from './primitives/layoutDataProcessing';
export {
  normalizeDataStructure,
  collectLabelGroups,
  processFlatObjectData,
  processNestedData,
  processChildrenData,
  collectLabelGroupsRecursive,
  getColumnsLayout,
} from './primitives/layoutDataProcessing';

// Legacy alias for backward compatibility
export { createTextElement as createElement };

// ============================================================================
// Default export for backward compatibility
// ============================================================================

const LayoutPrimitives = {
  // From layoutCalculations
  calculateTitleLayout,
  calculateUnifiedFontSizeForLabels,

  // From layoutPositioning
  getPosition,
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
  resolveContainerPositions,
  calculateBoundsFromPositioning,

  // From layoutElementCreators
  createElement: createTextElement,
  createItemElementsWithStyles,
  createTextElementsWithUnifiedStyles,
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,

  // From layoutInstanceBuilder
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
  fromInstanceToArray,

  // From layoutDataProcessing
  normalizeDataStructure,
  collectLabelGroups,
  processFlatObjectData,
  processNestedData,
  processChildrenData,
  collectLabelGroupsRecursive,
  getColumnsLayout,
};

export default LayoutPrimitives;
