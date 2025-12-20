import type { TemplateParameter, ExpressionConstants } from '@aiprimary/core/templates';

/**
 * Resolves template parameters by merging defaults with user overrides
 */
export function resolveTemplateParameters(
  parameters: TemplateParameter[] | undefined,
  userOverrides?: Record<string, number>
): Record<string, number> {
  if (!parameters || parameters.length === 0) {
    return {};
  }

  const resolved: Record<string, number> = {};

  for (const param of parameters) {
    // Use user override if provided, otherwise use default
    const value = userOverrides?.[param.key] ?? param.defaultValue;

    // Apply min/max constraints if specified
    let constrainedValue = value;
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
  userOverrides?: Record<string, number>
): ExpressionConstants {
  const parameterValues = resolveTemplateParameters(parameters, userOverrides);

  return {
    ...baseConstants,
    ...parameterValues,
  };
}
