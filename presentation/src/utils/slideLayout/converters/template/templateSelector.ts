import seedrandom from 'seedrandom';
import type { Template } from '../../types';
import {
  verticalListLayoutTemplate,
  verticalListCompactTemplate,
  verticalListCardsTemplate,
  verticalListNumberedTemplate,
} from './verticalList';
import { twoColumnWithImageLayoutTemplate, twoColumnBigImageLayoutTemplate } from './twoColumnWithImage';
import { twoColumnLayoutTemplate, twoColumnSplitTemplate, twoColumnAsymmetricTemplate } from './twoColumn';
import {
  horizontalListLayoutTemplate,
  horizontalListGridTemplate,
  horizontalListTimelineTemplate,
  horizontalListSingleRowTemplate,
} from './horizontalList';
import {
  titleLayoutTemplate,
  transitionLayoutTemplate,
  titleTopTemplate,
  titleBottomTemplate,
  titleLeftTemplate,
  titleAccentTemplate,
} from './title';
import {
  mainImageLayoutTemplate,
  mainImageFullBleedTemplate,
  mainImageSplitTemplate,
  mainImageWithTitleOverlayTemplate,
} from './mainImage';
import {
  tableOfContentsLayoutTemplate,
  tableOfContentsGridTemplate,
  tableOfContentsTwoColumnTemplate,
  tableOfContentsNumberedTemplate,
} from './tableOfContents';
import { SLIDE_LAYOUT_TYPE } from '../../types';

/**
 * Tracks the current index for cycling through templates when seed = '1'
 */
const cycleIndexes: Record<string, number> = {};

/**
 * Template variations for each layout type
 */
const TEMPLATE_VARIATIONS: Record<string, Template[]> = {
  [SLIDE_LAYOUT_TYPE.VERTICAL_LIST]: [
    verticalListLayoutTemplate,
    verticalListCompactTemplate,
    verticalListCardsTemplate,
    verticalListNumberedTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.TWO_COLUMN_WITH_IMAGE]: [
    twoColumnWithImageLayoutTemplate,
    twoColumnBigImageLayoutTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.TWO_COLUMN]: [
    twoColumnLayoutTemplate,
    twoColumnSplitTemplate,
    twoColumnAsymmetricTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.HORIZONTAL_LIST]: [
    horizontalListLayoutTemplate,
    horizontalListGridTemplate,
    horizontalListTimelineTemplate,
    horizontalListSingleRowTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.TITLE]: [
    titleLayoutTemplate,
    titleTopTemplate,
    titleBottomTemplate,
    titleLeftTemplate,
    titleAccentTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.TRANSITION]: [transitionLayoutTemplate],
  [SLIDE_LAYOUT_TYPE.MAIN_IMAGE]: [
    mainImageLayoutTemplate,
    mainImageFullBleedTemplate,
    mainImageSplitTemplate,
    mainImageWithTitleOverlayTemplate,
  ],
  [SLIDE_LAYOUT_TYPE.TABLE_OF_CONTENTS]: [
    tableOfContentsLayoutTemplate,
    tableOfContentsGridTemplate,
    tableOfContentsTwoColumnTemplate,
    tableOfContentsNumberedTemplate,
  ],
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

    console.log(
      `Cycling template for layout type "${layoutType}": ${selectedTemplate.id} (index ${currentIndex})`
    );

    return selectedTemplate;
  }

  // Use seeded random if seed is provided, otherwise use Math.random
  const rng = seed ? seedrandom(seed) : Math.random;
  const randomIndex = Math.floor(rng() * templates.length);

  console.log(`Selected template index for layout type "${layoutType}": ${templates[randomIndex].id}`);

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
