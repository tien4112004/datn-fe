/**
 * Graphics Renderer - Converts graphic definitions to PPT elements
 */

import type { PPTLineElement, PPTShapeElement, SlideTheme } from '@/types/slides';
import type { GraphicElement, TitleLine, ContentSeparator, CornerDecoration } from './types';
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
}

/**
 * Resolve percentage or absolute value to pixels
 */
function resolveValue(value: number | string, reference: number): number {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentage = parseFloat(value);
    return (percentage / 100) * reference;
  }
  return typeof value === 'number' ? value : parseFloat(value);
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
 * Main render function - converts GraphicElement to PPT elements
 */
export function renderGraphic(
  graphic: GraphicElement,
  context: GraphicsRenderContext
): PPTLineElement | PPTShapeElement {
  switch (graphic.type) {
    case 'titleLine':
      return renderTitleLine(graphic, context);
    case 'contentSeparator':
      return renderContentSeparator(graphic, context);
    case 'cornerDecoration':
      return renderCornerDecoration(graphic, context);
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
  return graphics.map((graphic) => renderGraphic(graphic, context));
}
