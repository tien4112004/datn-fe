// ============================================================================
// Layout Primitives - Main Facade
// ============================================================================

// Re-export from layoutConstants
export * from './primitives/layoutConstants';

// Re-export from layoutCalculations
import { calculateUnifiedFontSizeForLabels } from './primitives/layoutCalculations';
export { calculateUnifiedFontSizeForLabels } from './primitives/layoutCalculations';

// Re-export from layoutPositioning
import {
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
  resolveContainerPositions,
  calculateBoundsFromPositioning,
  getColumnsLayout,
} from './primitives/layoutPositioning';
export {
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
} from './primitives/layoutInstanceBuilder';
export {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
} from './primitives/layoutInstanceBuilder';

import { getAllDescendantInstances } from './primitives/layoutUtils';

// Legacy alias for backward compatibility
export { createTextElement as createElement };

// ============================================================================
// Default export for backward compatibility
// ============================================================================

const LayoutPrimitives = {
  // From layoutCalculations
  calculateUnifiedFontSizeForLabels,

  // From layoutPositioning
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
  resolveContainerPositions,
  calculateBoundsFromPositioning,

  // From layoutElementCreators
  createElement: createTextElement,
  createTextElement,
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

  getColumnsLayout,

  getAllDescendantInstances,
};

export default LayoutPrimitives;
