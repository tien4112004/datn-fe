/**
 * Content Editing Utilities
 *
 * This module provides functions for editing text content in enriched slides.
 *
 * Workflow:
 * 1. User edits an element in the preview
 * 2. Get the element ID from the UI
 * 3. Call editSlideContent(slide, elementId, newText)
 * 4. Returns updated enriched schema
 * 5. Call convertToSlide with updated schema to re-render
 * 6. New slide reflects content changes with reflowed layout
 */

import type { Slide } from '@/types/slides';
import type { EnrichedSlideLayoutSchema } from '@aiprimary/core/templates';
import { isEnriched } from '@aiprimary/core/templates';
import { selectTemplateById } from '@/utils/slideLayout';
import { parseListContentByPattern, extractFieldsFromItem } from './listContentParser';

/**
 * Extracts data ID directly from deterministic element ID
 *
 * Deterministic IDs follow pattern: elem-{dataId}
 * Example: elem-items-0 → items-0, elem-title → title
 *
 * Decorative and auto-generated IDs are marked non-editable.
 *
 * @param elementId PPT element ID (e.g., "elem-items-0")
 * @returns Data ID (e.g., "items-0") or null if not deterministic or not editable
 */
export function parseElementId(elementId: string): string | null {
  if (!elementId.startsWith('elem-')) {
    return null; // Legacy UUID format - fallback to mapping lookup
  }

  const dataId = elementId.slice(5); // Remove "elem-" prefix

  // Reject decorative and auto-generated elements (not editable)
  if (dataId.startsWith('deco-') || dataId.startsWith('auto-')) {
    return null;
  }

  return dataId;
}

/**
 * Parses compound element ID to extract constituent data IDs
 *
 * Compound IDs are used for combined list elements that merge multiple schema items.
 * They follow the pattern: elem-{firstId}+{lastId} and represent a range of IDs.
 *
 * Example: "elem-items-0-label+items-3-label" extracts the range from items-0-label to items-3-label,
 * returning all IDs in that range: ["items-0-label", "items-1-label", "items-2-label", "items-3-label"]
 *
 * @param elementId - Compound element ID like "elem-items-0+items-3"
 * @returns Array of data IDs in the range, or null if not a valid compound ID
 */
export function parseCompoundElementId(elementId: string): string[] | null {
  if (!elementId.startsWith('elem-')) return null;

  const dataId = elementId.slice(5); // Remove "elem-" prefix

  if (!dataId.includes('+')) return null; // Not compound

  const [firstId, lastId] = dataId.split('+');

  // Extract index range from formats like:
  // - "items-0" → prefix="items", index=0, suffix=""
  // - "items-0-label" → prefix="items", index=0, suffix="-label"
  const firstMatch = firstId.match(/^(.+?)-(\d+)(.*)$/);
  const lastMatch = lastId.match(/^(.+?)-(\d+)(.*)$/);

  if (!firstMatch || !lastMatch) return null;

  const [, prefix, firstIndexStr, suffix] = firstMatch;
  const [, , lastIndexStr] = lastMatch;

  const startIndex = parseInt(firstIndexStr);
  const endIndex = parseInt(lastIndexStr);

  // Generate all IDs in range
  const ids: string[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    ids.push(`${prefix}-${i}${suffix}`);
  }

  return ids;
}

/**
 * Resolves an element ID to the data ID it came from
 *
 * Two resolution strategies:
 * 1. Try direct parsing: elem-{dataId} format (new deterministic IDs) - O(1)
 * 2. Fallback to mapping lookup: slide.layout.elementMappings (legacy UUIDs) - O(n)
 *
 * The mappings are stored in slide.layout.elementMappings and created during
 * the initial conversion. They map:
 * PPT Element ID → Schema Data ID
 *
 * @param slide The slide containing element mappings
 * @param elementId The PPT element ID to resolve
 * @returns The schema data ID if found, null otherwise
 *
 * @example
 * // New-style deterministic ID
 * const dataId = resolveElementToDataId(slide, "elem-items-2");
 * // Returns: "items-2" (via direct parsing)
 *
 * // Legacy UUID
 * const dataId = resolveElementToDataId(slide, "abc-123-xyz-789");
 * // Returns: "items-2" (via mapping lookup)
 */
export function resolveElementToDataId(slide: Slide, elementId: string): string | null {
  console.log(`[ContentEditor] Resolving element ID: ${elementId}`);

  // Try direct parsing first (deterministic IDs, fast - O(1))
  const directDataId = parseElementId(elementId);
  if (directDataId) {
    console.log(`[ContentEditor] Found direct mapping: ${elementId} → ${directDataId}`);
    return directDataId;
  }

  // Fallback to mapping lookup (legacy UUIDs)
  console.log(`[ContentEditor] Element ID is not deterministic, using mapping lookup...`);

  const mappings = slide.layout?.elementMappings;
  if (!mappings) {
    console.warn('[ContentEditor] No element mappings found in slide');
    return null;
  }

  console.log(`[ContentEditor] Searching through ${mappings.length} mappings...`);

  const mapping = mappings.find((m) => m.elementId === elementId);
  if (!mapping) {
    console.warn(`[ContentEditor] No mapping found for element ${elementId}`);
    console.log('[ContentEditor] Available element IDs:', mappings.map((m) => m.elementId).join(', '));
    return null;
  }

  console.log(
    `[ContentEditor] Found mapping: ${elementId} → ${mapping.dataId} (container: ${mapping.containerLabel})`
  );
  return mapping.dataId;
}

/**
 * Updates content in an enriched schema by data ID
 *
 * This function recursively traverses the schema to find the enriched value
 * with the matching ID and updates its value field.
 *
 * The update is immutable - the original schema is not modified. A deep clone
 * is created and modified, then returned.
 *
 * @param schema The enriched slide schema
 * @param dataId The data ID to update (e.g., 'items-2', 'title')
 * @param newContent The new text content
 * @returns Updated enriched schema (original unchanged)
 *
 * @example
 * const schema = {
 *   type: 'LIST',
 *   title: { value: 'Old', id: 'title' },
 *   data: { items: [{ value: 'A', id: 'items-0' }] }
 * };
 *
 * const updated = updateSchemaContent(schema, 'items-0', 'New');
 * // schema.data.items[0].value === 'A' (original unchanged)
 * // updated.data.items[0].value === 'New' (updated)
 */
export function updateSchemaContent(
  schema: EnrichedSlideLayoutSchema,
  dataId: string,
  newContent: string
): EnrichedSlideLayoutSchema {
  console.log(`[ContentEditor] Updating schema content for dataId: "${dataId}"`);
  console.log(`[ContentEditor] New content: "${newContent}"`);

  // Deep clone to avoid mutating original
  const updated = JSON.parse(JSON.stringify(schema));

  // Recursive helper to find and update enriched value by ID
  const updateRecursive = (obj: any): boolean => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    // Check if this is an enriched value with matching ID
    if (isEnriched(obj) && obj.id === dataId) {
      const oldValue = obj.value;
      obj.value = newContent;
      console.log(`[ContentEditor] Successfully updated "${dataId}": "${oldValue}" → "${newContent}"`);
      return true;
    }

    // Recursively search through arrays
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (updateRecursive(item)) {
          return true;
        }
      }
    } else {
      // Recursively search through object properties
      for (const key of Object.keys(obj)) {
        const value = obj[key];

        if (Array.isArray(value)) {
          for (const item of value) {
            if (updateRecursive(item)) {
              return true;
            }
          }
        } else if (typeof value === 'object') {
          if (updateRecursive(value)) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Perform the update
  const found = updateRecursive(updated);
  if (!found) {
    console.error(`[ContentEditor] Data ID "${dataId}" not found in schema!`);
  }

  return updated;
}

/**
 * High-level function to edit slide content based on element selection
 *
 * This is the main entry point for the content editing workflow. It:
 * 1. Resolves the element ID to a data ID using mappings
 * 2. Updates the schema at that data ID
 * 3. Returns the updated schema for re-conversion
 *
 * If any step fails (missing mappings, invalid element ID), returns null
 * and logs a warning.
 *
 * @param slide The slide being edited
 * @param elementId The PPT element ID that was edited
 * @param newContent The new text content
 * @returns Updated enriched schema, or null if edit failed
 *
 * @example
 * // User clicks element and enters new text
 * const updatedSchema = editSlideContent(slide, "elem-uuid-123", "New text");
 *
 * if (updatedSchema) {
 *   // Re-render with updated schema
 *   const newSlide = await convertToSlide(
 *     updatedSchema,
 *     viewport,
 *     theme,
 *     template,
 *     slide.id
 *   );
 *   updateSlide(newSlide);
 * }
 */
export function editSlideContent(
  slide: Slide,
  elementId: string,
  newContent: string
): EnrichedSlideLayoutSchema | null {
  console.log(`\n========== [ContentEditor] EDIT SLIDE CONTENT ==========`);
  console.log(`Element ID: ${elementId}`);
  console.log(`New content: "${newContent}"`);

  // Step 1: Resolve element ID to data ID
  const dataId = resolveElementToDataId(slide, elementId);
  if (!dataId) {
    console.error(`[ContentEditor] ✗ Failed to resolve element ${elementId} to data ID`);
    return null;
  }

  // Step 2: Get current schema
  const currentSchema = slide.layout?.schema;
  if (!currentSchema) {
    console.error('[ContentEditor] ✗ No schema found in slide.layout');
    return null;
  }

  console.log(`[ContentEditor] Current schema layout type: ${currentSchema.type}`);

  // Step 3: Update schema
  const updatedSchema = updateSchemaContent(currentSchema, dataId, newContent);

  console.log(`[ContentEditor] ✓ Schema update complete`);
  console.log(`========== [ContentEditor] Edit complete ==========\n`);

  return updatedSchema;
}

/**
 * Retrieves the combined list pattern for an element
 *
 * The pattern is stored in the template configuration at:
 * template.containers[containerLabel].combined.pattern
 *
 * @param slide - Slide containing the element
 * @param elementId - Combined list element ID
 * @returns Pattern string like "{label}: {content}", or null if not found
 */
async function getPatternForElement(slide: Slide, elementId: string): Promise<string | null> {
  // Get container label from mappings
  const mapping = slide.layout?.elementMappings?.find((m) => m.elementId === elementId);
  if (!mapping?.containerLabel) {
    console.warn('[ContentEditor] No mapping found for element:', elementId);
    return null;
  }

  // Get template
  if (!slide.layout?.layoutType || !slide.layout?.templateId) {
    console.warn('[ContentEditor] Missing layout metadata');
    return null;
  }

  try {
    const template = await selectTemplateById(slide.layout.layoutType, slide.layout.templateId);

    // Access pattern from template
    const container = template.containers[mapping.containerLabel];
    const pattern = container && 'combined' in container && (container as any).combined?.pattern;

    if (!pattern) {
      console.warn('[ContentEditor] No pattern found in container:', mapping.containerLabel);
    }

    return pattern || null;
  } catch (error) {
    console.error('[ContentEditor] Error retrieving template:', error);
    return null;
  }
}

/**
 * Edits combined list content by parsing and updating multiple schema items
 *
 * For combined list elements with compound IDs like "elem-items-0+items-3",
 * this function:
 * 1. Parses the compound ID to get all constituent data IDs
 * 2. Retrieves the pattern from the template
 * 3. Parses the edited HTML into individual items
 * 4. Updates each schema item with its corresponding content
 *
 * @param slide - Slide containing the combined list
 * @param elementId - Compound element ID (e.g., "elem-items-0+items-3")
 * @param newContent - Edited HTML content from user
 * @returns Updated schema, or null on error
 */
export async function editCombinedListContent(
  slide: Slide,
  elementId: string,
  newContent: string
): Promise<EnrichedSlideLayoutSchema | null> {
  console.log('\n========== [ContentEditor] EDIT COMBINED LIST ==========');
  console.log(`Element ID: ${elementId}`);
  console.log(`New content preview: ${newContent.substring(0, 100)}`);

  // Step 1: Parse compound ID
  const dataIds = parseCompoundElementId(elementId);
  if (!dataIds || dataIds.length === 0) {
    console.error('[ContentEditor] ✗ Failed to parse compound ID');
    return null;
  }

  console.log(`[ContentEditor] Parsed ${dataIds.length} data IDs:`, dataIds);

  // Step 2: Get pattern
  const pattern = await getPatternForElement(slide, elementId);
  if (!pattern) {
    console.warn('[ContentEditor] ⚠ No pattern found, falling back to primary item update');
    // Fallback: update only the first item
    return updateSchemaContent(slide.layout!.schema, dataIds[0], newContent);
  }

  console.log(`[ContentEditor] Pattern: "${pattern}"`);

  // Step 3: Parse content into items
  const parsedItems = parseListContentByPattern(newContent, pattern, dataIds.length);
  console.log(`[ContentEditor] Parsed ${parsedItems.length} items from content`);

  if (parsedItems.length < dataIds.length) {
    console.warn(`[ContentEditor] ⚠ Fewer items than expected (${parsedItems.length} < ${dataIds.length})`);
    console.warn('[ContentEditor] Remaining schema items will be unchanged');
  }

  if (parsedItems.length > dataIds.length) {
    console.warn(
      `[ContentEditor] ⚠ Extra items detected (${parsedItems.length} > ${dataIds.length}), ignoring overflow`
    );
  }

  // Step 4: Update schema for each item
  let updatedSchema = slide.layout!.schema;
  const itemsToUpdate = Math.min(parsedItems.length, dataIds.length);

  for (let i = 0; i < itemsToUpdate; i++) {
    const itemContent = parsedItems[i];
    const dataId = dataIds[i];

    // MVP: Update full content
    // Future: Extract fields from pattern and update individually
    const processedContent = extractFieldsFromItem(itemContent, pattern);

    console.log(`[ContentEditor] Updating item ${i}: ${dataId} → ${processedContent.substring(0, 50)}...`);

    updatedSchema = updateSchemaContent(updatedSchema, dataId, processedContent);
  }

  console.log(`[ContentEditor] ✓ Combined list update complete`);
  console.log('========== [ContentEditor] Edit complete ==========\n');

  return updatedSchema;
}

/**
 * Validates that element mappings exist for a slide
 *
 * Useful for checking if a slide is ready for editing before attempting edits.
 *
 * @param slide The slide to check
 * @returns true if mappings exist, false otherwise
 */
export function hasMappings(slide: Slide): boolean {
  return (slide.layout?.elementMappings ?? []).length > 0;
}

/**
 * Gets all element IDs for a specific data ID
 *
 * Useful for finding all elements that come from the same data (e.g., for bulk operations).
 *
 * @param slide The slide to search
 * @param dataId The data ID to find elements for
 * @returns Array of element IDs
 *
 * @example
 * const elementIds = getElementsForDataId(slide, 'items-0');
 * // Returns: ['elem-uuid-1', 'elem-uuid-2'] if multiple elements share this data
 */
export function getElementsForDataId(slide: Slide, dataId: string): string[] {
  const mappings = slide.layout?.elementMappings ?? [];
  return mappings.filter((m) => m.dataId === dataId).map((m) => m.elementId);
}

/**
 * Gets all mappings for a specific container
 *
 * Useful for bulk operations on all items in a container (e.g., content block).
 *
 * @param slide The slide to search
 * @param containerLabel The container label to find mappings for
 * @returns Array of element mappings
 *
 * @example
 * const contentMappings = getMappingsForContainer(slide, 'content');
 * // Returns: mappings for all elements in the 'content' container
 */
export function getMappingsForContainer(
  slide: Slide,
  containerLabel: string
): Array<{ elementId: string; dataId: string; containerLabel?: string }> {
  const mappings = slide.layout?.elementMappings ?? [];
  return mappings.filter((m) => m.containerLabel === containerLabel);
}
