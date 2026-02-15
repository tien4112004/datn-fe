/**
 * Element Mapping Builder
 *
 * This module builds ElementMapping objects that trace PPT elements back to
 * their source schema data. These mappings enable the content editing workflow.
 *
 * The core insight: Elements are created in the same order as data,
 * so we can match by array index.
 *
 * Example:
 * Data: [{ value: 'A', id: 'items-0' }, { value: 'B', id: 'items-1' }]
 * Elements: [{ id: 'elem-uuid-1' }, { id: 'elem-uuid-2' }]
 *
 * Mappings:
 * - { elementId: 'elem-uuid-1', dataId: 'items-0' }
 * - { elementId: 'elem-uuid-2', dataId: 'items-1' }
 */

import type { PPTElement } from '@/types/slides';
import type { ElementMapping, EnrichedValue } from '@aiprimary/core/templates';
import { isEnriched } from '@aiprimary/core/templates';

/**
 * Extracts data ID directly from deterministic element ID
 *
 * Deterministic IDs follow pattern: elem-{dataId}
 * Decorative IDs: elem-deco-{dataId}
 * Auto-generated: elem-auto-{dataId}
 *
 * @param elementId PPT element ID (e.g., "elem-items-0")
 * @returns Data ID (e.g., "items-0") or null if not deterministic
 */
export function extractDataIdFromElementId(elementId: string): string | null {
  if (!elementId.startsWith('elem-')) {
    return null; // Legacy UUID format
  }

  const dataId = elementId.slice(5); // Remove "elem-" prefix

  // Don't extract from decorative or auto-generated IDs
  if (dataId.startsWith('deco-') || dataId.startsWith('auto-')) {
    return null;
  }

  return dataId;
}

/**
 * Builds element mappings by matching elements to enriched data by array index
 *
 * This function matches PPT elements to schema data based on the order they were created.
 * The conversion pipeline creates elements in the same order as the input data,
 * so we can rely on array index matching.
 *
 * @param elements Record of element arrays keyed by label (from buildLayoutWithUnifiedFontSizing)
 * @param labelData Record of enriched data arrays keyed by label
 * @param containerLabel The container these elements belong to (for debugging)
 * @returns Array of ElementMapping objects
 *
 * @example
 * const elements = {
 *   item: [
 *     { id: 'elem-1', type: 'text', ... },
 *     { id: 'elem-2', type: 'text', ... }
 *   ]
 * };
 *
 * const labelData = {
 *   item: [
 *     { value: 'Fast', id: 'items-0' },
 *     { value: 'Easy', id: 'items-1' }
 *   ]
 * };
 *
 * const mappings = buildElementMappings(elements, labelData, 'content');
 * // Result: [
 * //   { elementId: 'elem-1', dataId: 'items-0', containerLabel: 'content' },
 * //   { elementId: 'elem-2', dataId: 'items-1', containerLabel: 'content' }
 * // ]
 */
export function buildElementMappings(
  elements: Record<string, PPTElement[]>,
  labelData: Record<string, any[]>,
  containerLabel?: string
): ElementMapping[] {
  const mappings: ElementMapping[] = [];

  // Iterate through each label group
  for (const [label, dataArray] of Object.entries(labelData)) {
    const elementArray = elements[label] || [];

    // Extract data IDs from elements
    // With deterministic IDs, we can parse the element ID directly
    for (let i = 0; i < elementArray.length; i++) {
      const element = elementArray[i];
      const dataItem = dataArray[i];

      // Try to extract dataId from deterministic element ID
      const extractedDataId = extractDataIdFromElementId(element.id);

      if (extractedDataId) {
        // New-style deterministic element ID
        const mapping = {
          elementId: element.id,
          dataId: extractedDataId,
          containerLabel: containerLabel || label,
        };
        mappings.push(mapping);
      } else if (isEnriched(dataItem)) {
        // Fallback for legacy UUIDs: use enriched data item ID
        const mapping = {
          elementId: element.id,
          dataId: dataItem.id,
          containerLabel: containerLabel || label,
        };
        mappings.push(mapping);
      }
    }
  }

  return mappings;
}

/**
 * Builds a mapping for a single text element (title, subtitle, content, etc.)
 *
 * Used for text containers that create single elements (not arrays).
 *
 * @param element The PPT element
 * @param dataId The schema data ID
 * @param containerLabel The container name (for debugging)
 * @returns A single ElementMapping
 *
 * @example
 * const titleElement = { id: 'elem-uuid-123', type: 'text', ... };
 * const mapping = buildTextElementMapping(titleElement, 'title', 'title');
 * // Result: { elementId: 'elem-uuid-123', dataId: 'title', containerLabel: 'title' }
 */
export function buildTextElementMapping(
  element: PPTElement,
  dataId: string,
  containerLabel: string
): ElementMapping {
  return {
    elementId: element.id,
    dataId: dataId,
    containerLabel: containerLabel,
  };
}

/**
 * Builds mappings for combined text elements
 *
 * Combined text elements group multiple data items into a single PPT element.
 * We map to the first data item's ID (or create a synthetic ID if needed).
 *
 * Note: Editing combined elements requires special handling in future implementations.
 *
 * @param element The combined PPT element
 * @param dataIds Array of schema data IDs that contributed to this element
 * @param containerLabel The container name
 * @returns An ElementMapping pointing to the first data ID
 */
export function buildCombinedElementMapping(
  element: PPTElement,
  dataIds: string[],
  containerLabel: string
): ElementMapping {
  // Use first ID as primary (combined elements are typically edited as a whole)
  // In future, could use: `combined-${dataIds.join('-')}`
  const primaryDataId = dataIds.length > 0 ? dataIds[0] : 'combined-unknown';

  return {
    elementId: element.id,
    dataId: primaryDataId,
    containerLabel: containerLabel,
  };
}
