/**
 * Graphics System - Simple type-safe decorative elements for slides
 *
 * Each graphic type is a separate interface. Adding new types requires:
 * 1. Add interface here
 * 2. Add renderer in renderer.ts
 * 3. Add to GraphicElement union type
 */

import type { BorderConfig } from './styling';

/**
 * Horizontal line below title
 */
export interface TitleLine {
  type: 'titleLine';
  color?: string; // Defaults to theme.themeColors[0]
  width?: number; // Width in pixels, defaults to title width
  thickness?: number; // Line thickness, defaults to 4
}

/**
 * Separator between content sections
 * Automatically positions itself between two containers
 */
export interface ContentSeparator {
  type: 'contentSeparator';
  orientation: 'horizontal' | 'vertical';
  color?: string; // Defaults to theme.fontColor
  thickness?: number; // Defaults to 2
  containers: [string, string]; // [container1, container2] - separator positioned between them
}

/**
 * Corner decoration (e.g., corner brackets, ornaments)
 */
export interface CornerDecoration {
  type: 'cornerDecoration';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style: 'bracket';
  color?: string; // Defaults to theme.themeColors[0]
  size?: number; // Size in pixels, defaults to 30
  thickness?: number; // Line thickness, defaults to 2
}

/**
 * Straight horizontal timeline with arrows connecting items
 * Best for: Linear chronological progressions
 */
export interface StraightTimeline {
  type: 'straightTimeline';
  containerId: string; // Which container holds the timeline items
  color?: string; // Arrow/line color (defaults to theme.themeColors[0])
  thickness?: number; // Arrow line thickness (defaults to 3)
  verticalOffset?: number; // Offset from item bottom (defaults to 20)
}

export interface AlternatingTimeline {
  type: 'alternatingTimeline';
  containerId: string;
  color?: string;
  thickness?: number;
  centralLineY?: number; // Y position of central line (auto-calculated if not provided)
  branchLength?: number; // Length of vertical branches (defaults to 40)
}

/**
 * Wrapping timeline with snake pattern (rows alternate direction)
 * Best for: Multi-row timelines with wrapping enabled
 * Example: 1 -> 2 -> 3 -> 4
 *                        |
 *          8 <- 7 <- 6 <- 5
 */
export interface WrappingTimeline {
  type: 'wrappingTimeline';
  containerId: string; // Which container holds the timeline items
  color?: string; // Arrow/line color (defaults to theme.themeColors[0])
  thickness?: number; // Arrow line thickness (defaults to 3)
}

/**
 * Zigzag timeline with alternating diagonal lines
 * Best for: Emphasizing progression with a dynamic look
 */
export interface ZigZagTimeline {
  type: 'zigzagTimeline';
  containerId: string; // Which container holds the timeline items
  color?: string; // Arrow/line color (defaults to theme.themeColors[0])
  thickness?: number; // Arrow line thickness (defaults to 3)
  zigzagHeight?: number; // Height of each zigzag (defaults to 20)
  zigzagWidth?: number; // Width of each zigzag (defaults to 40)
}

export interface TrapezoidPyramid {
  type: 'trapezoidPyramid';
  containerId: string; // Which container holds the pyramid items
  spacing?: number; // Spacing between levels (defaults to 10)
  border?: BorderConfig; // Border configuration for pyramid levels
  colors?: string[]; // Colors for each level (defaults to theme.themeColors)
  reverse?: boolean; // If true, pyramid is inverted (defaults to false)
}

/**
 * Union of all graphic types
 */
export type GraphicElement =
  | TitleLine
  | ContentSeparator
  | CornerDecoration
  | StraightTimeline
  | AlternatingTimeline
  | WrappingTimeline
  | ZigZagTimeline
  | TrapezoidPyramid;

/**
 * Graphics collection for a template
 */
export interface TemplateGraphics {
  elements: GraphicElement[];
}
