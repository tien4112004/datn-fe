/**
 * Element Mapping Types for Content Editing
 *
 * This module defines types for mapping PPT elements back to their source
 * data in enriched schemas, enabling content editing workflows.
 *
 * Each ElementMapping creates a link:
 * PPT Element ID → Schema Data ID
 *
 * This allows the system to:
 * 1. Find which schema field generated a UI element
 * 2. Update that schema field based on user edits
 * 3. Re-render the slide with updated content
 */

/**
 * Maps a single PPT element to its source schema data
 *
 * @example
 * {
 *   elementId: "abc-123-uuid",     // PPT element's UUID
 *   dataId: "items-2",              // Enriched schema data ID
 *   containerLabel: "content"      // Container it came from
 * }
 *
 * Used in element editing workflows:
 * 1. User clicks element "abc-123-uuid"
 * 2. Find mapping with elementId "abc-123-uuid"
 * 3. Get dataId "items-2"
 * 4. Update enrichedSchema at dataId
 * 5. Re-run convertToSlide
 */
export interface ElementMapping {
  /**
   * The PPT element's unique identifier (UUID)
   * Corresponds to PPTElement.id
   */
  elementId: string;

  /**
   * The schema data's unique identifier
   * Corresponds to EnrichedValue.id in the schema
   *
   * Format examples: "title", "items-0", "items-2-label", "items1-3"
   */
  dataId: string;

  /**
   * Container label for debugging and validation
   * Helps identify which container (title, content, label, etc.) this mapping belongs to
   *
   * Optional but recommended for debugging.
   */
  containerLabel?: string;
}

/**
 * Complete set of element mappings for a slide
 *
 * This is typically stored in slide.layout.elementMappings after
 * conversion and is rebuilt when templates change.
 */
export interface SlideElementMappings {
  /** Slide ID that these mappings belong to */
  slideId: string;

  /** Array of all element-to-data mappings for this slide */
  mappings: ElementMapping[];
}
