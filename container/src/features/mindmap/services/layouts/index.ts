// Export layout utility functions and types
export {
  type HierarchyNode,
  type D3HierarchyNode,
  type HorizontalLayoutConfig,
  sortBySiblingOrder,
  groupByParent,
  buildSubtree,
  preprocessHierarchy,
  calculateHorizontalLayout,
  calculateBalancedHorizontalLayout,
} from './horizontalLayoutUtils';

export {
  type VerticalLayoutConfig,
  calculateVerticalLayout,
  calculateBalancedVerticalLayout,
} from './verticalLayoutUtils';

// Export sibling order utilities
export {
  inferOrderFromPositions,
  inferOrderForAllNodes,
  updateSiblingOrdersFromPositions,
} from './siblingOrder';

// Export all layout strategies (directional + balanced)
export * from './directionalLayoutStrategies';

// Export transition service
export * from './layoutTransition';

// Export factory last (depends on strategies)
export * from './layoutStrategy';
