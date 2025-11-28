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

// Export tree utilities (replacement for D3LayoutService tree methods)
export { getSubtreeNodes, findRootNodes, buildChildrenMap } from './treeUtils';

// Export sibling order utilities
export {
  inferOrderFromPositions,
  inferOrderForAllNodes,
  detectReorderFromDrag,
  getNextSiblingOrder,
  normalizeSiblingOrders,
  updateSiblingOrdersFromPositions,
  siblingOrderService,
} from './SiblingOrderService';

// Export all layout strategies (directional + balanced)
export * from './directionalLayoutStrategies';

// Export transition service
export * from './LayoutTransitionService';

// Export factory last (depends on strategies)
export * from './LayoutStrategyFactory';
