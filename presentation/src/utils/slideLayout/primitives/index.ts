// Re-export from layoutConstants
export * from './layoutConstants';

// Re-export from elementMeasurement
export { calculateUnifiedFontSizeForLabels } from './elementMeasurement';

// Re-export from layoutPositioning
export { getChildrenMaxBounds, layoutItemsInBlock } from './positioning';

// Re-export from layoutElementCreators
import { createTextElement } from './elementCreators';

export {
  createTextElement,
  createImageElement,
  createTitleLine,
  createCard,
  createTextPPTElement,
  processBackground,
} from './elementCreators';

export {
  buildChildrenFromChildTemplate,
  buildInstanceWithBounds,
  calculateWrapLayout,
  distributeItems,
} from './instanceBuilder';

export { getAllDescendantInstances, recursivelyGetAllLabelInstances } from './layoutUtils';

export { resolveTemplateBounds } from './expressionResolver';

export { resolveTemplateContainers } from './boundsResolver';

// Legacy alias for backward compatibility
export { createTextElement as createElement };
