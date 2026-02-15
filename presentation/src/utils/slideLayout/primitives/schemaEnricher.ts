/**
 * Schema Enrichment Logic
 *
 * This module handles enriching slide schemas with deterministic IDs for content editing.
 *
 * The enrichment process:
 * 1. Takes a plain SlideLayoutSchema (from AI generation or user input)
 * 2. Wraps all text content with EnrichedValue objects (value + ID)
 * 3. Generates deterministic IDs based on field names and positions
 * 4. Returns an EnrichedSlideLayoutSchema ready for conversion
 *
 * The enrichment is IDEMPOTENT - calling it multiple times on already-enriched
 * schemas returns the same result, making it safe to call multiple times.
 */

import type { SlideLayoutSchema } from '../types';
import type { EnrichedSlideLayoutSchema, EnrichedValue } from '@aiprimary/core/templates';
import { isEnriched } from '@aiprimary/core/templates';
import { SLIDE_LAYOUT_TYPE } from '../types';

/**
 * Wraps a value with an ID if it's not already enriched
 *
 * This is the core enrichment operation. It creates an EnrichedValue object
 * pairing the content with a unique ID.
 *
 * @param value The value to potentially enrich
 * @param id The ID to assign (if not already enriched)
 * @returns Enriched value object
 *
 * @example
 * enrichValue("Fast", "items-0") → { value: "Fast", id: "items-0" }
 * enrichValue({ value: "Fast", id: "items-0" }, "items-0") → (unchanged)
 */
function enrichValue<T>(value: T | EnrichedValue<T>, id: string): EnrichedValue<T> {
  // Already enriched - return as-is (idempotency)
  if (typeof value === 'object' && value !== null && 'value' in value && 'id' in value) {
    return value as EnrichedValue<T>;
  }
  // Plain value - wrap it with ID
  return { value: value as T, id };
}

/**
 * Enriches an array of values with deterministic IDs
 *
 * Each element gets an ID based on the prefix and its array index.
 * E.g., ["Fast", "Easy"] with prefix "items" becomes:
 *   - { value: "Fast", id: "items-0" }
 *   - { value: "Easy", id: "items-1" }
 *
 * @param arr Array of values to enrich
 * @param prefix ID prefix (e.g., "items", "items1")
 * @returns Array of enriched values
 */
function enrichArray<T>(arr: Array<T | EnrichedValue<T>>, prefix: string): Array<EnrichedValue<T>> {
  return arr.map((item, index) => enrichValue(item, `${prefix}-${index}`));
}

/**
 * Main enrichment function - adds deterministic IDs to all text content
 *
 * This function is the entry point for enriching schemas. It:
 * 1. Detects the layout type
 * 2. Applies type-specific enrichment logic
 * 3. Returns an enriched schema ready for conversion
 *
 * The function is IDEMPOTENT: calling it multiple times returns the same result
 * because enrichValue() checks if values are already enriched and passes them through.
 *
 * Unsupported types are returned unchanged (safe fallback).
 *
 * @param schema Plain SlideLayoutSchema (or already enriched)
 * @returns EnrichedSlideLayoutSchema with IDs added to all text content
 *
 * @example
 * const plain = { type: 'LIST', title: 'Test', data: { items: ['A', 'B'] } };
 * const enriched = enrichSchema(plain);
 * // Result: { type: 'LIST', title: { value: 'Test', id: 'title' }, data: { items: [...] } }
 *
 * @example
 * // Calling twice is safe (idempotent)
 * const e1 = enrichSchema(plain);
 * const e2 = enrichSchema(e1);
 * // e1 === e2 (same result)
 */
export function enrichSchema(schema: SlideLayoutSchema): EnrichedSlideLayoutSchema {
  const type = schema.type;

  console.log(`[SchemaEnricher] Enriching schema of type: ${type}`);

  // Handle each layout type
  // Each case enriches the specific fields that contain user-editable text content

  if (type === SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        ...s.data,
        items: enrichArray(s.data.items, 'items'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched TWO_COLUMN_WITH_IMAGE:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.MAIN_IMAGE) {
    const s = schema as any;
    const enriched = {
      ...s,
      data: {
        ...s.data,
        content: enrichValue(s.data.content, 'content'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched MAIN_IMAGE:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.TITLE) {
    const s = schema as any;
    const enriched = {
      ...s,
      data: {
        title: enrichValue(s.data.title, 'title'),
        subtitle: s.data.subtitle ? enrichValue(s.data.subtitle, 'subtitle') : undefined,
      },
    } as any;
    console.log('[SchemaEnricher] Enriched TITLE:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.TWO_COLUMN) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        items1: enrichArray(s.data.items1, 'items1'),
        items2: enrichArray(s.data.items2, 'items2'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched TWO_COLUMN:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.LIST) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        items: enrichArray(s.data.items, 'items'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched LIST:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.LABELED_LIST) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        items: s.data.items.map((item: any, index: number) => ({
          label: enrichValue(item.label, `items-${index}-label`),
          content: enrichValue(item.content, `items-${index}-content`),
        })),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched LABELED_LIST:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS) {
    const s = schema as any;
    const enriched = {
      ...s,
      data: {
        items: enrichArray(s.data.items, 'items'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched TABLE_OF_CONTENTS:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.TIMELINE) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        items: s.data.items.map((item: any, index: number) => ({
          label: enrichValue(item.label, `items-${index}-label`),
          content: enrichValue(item.content, `items-${index}-content`),
        })),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched TIMELINE:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  if (type === SLIDE_LAYOUT_TYPE.PYRAMID) {
    const s = schema as any;
    const enriched = {
      ...s,
      title: enrichValue(s.title, 'title'),
      data: {
        items: enrichArray(s.data.items, 'items'),
      },
    } as any;
    console.log('[SchemaEnricher] Enriched PYRAMID:', JSON.stringify(enriched, null, 2));
    return enriched;
  }

  // Unknown type - return as-is (safe fallback)
  console.warn(`[SchemaEnricher] Unknown layout type: ${type}`);
  return schema as any;
}

/**
 * Checks if a schema is already enriched
 *
 * This function detects whether a schema contains EnrichedValue objects
 * by sampling key fields. It's used to avoid re-enriching already-enriched schemas.
 *
 * @param schema The schema to check
 * @returns true if schema contains EnrichedValue objects, false if plain values
 *
 * @example
 * const plain = { type: 'LIST', title: 'Test', data: { items: ['A'] } };
 * isSchemaEnriched(plain); // false
 *
 * const enriched = enrichSchema(plain);
 * isSchemaEnriched(enriched); // true
 */
export function isSchemaEnriched(schema: unknown): boolean {
  if (!schema || typeof schema !== 'object' || !('type' in schema)) {
    return false;
  }

  const schemaObj = schema as any;

  // Check various possible enriched fields based on type
  // We sample a few fields to determine enrichment status

  // Check title (present in many types)
  if (schemaObj.title && isEnriched(schemaObj.title)) {
    return true;
  }

  // Check data fields
  if (schemaObj.data) {
    // Check items array (most common)
    if (Array.isArray(schemaObj.data.items) && schemaObj.data.items.length > 0) {
      if (isEnriched(schemaObj.data.items[0])) {
        return true;
      }
    }

    // Check content field
    if (schemaObj.data.content && isEnriched(schemaObj.data.content)) {
      return true;
    }

    // Check title in data
    if (schemaObj.data.title && isEnriched(schemaObj.data.title)) {
      return true;
    }

    // Check items with label/content (LABELED_LIST, TIMELINE)
    if (
      Array.isArray(schemaObj.data.items) &&
      schemaObj.data.items.length > 0 &&
      typeof schemaObj.data.items[0] === 'object' &&
      schemaObj.data.items[0] !== null
    ) {
      const firstItem = schemaObj.data.items[0];
      if (isEnriched(firstItem.label) || isEnriched(firstItem.content)) {
        return true;
      }
    }
  }

  return false;
}
