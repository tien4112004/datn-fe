import type {
  ExpressionValue,
  DimensionExpression,
  PositionExpression,
  BoundsExpression,
  ExpressionContext,
  ResolvedBounds,
  ExpressionConstants,
} from './types';

const DEFAULT_CONSTANTS: ExpressionConstants = {
  SLIDE_WIDTH: 1000,
  SLIDE_HEIGHT: 562.5,
};

/**
 * Evaluates an arithmetic expression string with context
 */
function evaluateArithmetic(expr: string, context: ExpressionContext): number {
  // Replace constants
  let evaluatedExpr = expr;
  for (const [key, value] of Object.entries(context.constants)) {
    evaluatedExpr = evaluatedExpr.replace(new RegExp(key, 'g'), String(value));
  }

  // Replace container references (e.g., "image.width", "content.height")
  evaluatedExpr = evaluatedExpr.replace(/(\w+)\.(width|height|left|top)/g, (match, containerId, prop) => {
    const container = context.containers[containerId];
    if (!container) {
      throw new Error(`Container "${containerId}" not found in context`);
    }
    return String(container[prop as keyof ResolvedBounds]);
  });

  try {
    // eslint-disable-next-line no-eval
    return eval(evaluatedExpr);
  } catch (error) {
    throw new Error(`Failed to evaluate expression "${expr}": ${error}`);
  }
}

/**
 * Resolves an expression value to a number
 */
function resolveExpressionValue(value: ExpressionValue, context: ExpressionContext): number {
  if (typeof value === 'number') {
    return value;
  }

  // Handle keyword expressions in context
  if (value === 'center' || value === 'start' || value === 'end' || value === 'fill') {
    throw new Error(`Keyword "${value}" must be resolved in position/dimension context`);
  }

  // Assume it's an arithmetic expression
  return evaluateArithmetic(value, context);
}

/**
 * Resolves a dimension expression (width/height)
 */
function resolveDimension(
  dimension: number | DimensionExpression | undefined,
  context: ExpressionContext,
  parentSize?: number
): number {
  if (dimension === undefined) {
    throw new Error('Dimension is required');
  }

  if (typeof dimension === 'number') {
    return dimension;
  }

  // Handle fill keyword
  if (dimension.expr === 'fill') {
    if (!parentSize) {
      throw new Error('Cannot use "fill" without parent size context');
    }
    return parentSize;
  }

  // Evaluate expression
  let value = resolveExpressionValue(dimension.expr, context);

  // Apply constraints
  if (dimension.min !== undefined) {
    const minValue = resolveExpressionValue(dimension.min, context);
    value = Math.max(value, minValue);
  }

  if (dimension.max !== undefined) {
    const maxValue = resolveExpressionValue(dimension.max, context);
    value = Math.min(value, maxValue);
  }

  return value;
}

/**
 * Resolves a position expression (left/top)
 */
function resolvePosition(
  position: number | PositionExpression | undefined,
  context: ExpressionContext,
  axis: 'horizontal' | 'vertical',
  containerSize: number,
  parentSize?: number
): number {
  if (position === undefined) {
    return 0; // Default to 0
  }

  if (typeof position === 'number') {
    return position;
  }

  const { expr, relativeTo, offset = 0 } = position;

  let baseValue = 0;

  // Handle keyword expressions
  if (expr === 'center') {
    const parent = parentSize ?? context.constants[axis === 'horizontal' ? 'SLIDE_WIDTH' : 'SLIDE_HEIGHT'];
    baseValue = (parent - containerSize) / 2;
  } else if (expr === 'start') {
    baseValue = 0;
  } else if (expr === 'end') {
    const parent = parentSize ?? context.constants[axis === 'horizontal' ? 'SLIDE_WIDTH' : 'SLIDE_HEIGHT'];
    baseValue = parent - containerSize;
  } else if (expr === 'after') {
    if (!relativeTo) {
      throw new Error('"after" keyword requires relativeTo');
    }
    const relativeContainer = context.containers[relativeTo];
    if (!relativeContainer) {
      throw new Error(`Container "${relativeTo}" not found for "after" positioning`);
    }
    baseValue =
      relativeContainer[axis === 'horizontal' ? 'left' : 'top'] +
      relativeContainer[axis === 'horizontal' ? 'width' : 'height'];
  } else if (expr === 'before') {
    if (!relativeTo) {
      throw new Error('"before" keyword requires relativeTo');
    }
    const relativeContainer = context.containers[relativeTo];
    if (!relativeContainer) {
      throw new Error(`Container "${relativeTo}" not found for "before" positioning`);
    }
    baseValue = relativeContainer[axis === 'horizontal' ? 'left' : 'top'] - containerSize;
  } else {
    // Arithmetic expression
    baseValue = resolveExpressionValue(expr, context);
  }

  return baseValue + offset;
}

/**
 * Checks if bounds contain expressions
 */
export function isExpressionBounds(bounds: any): boolean {
  if (!bounds) return false;

  const hasExpression = (val: any): boolean => {
    if (!val) return false;
    if (typeof val === 'object' && 'expr' in val) return true;
    return false;
  };

  return (
    hasExpression(bounds.left) ||
    hasExpression(bounds.top) ||
    hasExpression(bounds.width) ||
    hasExpression(bounds.height)
  );
}

/**
 * Resolves bounds expression to concrete bounds
 */
export function resolveBounds(
  bounds: BoundsExpression,
  context: ExpressionContext,
  parentBounds?: ResolvedBounds
): ResolvedBounds {
  // First resolve dimensions (they might be needed for position calculations)
  const width = resolveDimension(bounds.width, context, parentBounds?.width);
  const height = resolveDimension(bounds.height, context, parentBounds?.height);

  // Then resolve positions (using resolved dimensions)
  const left = resolvePosition(bounds.left, context, 'horizontal', width, parentBounds?.width);
  const top = resolvePosition(bounds.top, context, 'vertical', height, parentBounds?.height);

  return { left, top, width, height };
}

/**
 * Topological sort to resolve dependencies
 */
function topologicalSort(
  containers: Record<string, { bounds?: BoundsExpression | ResolvedBounds }>,
  getDependencies: (id: string) => string[]
): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(id: string) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`Circular dependency detected for container "${id}"`);
    }

    visiting.add(id);

    const deps = getDependencies(id);
    for (const dep of deps) {
      visit(dep);
    }

    visiting.delete(id);
    visited.add(id);
    sorted.push(id);
  }

  for (const id of Object.keys(containers)) {
    visit(id);
  }

  return sorted;
}

/**
 * Extract dependencies from a bounds expression
 */
function extractDependencies(bounds: BoundsExpression | undefined): string[] {
  if (!bounds) return [];

  const deps = new Set<string>();

  function checkPositionExpr(pos: any) {
    if (pos && typeof pos === 'object' && 'relativeTo' in pos && pos.relativeTo) {
      deps.add(pos.relativeTo);
    }
    if (pos && typeof pos === 'object' && 'expr' in pos && typeof pos.expr === 'string') {
      // Extract container references from expressions like "image.width"
      const matches = pos.expr.matchAll(/(\w+)\.(width|height|left|top)/g);
      for (const match of matches) {
        deps.add(match[1]);
      }
    }
  }

  function checkDimensionExpr(dim: any) {
    if (dim && typeof dim === 'object') {
      if ('expr' in dim && typeof dim.expr === 'string') {
        const matches = dim.expr.matchAll(/(\w+)\.(width|height|left|top)/g);
        for (const match of matches) {
          deps.add(match[1]);
        }
      }
      if ('min' in dim && typeof dim.min === 'string') {
        const matches = dim.min.matchAll(/(\w+)\.(width|height|left|top)/g);
        for (const match of matches) {
          deps.add(match[1]);
        }
      }
      if ('max' in dim && typeof dim.max === 'string') {
        const matches = dim.max.matchAll(/(\w+)\.(width|height|left|top)/g);
        for (const match of matches) {
          deps.add(match[1]);
        }
      }
    }
  }

  checkPositionExpr(bounds.left);
  checkPositionExpr(bounds.top);
  checkDimensionExpr(bounds.width);
  checkDimensionExpr(bounds.height);

  return Array.from(deps);
}

/**
 * Resolves all container bounds in a template, handling dependencies
 */
export function resolveTemplateBounds(
  containers: Record<string, { bounds?: BoundsExpression | ResolvedBounds; [key: string]: any }>,
  constants: ExpressionConstants = DEFAULT_CONSTANTS
): Record<string, ResolvedBounds> {
  const resolvedContainers: Record<string, ResolvedBounds> = {};

  // Identify which containers need resolution
  const needsResolution: Record<string, BoundsExpression> = {};
  const alreadyResolved: Record<string, ResolvedBounds> = {};

  for (const [id, container] of Object.entries(containers)) {
    if (!container.bounds) continue;

    if (isExpressionBounds(container.bounds)) {
      needsResolution[id] = container.bounds as BoundsExpression;
    } else {
      alreadyResolved[id] = container.bounds as ResolvedBounds;
    }
  }

  // Start with already resolved containers
  Object.assign(resolvedContainers, alreadyResolved);

  // Sort containers by dependencies
  const sortedIds = topologicalSort(
    Object.fromEntries(Object.keys(needsResolution).map((id) => [id, { bounds: needsResolution[id] }])),
    (id) => extractDependencies(needsResolution[id])
  );

  // Resolve in dependency order
  for (const id of sortedIds) {
    const boundsExpr = needsResolution[id];
    const context: ExpressionContext = {
      constants,
      containers: resolvedContainers,
      currentContainer: id,
    };

    resolvedContainers[id] = resolveBounds(boundsExpr, context);
  }

  return resolvedContainers;
}
