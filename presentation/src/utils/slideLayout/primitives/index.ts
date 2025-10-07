// Re-export from layoutConstants
export * from './layoutConstants';

// Re-export from layoutCalculations
import { calculateUnifiedFontSizeForLabels } from './fontSizeCalculations';
export { calculateUnifiedFontSizeForLabels } from './fontSizeCalculations';

// Re-export from layoutPositioning
import {
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
} from './positioning';
export {
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,
} from './positioning';

// Re-export from layoutElementCreators
import { createTextElement } from './elementCreators';
import {
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,
} from './elementCreators';
export {
  createTextElement,
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,
} from './elementCreators';

// Re-export from layoutInstanceBuilder
import {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
} from './instanceBuilder';
export {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
} from './instanceBuilder';

import { getAllDescendantInstances } from './layoutUtils';
export { getAllDescendantInstances } from './layoutUtils';

import { resolveTemplateBounds } from './expressionResolver';
export { resolveTemplateBounds } from './expressionResolver';

import { resolveTemplateContainers } from './boundsResolver';
export { resolveTemplateContainers } from './boundsResolver';

// Legacy alias for backward compatibility
export { createTextElement as createElement };

const LayoutPrimitives = {
  // From layoutCalculations
  calculateUnifiedFontSizeForLabels,

  // From layoutPositioning
  getChildrenMaxBounds,
  layoutItemsInBlock,
  measureAndPositionElements,
  recursivelyPreprocessDescendants,
  recursivelyGetAllLabelInstances,

  // From layoutElementCreators
  createElement: createTextElement,
  createTextElement,
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

  // From layoutUtils
  getAllDescendantInstances,

  // From expressionResolver
  resolveTemplateBounds,

  // From boundsResolver
  resolveTemplateContainers,
};

export default LayoutPrimitives;
