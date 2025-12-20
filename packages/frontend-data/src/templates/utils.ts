import type { SlideTemplate } from '@aiprimary/core';

/**
 * Build slide templates from variations
 * Takes template variations grouped by layout type and returns them in the same structure
 *
 * @param variations - Template variations grouped by layout type
 * @returns Record of layout type to template arrays
 */
export function buildSlideTemplatesFromVariations(
  variations: Record<string, SlideTemplate[]>
): Record<string, SlideTemplate[]> {
  return variations;
}
