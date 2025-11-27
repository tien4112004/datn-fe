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
} from './horizontalLayoutUtils';

export { type VerticalLayoutConfig, calculateVerticalLayout } from './verticalLayoutUtils';

// Export all layout strategies (directional + balanced)
export * from './directionalLayoutStrategies';

// Export transition service
export * from './LayoutTransitionService';

// Export factory last (depends on strategies)
export * from './LayoutStrategyFactory';
