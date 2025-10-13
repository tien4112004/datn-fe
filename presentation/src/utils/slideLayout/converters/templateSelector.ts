import seedrandom from 'seedrandom';
import type { Template } from '../types';
import { listTemplates } from './template/list';
import { twoColumnWithImageTemplates } from './template/twoColumnWithImage';
import { twoColumnTemplates } from './template/twoColumn';
import { labeledListTemplates } from './template/labeledList';
import { titleTemplates } from './template/title';
import { mainImageTemplates } from './template/mainImage';
import { tableOfContentsTemplates } from './template/tableOfContents';
import { SLIDE_LAYOUT_TYPE } from '../types';

/**
 * Tracks the current index for cycling through templates when seed = '1'
 */
const cycleIndexes: Record<string, number> = {};

/**
 * Template variations for each layout type
 */
export const TEMPLATE_VARIATIONS: Record<string, Template[]> = {
  [SLIDE_LAYOUT_TYPE.LIST]: listTemplates,
  [SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE]: twoColumnWithImageTemplates,
  [SLIDE_LAYOUT_TYPE.TWO_COLUMN]: twoColumnTemplates.filter((t) => t.id === 'two-column-container-border'),
  [SLIDE_LAYOUT_TYPE.LABELED_LIST]: labeledListTemplates,
  [SLIDE_LAYOUT_TYPE.TITLE]: titleTemplates,
  [SLIDE_LAYOUT_TYPE.MAIN_IMAGE]: mainImageTemplates,
  [SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS]: tableOfContentsTemplates,
};

/**
 * Selects a random template variation for the given layout type using a seeded random generator
 *
 * @param layoutType - The layout type to select a template for
 * @param seed - Optional seed for deterministic random selection (useful for testing). Use '1' for cycling.
 * @returns The selected template
 * @throws Error if no templates are available for the layout type
 */
export function selectTemplate(layoutType: string, seed?: string): Template {
  const templates = TEMPLATE_VARIATIONS[layoutType];

  if (!templates || templates.length === 0) {
    throw new Error(`No templates available for layout type: ${layoutType}`);
  }

  // If only one template exists, return it directly
  if (templates.length === 1) {
    console.log(`Only one template available for layout type "${layoutType}": ${templates[0].id}`);
    return templates[0];
  }

  // Special case: seed = '1' means cycle through templates
  if (seed === '1') {
    // Initialize cycle index for this layout type if not exists
    if (!(layoutType in cycleIndexes)) {
      cycleIndexes[layoutType] = 0;
    }

    const currentIndex = cycleIndexes[layoutType];
    const selectedTemplate = templates[currentIndex];

    // Move to next template for next call
    cycleIndexes[layoutType] = (currentIndex + 1) % templates.length;

    return selectedTemplate;
  }

  // Use seeded random if seed is provided, otherwise use Math.random
  const rng = seed ? seedrandom(seed) : Math.random;
  const randomIndex = Math.floor(rng() * templates.length);

  // Log selected template for debugging
  console.log(
    `Selected template for layout type "${layoutType}" with seed "${seed}": ${templates[randomIndex].id}`
  );

  return templates[randomIndex];
}

/**
 * Gets all available template variations for a given layout type
 *
 * @param layoutType - The layout type
 * @returns Array of available templates
 */
export function getTemplateVariations(layoutType: string): Template[] {
  return TEMPLATE_VARIATIONS[layoutType] || [];
}
