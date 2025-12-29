import { resolveTemplateBounds } from './expressionResolver';
import type {
  Bounds,
  RelativePositioning,
  BoundsExpression,
  TemplateParameter,
} from '@aiprimary/core/templates';
import { mergeParametersIntoConstants } from './parameterResolver';
import type { SlideViewport } from '@aiprimary/core';

/**
 * Resolve all container positions and return containers with absolute bounds
 */
export function resolveTemplateContainers<T extends Record<string, any>>(
  containers: T,
  viewport: SlideViewport,
  parameters?: TemplateParameter[],
  parameterOverrides?: Record<string, number | boolean>
): Record<keyof T, T[keyof T] & { bounds: Bounds }> {
  // Resolve all bounds (expressions + relative positioning)
  const resolvedBounds = resolveContainerPositions(containers, viewport, parameters, parameterOverrides);

  const resolvedContainers: Record<keyof T, T[keyof T] & { bounds: Bounds }> = {} as any;
  for (const id in containers) {
    resolvedContainers[id] = {
      ...containers[id],
      bounds: resolvedBounds[id],
    };
  }

  return resolvedContainers;
}

/**
 * Calculate bounds from relative positioning
 */
export function calculateBoundsFromPositioning(
  positioning: RelativePositioning,
  parentBounds: Bounds,
  viewport: SlideViewport
): Bounds {
  // Start with parent bounds (non-positioned axis inherits from parent)
  let left = parentBounds.left;
  let top = parentBounds.top;
  let width = parentBounds.width;
  let height = parentBounds.height;

  const anchor = positioning.anchor || 'start';
  const offset = positioning.offset || 0;
  const size = positioning.size;
  const margin = positioning.margin || {};

  if (positioning.axis === 'horizontal') {
    // === HORIZONTAL POSITIONING (modify left and width only) ===

    // Calculate starting position based on anchor
    if (anchor === 'start') {
      // Anchor to left edge of parent
      left = parentBounds.left + offset + (margin.left || 0);
    } else if (anchor === 'end') {
      // Anchor to right edge of parent
      left = parentBounds.left + parentBounds.width + offset + (margin.left || 0);
    } else if (anchor === 'center') {
      // Anchor to center of parent
      left = parentBounds.left + parentBounds.width / 2 + offset + (margin.left || 0);
    }

    // Calculate width based on size
    if (size === 'fill') {
      // Fill remaining width to viewport right edge, accounting for right margin
      width = viewport.width - left - (margin.right || 0);
    } else if (typeof size === 'number') {
      // Explicit width
      width = size;
    }
    // else: keep parent width

    // Top and height are inherited from parent, but apply vertical margins
    top = parentBounds.top + (margin.top || 0);
    height = parentBounds.height - (margin.top || 0) - (margin.bottom || 0);
  } else {
    // === VERTICAL POSITIONING (modify top and height only) ===

    // Calculate starting position based on anchor
    if (anchor === 'start') {
      // Anchor to top edge of parent
      top = parentBounds.top + offset + (margin.top || 0);
    } else if (anchor === 'end') {
      // Anchor to bottom edge of parent
      top = parentBounds.top + parentBounds.height + offset + (margin.top || 0);
    } else if (anchor === 'center') {
      // Anchor to center of parent
      top = parentBounds.top + parentBounds.height / 2 + offset + (margin.top || 0);
    }

    // Calculate height based on size
    if (size === 'fill') {
      // Fill remaining height to viewport bottom edge, accounting for bottom margin
      height = viewport.height - top - (margin.bottom || 0);
    } else if (typeof size === 'number') {
      // Explicit height
      height = size;
    }
    // else: keep parent height

    // Left and width are inherited from parent, but apply horizontal margins
    left = parentBounds.left + (margin.left || 0);
    width = parentBounds.width - (margin.left || 0) - (margin.right || 0);
  }

  return { left, top, width, height };
}

/**
 * Resolve container positions with priority:
 * 1. If bounds exists, use it (absolute positioning)
 * 2. Otherwise use positioning (relative positioning)
 */
export function resolveContainerPositions(
  containers: Record<string, { bounds?: Bounds | BoundsExpression; positioning?: RelativePositioning }>,
  viewport: SlideViewport,
  parameters?: TemplateParameter[],
  parameterOverrides?: Record<string, number | boolean>
): Record<string, Bounds> {
  // STEP 1: Resolve expression-based bounds first
  // Merge template parameters into constants for expression evaluation
  const baseConstants = {
    SLIDE_WIDTH: viewport.width,
    SLIDE_HEIGHT: viewport.height,
  };

  const constants = mergeParametersIntoConstants(baseConstants, parameters, parameterOverrides);
  const resolvedExpressionBounds = resolveTemplateBounds(containers, constants);

  // STEP 2: Create containers with resolved expression bounds
  const containersWithResolvedExpressions: Record<
    string,
    { bounds?: Bounds; positioning?: RelativePositioning }
  > = {};
  for (const [id, container] of Object.entries(containers)) {
    containersWithResolvedExpressions[id] = {
      ...container,
      bounds: resolvedExpressionBounds[id] || (container.bounds as Bounds),
    };
  }

  // STEP 3: Process remaining relative positioning
  const resolved: Record<string, Bounds> = {};
  const pending = new Set(Object.keys(containersWithResolvedExpressions));

  while (pending.size > 0) {
    let madeProgress = false;

    for (const id of pending) {
      const container = containersWithResolvedExpressions[id];

      // PRIORITY 1: Use absolute bounds if specified
      if (container.bounds) {
        resolved[id] = container.bounds;
        pending.delete(id);
        madeProgress = true;
        continue;
      }

      // PRIORITY 2: Use relative positioning
      if (container.positioning) {
        const pos = container.positioning;
        const parentId = pos.relativeTo;

        // No parent = relative to viewport
        if (!parentId) {
          resolved[id] = calculateBoundsFromPositioning(
            pos,
            { left: 0, top: 0, width: viewport.width, height: viewport.height },
            viewport
          );
          pending.delete(id);
          madeProgress = true;
          continue;
        }

        // Parent is resolved - calculate relative position
        if (resolved[parentId]) {
          resolved[id] = calculateBoundsFromPositioning(pos, resolved[parentId], viewport);
          pending.delete(id);
          madeProgress = true;
        }
      } else {
        // Neither bounds nor positioning specified
        throw new Error(`Container '${id}' must have either bounds or positioning`);
      }
    }

    if (!madeProgress) {
      throw new Error('Circular dependency in container positioning');
    }
  }

  return resolved;
}
