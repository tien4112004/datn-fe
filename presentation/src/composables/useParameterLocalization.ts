import { useI18n } from 'vue-i18n';
import type { TemplateParameter } from '@aiprimary/core/templates';

export function useParameterLocalization() {
  const { t, te } = useI18n();

  /**
   * Get localized parameter label with fallback to hardcoded value
   * Tries: template.param.${paramKey}.label
   * Falls back to: param.label
   */
  const getParameterLabel = (param: TemplateParameter): string => {
    const translationKey = `template.param.${param.key}.label`;

    // Check if translation exists (te = translation exists)
    if (te(translationKey)) {
      return t(translationKey);
    }

    // Fall back to hardcoded label
    return param.label;
  };

  /**
   * Get localized parameter description with fallback to hardcoded value
   * Tries: template.param.${paramKey}.description
   * Falls back to: param.description || ''
   */
  const getParameterDescription = (param: TemplateParameter): string => {
    const translationKey = `template.param.${param.key}.description`;

    if (te(translationKey)) {
      return t(translationKey);
    }

    return param.description || '';
  };

  /**
   * Format parameter value for display
   * Extracts unit from label (e.g., "Side Padding (px)" → "20px")
   */
  const formatValue = (param: TemplateParameter, value: number | boolean): string => {
    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    const label = getParameterLabel(param);

    // Try to extract unit from label
    const unitMatch = label.match(/\(([^)]+)\)$/);
    if (unitMatch) {
      const unit = unitMatch[1];

      // Handle percentage units (convert 0.x to x%)
      if (unit === '%') {
        return `${(value * 100).toFixed(0)}%`;
      }

      return `${value}${unit}`;
    }

    // No unit found, return raw value
    return value.toString();
  };

  return {
    getParameterLabel,
    getParameterDescription,
    formatValue,
  };
}
