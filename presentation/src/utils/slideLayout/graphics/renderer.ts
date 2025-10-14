import type { PPTLineElement, PPTShapeElement, SlideTheme } from '@/types/slides';
import type {
  GraphicElement,
  TitleLine,
  ContentSeparator,
  CornerDecoration,
  StraightTimeline,
  AlternatingTimeline,
  WrappingTimeline,
} from './types';
import type { Bounds } from '../types';
import { nanoid } from 'nanoid';
import { DEFAULT_TITLE_LINE_SPACING } from '../primitives';

/**
 * Context needed for rendering graphics
 */
export interface GraphicsRenderContext {
  theme: SlideTheme;
  viewport: { width: number; height: number };
  containerBounds: Record<string, Bounds>; // Template-defined bounds
  containerActualBounds?: Record<string, Bounds>; // Actual rendered element bounds
  childBounds?: Record<string, Bounds[]>; // Array of child item bounds per container
}

/**
 * Render TitleLine graphic
 */
function renderTitleLine(graphic: TitleLine, context: GraphicsRenderContext): PPTLineElement {
  const { theme, containerBounds, containerActualBounds } = context;

  // Prefer actual rendered bounds over template bounds for title
  const titleBounds = containerActualBounds?.title || containerBounds.title;

  if (!titleBounds) {
    throw new Error('TitleLine requires a title container in the template');
  }

  const color = graphic.color || theme.themeColors[0];
  const width = graphic.width || titleBounds.width;
  const thickness = graphic.thickness || 4;

  const y = titleBounds.top + titleBounds.height + DEFAULT_TITLE_LINE_SPACING;
  const startX = titleBounds.left;

  return {
    type: 'line',
    id: nanoid(10),
    left: startX,
    top: y,
    width: thickness,
    start: [0, 0],
    end: [width, 0],
    style: 'solid',
    color: color,
    points: ['', ''],
  };
}

/**
 * Render ContentSeparator graphic
 * Automatically positions between two containers
 */
function renderContentSeparator(graphic: ContentSeparator, context: GraphicsRenderContext): PPTLineElement {
  const { theme, containerBounds, containerActualBounds } = context;

  const [container1Id, container2Id] = graphic.containers;

  // Prefer actual bounds if available, fallback to template bounds
  const bounds1 = containerActualBounds?.[container1Id] || containerBounds[container1Id];
  const bounds2 = containerActualBounds?.[container2Id] || containerBounds[container2Id];

  if (!bounds1 || !bounds2) {
    throw new Error(
      `ContentSeparator requires both containers '${container1Id}' and '${container2Id}' to exist`
    );
  }

  const color = graphic.color || theme.fontColor;
  const thickness = graphic.thickness || 2;

  let start: [number, number];
  let end: [number, number];
  let lineWidth: number;

  if (graphic.orientation === 'horizontal') {
    // Horizontal line between top (container1) and bottom (container2) containers
    const y = (bounds1.top + bounds1.height + bounds2.top) / 2;
    const leftmost = Math.min(bounds1.left, bounds2.left);
    const rightmost = Math.max(bounds1.left + bounds1.width, bounds2.left + bounds2.width);
    const length = rightmost - leftmost;

    start = [leftmost, y];
    end = [rightmost, y];
    lineWidth = length;
  } else {
    // Vertical line between left (container1) and right (container2) containers
    const x = (bounds1.left + bounds1.width + bounds2.left) / 2;
    const topmost = Math.min(bounds1.top, bounds2.top);
    const bottommost = Math.max(bounds1.top + bounds1.height, bounds2.top + bounds2.height);
    const length = bottommost - topmost;

    start = [x, topmost];
    end = [x, bottommost];
    lineWidth = length;
  }

  return {
    type: 'line',
    id: nanoid(10),
    left: start[0],
    top: start[1],
    width: thickness,
    start: [0, 0],
    end: [end[0] - start[0], end[1] - start[1]],
    style: 'solid',
    color: color,
    points: ['', ''],
  };
}

/**
 * Render CornerDecoration graphic
 */
function renderCornerDecoration(graphic: CornerDecoration, context: GraphicsRenderContext): PPTShapeElement {
  const { theme, viewport } = context;

  const color = graphic.color || theme.themeColors[0];
  const size = graphic.size || 30;
  const thickness = graphic.thickness || 2;

  // Determine corner position
  let left: number;
  let top: number;
  let path: string;

  const margin = 20; // Distance from viewport edges

  switch (graphic.corner) {
    case 'top-left':
      left = margin;
      top = margin;
      path = `M ${size} 0 L 0 0 L 0 ${size}`;
      break;

    case 'top-right':
      left = viewport.width - margin - size;
      top = margin;
      path = `M 0 0 L ${size} 0 L ${size} ${size}`;
      break;

    case 'bottom-left':
      left = margin;
      top = viewport.height - margin - size;
      path = `M 0 0 L 0 ${size} L ${size} ${size}`;
      break;

    case 'bottom-right':
      left = viewport.width - margin - size;
      top = viewport.height - margin - size;
      path = `M ${size} 0 L ${size} ${size} L 0 ${size}`;
      break;
  }

  return {
    type: 'shape',
    id: nanoid(10),
    left,
    top,
    width: size,
    height: size,
    rotate: 0,
    viewBox: [size, size],
    path: path!,
    fixedRatio: true,
    fill: 'transparent',
    outline: {
      style: 'solid',
      width: thickness,
      color: color,
    },
  };
}

/**
 * Render StraightTimeline - horizontal arrows connecting items
 */
function renderStraightTimeline(graphic: StraightTimeline, context: GraphicsRenderContext): PPTLineElement[] {
  const { theme, childBounds } = context;
  const itemBounds = childBounds?.[graphic.containerId];

  if (!itemBounds || itemBounds.length < 2) {
    throw new Error(`StraightTimeline requires at least 2 items in container '${graphic.containerId}'`);
  }

  const color = graphic.color || theme.themeColors[0];
  const thickness = graphic.thickness || 3;

  const lines: PPTLineElement[] = [];

  // Create arrow between each consecutive pair
  for (let i = 0; i < itemBounds.length - 1; i++) {
    const current = itemBounds[i];
    const next = itemBounds[i + 1];

    // Arrow from right edge of current to left edge of next
    const startX = current.left + current.width;
    const endX = next.left;
    const y = current.top + current.height / 2;

    lines.push({
      type: 'line',
      id: nanoid(10),
      left: startX,
      top: y,
      width: thickness,
      start: [1, 0],
      end: [endX - startX - thickness - 1, 0],
      style: 'solid',
      color: color,
      points: ['', 'arrow'],
    });
  }

  return lines;
}

/**
 * Render AlternatingTimeline - items above/below central line
 */
function renderAlternatingTimeline(
  graphic: AlternatingTimeline,
  context: GraphicsRenderContext
): PPTLineElement[] {
  const { theme, childBounds, containerBounds } = context;
  const itemBounds = childBounds?.[graphic.containerId];
  const containerBound = containerBounds[graphic.containerId];

  if (!itemBounds || itemBounds.length < 2) {
    throw new Error(`AlternatingTimeline requires at least 2 items in container '${graphic.containerId}'`);
  }

  const color = graphic.color || theme.themeColors[0];
  const thickness = graphic.thickness || 3;

  // Calculate central line Y position
  const centralLineY = graphic.centralLineY || containerBound.top + containerBound.height / 2;

  const lines: PPTLineElement[] = [];

  // Main central horizontal line
  const leftmost = Math.min(...itemBounds.map((b) => b.left));
  const rightmost = Math.max(...itemBounds.map((b) => b.left + b.width));

  lines.push({
    type: 'line',
    id: nanoid(10),
    left: leftmost,
    top: centralLineY,
    width: thickness,
    start: [0, 0],
    end: [rightmost - leftmost, 0],
    style: 'solid',
    color: color,
    points: ['', ''],
  });

  // Create vertical branches for each item
  itemBounds.forEach((bounds, index) => {
    const isAbove = index % 2 === 0; // Alternate above/below
    const itemCenterX = bounds.left + bounds.width / 2;

    const branchY = isAbove ? bounds.top + bounds.height : bounds.top;

    lines.push({
      type: 'line',
      id: nanoid(10),
      left: itemCenterX,
      top: Math.min(branchY, centralLineY),
      width: thickness,
      start: [0, 0],
      end: [0, Math.abs(centralLineY - branchY)],
      style: 'solid',
      color: color,
      points: ['', ''],
    });
  });

  return lines;
}

/**
 * Helper: Group items into rows based on Y coordinate
 */
function groupIntoRows(bounds: Bounds[]): Bounds[][] {
  const tolerance = 5; // Y-coordinate tolerance for same row
  const rows: Bounds[][] = [];

  bounds.forEach((bound) => {
    const existingRow = rows.find((row) => Math.abs(row[0].top - bound.top) < tolerance);

    if (existingRow) {
      existingRow.push(bound);
    } else {
      rows.push([bound]);
    }
  });

  // Sort rows by Y position, then sort items in each row by X position
  rows.sort((a, b) => a[0].top - b[0].top);
  rows.forEach((row) => row.sort((a, b) => a.left - b.left));

  return rows;
}

/**
 * Helper: Create horizontal arrow between two items
 */
function createHorizontalArrow(
  from: Bounds,
  to: Bounds,
  color: string,
  thickness: number,
  isLeftToRight: boolean
): PPTLineElement {
  const startX = isLeftToRight ? from.left + from.width : from.left;
  const endX = isLeftToRight ? to.left - thickness : to.left + to.width + thickness;
  const y = from.top + from.height / 2;

  return {
    type: 'line',
    id: nanoid(10),
    left: Math.min(startX, endX),
    top: y,
    width: thickness,
    start: [0, 0],
    end: [Math.abs(endX - startX), 0],
    style: 'solid',
    color,
    points: isLeftToRight ? ['', 'arrow'] : ['arrow', ''],
  };
}

/**
 * Helper: Create vertical connector between rows
 */
function createVerticalConnector(from: Bounds, to: Bounds, color: string, thickness: number): PPTLineElement {
  const x = from.left + from.width / 2;
  const startY = from.top + from.height;
  const endY = to.top;

  return {
    type: 'line',
    id: nanoid(10),
    left: x,
    top: startY,
    width: thickness,
    start: [0, 0],
    end: [0, endY - startY - thickness],
    style: 'solid',
    color,
    points: ['', 'arrow'],
  };
}

/**
 * Render WrappingTimeline - snake pattern with alternating row directions
 */
function renderWrappingTimeline(graphic: WrappingTimeline, context: GraphicsRenderContext): PPTLineElement[] {
  const { theme, childBounds } = context;
  const itemBounds = childBounds?.[graphic.containerId];

  if (!itemBounds || itemBounds.length < 2) {
    throw new Error(`WrappingTimeline requires at least 2 items in container '${graphic.containerId}'`);
  }

  const color = graphic.color || theme.themeColors[0];
  const thickness = graphic.thickness || 3;
  const lines: PPTLineElement[] = [];

  // Group items by row (items with similar Y coordinates)
  const rows = groupIntoRows(itemBounds);

  rows.forEach((row, rowIndex) => {
    const isLeftToRight = rowIndex % 2 === 0;

    // Items are always physically left-to-right in the layout
    // For odd rows, we draw arrows in reverse direction (right-to-left)
    if (isLeftToRight) {
      // Even rows: connect left to right
      for (let i = 0; i < row.length - 1; i++) {
        lines.push(createHorizontalArrow(row[i], row[i + 1], color, thickness, true));
      }
    } else {
      // Odd rows: connect right to left (reverse order arrows)
      for (let i = row.length - 1; i > 0; i--) {
        lines.push(createHorizontalArrow(row[i], row[i - 1], color, thickness, false));
      }
    }

    // Vertical connector to next row
    if (rowIndex < rows.length - 1) {
      const nextRow = rows[rowIndex + 1];

      // Connect from rightmost of current row to rightmost of next row (if current is L->R)
      // Connect from leftmost of current row to leftmost of next row (if current is R->L)
      const fromItem = isLeftToRight ? row[row.length - 1] : row[0];
      const toItem = isLeftToRight ? nextRow[nextRow.length - 1] : nextRow[0];

      lines.push(createVerticalConnector(fromItem, toItem, color, thickness));
    }
  });

  return lines;
}

/**
 * Main render function - converts GraphicElement to PPT elements
 */
export function renderGraphic(
  graphic: GraphicElement,
  context: GraphicsRenderContext
): PPTLineElement | PPTShapeElement | (PPTLineElement | PPTShapeElement)[] {
  switch (graphic.type) {
    case 'titleLine':
      return renderTitleLine(graphic, context);
    case 'contentSeparator':
      return renderContentSeparator(graphic, context);
    case 'cornerDecoration':
      return renderCornerDecoration(graphic, context);
    case 'straightTimeline':
      return renderStraightTimeline(graphic, context);
    case 'alternatingTimeline':
      return renderAlternatingTimeline(graphic, context);
    case 'wrappingTimeline':
      return renderWrappingTimeline(graphic, context);
    default:
      const _exhaustive: never = graphic;
      throw new Error(`Unknown graphic type: ${(_exhaustive as any).type}`);
  }
}

/**
 * Render all graphics in a collection
 */
export function renderGraphics(
  graphics: GraphicElement[],
  context: GraphicsRenderContext
): (PPTLineElement | PPTShapeElement)[] {
  return graphics.flatMap((graphic) => {
    const result = renderGraphic(graphic, context);
    return Array.isArray(result) ? result : [result];
  });
}
