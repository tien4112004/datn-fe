/**
 * Enriched Schema Types for Content Editing
 *
 * This module defines types for enriching slide schemas with deterministic IDs,
 * enabling bidirectional tracing between PPT elements and source data.
 *
 * The enrichment process wraps text content values with unique IDs that persist
 * across template changes, allowing content edits to be tracked and applied.
 */

/**
 * Enriched value wrapper - pairs content with a deterministic ID
 *
 * @template T The type of value being wrapped (default: string)
 *
 * @example
 * { value: "Fast", id: "items-0" }
 * { value: "Features", id: "title" }
 */
export interface EnrichedValue<T = string> {
  /** Original content value */
  value: T;
  /** Deterministic ID for tracing element back to schema data */
  id: string;
}

/**
 * Type guard to check if a value is enriched
 *
 * @param val The value to check
 * @returns true if val is an EnrichedValue object
 *
 * @example
 * if (isEnriched(val)) {
 *   console.log(val.id, val.value);
 * }
 */
export function isEnriched<T = string>(val: unknown): val is EnrichedValue<T> {
  return (
    val !== null &&
    typeof val === 'object' &&
    'value' in val &&
    'id' in val &&
    typeof (val as any).id === 'string'
  );
}

/**
 * Unwraps an enriched value or returns plain value as-is
 *
 * Useful for backward compatibility when code needs to work with both
 * enriched and plain values.
 *
 * @param val Plain value or enriched value
 * @returns The underlying value
 *
 * @example
 * const content = unwrap(maybeEnriched); // Always gets the string
 */
export function unwrap<T = string>(val: T | EnrichedValue<T>): T {
  return isEnriched(val) ? (val.value as T) : (val as T);
}

/**
 * Gets the ID from an enriched value, or undefined for plain values
 *
 * @param val Plain value or enriched value
 * @returns The ID if enriched, undefined otherwise
 */
export function getId<T = string>(val: T | EnrichedValue<T>): string | undefined {
  return isEnriched(val) ? val.id : undefined;
}

// ============================================================================
// ENRICHED SCHEMA TYPE DEFINITIONS (one per layout type)
// ============================================================================

/**
 * Enriched Two Column with Image Layout Schema
 */
export interface EnrichedTwoColumnWithImageLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    image: string;
    items: Array<string | EnrichedValue<string>>;
    prompt?: string;
  };
}

/**
 * Enriched Main Image Layout Schema
 */
export interface EnrichedMainImageLayoutSchema {
  type: string;
  data: {
    image: string;
    content: string | EnrichedValue<string>;
    prompt?: string;
  };
}

/**
 * Enriched Title Layout Schema
 */
export interface EnrichedTitleLayoutSchema {
  type: string;
  data: {
    title: string | EnrichedValue<string>;
    subtitle?: string | EnrichedValue<string>;
  };
}

/**
 * Enriched Two Column Layout Schema
 */
export interface EnrichedTwoColumnLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    items1: Array<string | EnrichedValue<string>>;
    items2: Array<string | EnrichedValue<string>>;
  };
}

/**
 * Enriched List Layout Schema
 */
export interface EnrichedListLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    items: Array<string | EnrichedValue<string>>;
  };
}

/**
 * Enriched Labeled List Layout Schema
 */
export interface EnrichedLabeledListLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    items: Array<{
      label: string | EnrichedValue<string>;
      content: string | EnrichedValue<string>;
    }>;
  };
}

/**
 * Enriched Table of Contents Layout Schema
 */
export interface EnrichedTableOfContentsLayoutSchema {
  type: string;
  data: {
    items: Array<string | EnrichedValue<string>>;
  };
}

/**
 * Enriched Timeline Layout Schema
 */
export interface EnrichedTimelineLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    items: Array<{
      label: string | EnrichedValue<string>;
      content: string | EnrichedValue<string>;
    }>;
  };
}

/**
 * Enriched Pyramid Layout Schema
 */
export interface EnrichedPyramidLayoutSchema {
  type: string;
  title: string | EnrichedValue<string>;
  data: {
    items: Array<string | EnrichedValue<string>>;
  };
}

/**
 * Union type for all enriched schema types
 *
 * This is the type returned by enrichSchema() and used throughout
 * the content editing system.
 */
export type EnrichedSlideLayoutSchema =
  | EnrichedTwoColumnWithImageLayoutSchema
  | EnrichedMainImageLayoutSchema
  | EnrichedTitleLayoutSchema
  | EnrichedTwoColumnLayoutSchema
  | EnrichedListLayoutSchema
  | EnrichedLabeledListLayoutSchema
  | EnrichedTableOfContentsLayoutSchema
  | EnrichedTimelineLayoutSchema
  | EnrichedPyramidLayoutSchema;
