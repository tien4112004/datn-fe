import type { LayoutType, MindMapNode, Side } from '../../types';
import { LAYOUT_TYPE, SIDE } from '../../types';

/**
 * Configuration for layout-specific side assignments
 */
interface LayoutSideConfig {
  /** Valid sides for child nodes in this layout */
  validSides: Side[];
  /** Default side for new children */
  defaultSide: Side;
  /** Whether to balance children across sides */
  balanced: boolean;
}

/**
 * Layout side configurations
 */
const LAYOUT_SIDE_CONFIGS: Record<LayoutType, LayoutSideConfig> = {
  [LAYOUT_TYPE.HORIZONTAL_BALANCED]: {
    validSides: [SIDE.LEFT, SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: true,
  },
  [LAYOUT_TYPE.VERTICAL_BALANCED]: {
    validSides: [SIDE.TOP, SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: true,
  },
  [LAYOUT_TYPE.RIGHT_ONLY]: {
    validSides: [SIDE.RIGHT],
    defaultSide: SIDE.RIGHT,
    balanced: false,
  },
  [LAYOUT_TYPE.LEFT_ONLY]: {
    validSides: [SIDE.LEFT],
    defaultSide: SIDE.LEFT,
    balanced: false,
  },
  [LAYOUT_TYPE.BOTTOM_ONLY]: {
    validSides: [SIDE.BOTTOM],
    defaultSide: SIDE.BOTTOM,
    balanced: false,
  },
  [LAYOUT_TYPE.TOP_ONLY]: {
    validSides: [SIDE.TOP],
    defaultSide: SIDE.TOP,
    balanced: false,
  },
};

// ============================================================================
// Pure Functions
// ============================================================================

/**
 * Gets the layout side configuration for a given layout type.
 */
export const getLayoutConfig = (layoutType: LayoutType): LayoutSideConfig =>
  LAYOUT_SIDE_CONFIGS[layoutType] || LAYOUT_SIDE_CONFIGS[LAYOUT_TYPE.HORIZONTAL_BALANCED];

/**
 * Calculates the next side for a new child in a balanced layout.
 * For balanced layouts, returns the side with fewer children.
 * For single-direction layouts, returns the default side.
 */
export const getNextChildSide = (existingChildren: MindMapNode[], layoutType: LayoutType): Side => {
  const config = getLayoutConfig(layoutType);

  if (!config.balanced || config.validSides.length < 2) {
    return config.defaultSide;
  }

  const sideCounts: Record<string, number> = {};
  for (const side of config.validSides) {
    sideCounts[side] = 0;
  }

  for (const child of existingChildren) {
    const side = child.data.side;
    if (side in sideCounts) {
      sideCounts[side]++;
    }
  }

  let minCount = Infinity;
  let minSide = config.defaultSide;

  for (const side of config.validSides) {
    if (sideCounts[side] < minCount) {
      minCount = sideCounts[side];
      minSide = side;
    }
  }

  return minSide;
};
