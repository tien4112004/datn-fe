import type { TemplateParameter, ExpressionConstants } from '@aiprimary/core/templates';

/**
 * Resolves template parameters by merging defaults with user overrides
 * Supports both number and boolean parameter types
 */
export function resolveTemplateParameters(
  parameters: TemplateParameter[] | undefined,
  userOverrides?: Record<string, number | boolean>
): Record<string, number | boolean> {
  if (!parameters || parameters.length === 0) {
    return {};
  }

  const resolved: Record<string, number | boolean> = {};

  for (const param of parameters) {
    // Use user override if provided, otherwise use default
    const value = userOverrides?.[param.key] ?? param.defaultValue;

    // Handle boolean parameters
    if (param.type === 'boolean') {
      resolved[param.key] = Boolean(value);
      continue;
    }

    // Handle number parameters with min/max constraints
    let constrainedValue = Number(value);
    if (param.min !== undefined) {
      constrainedValue = Math.max(param.min, constrainedValue);
    }
    if (param.max !== undefined) {
      constrainedValue = Math.min(param.max, constrainedValue);
    }

    resolved[param.key] = constrainedValue;
  }

  return resolved;
}

/**
 * Merges template parameters into expression constants
 */
export function mergeParametersIntoConstants(
  baseConstants: ExpressionConstants,
  parameters: TemplateParameter[] | undefined,
  userOverrides?: Record<string, number | boolean>
): ExpressionConstants {
  const parameterValues = resolveTemplateParameters(parameters, userOverrides);

  return {
    ...baseConstants,
    ...parameterValues,
  };
}
