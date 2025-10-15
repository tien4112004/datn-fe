import type { TextLayoutBlockInstance, TextStyleConfig } from '../types';
import { buildCombinedList, buildCards } from './layoutProbuild';
import { extractLabelStyles, collectDescendantTextsByLabel } from './layoutUtils';

/**
 * Processes a text container with combined mode enabled.
 * Extracts label-specific styles from children config and applies them to pattern placeholders.
 *
 * @param container - Text container with combined config
 * @param labelData - Data mapping labels to arrays of values
 * @param zIndex - Z-index for rendering order
 * @returns Object containing PPT elements and card decorations
 */
export function processCombinedTextContainer(
  container: any,
  labelData: Record<string, string[]>,
  zIndex: number
): {
  elements: Array<{ element: any; zIndex: number }>;
  cards: Array<{ element: any; zIndex: number }>;
} {
  const pattern = container.combined.pattern;

  // Extract styles for each label from children config
  const labelStyles = extractLabelStyles(container);

  // Collect all descendant texts by label
  const textsByLabel = collectDescendantTextsByLabel(labelData);

  // Apply pattern and styles to each item
  const listContents = textsByLabel.map((item) => {
    return applyPatternWithStyles(pattern, item, labelStyles);
  });

  // Build combined list with unified font sizing
  const textElements = buildCombinedList(listContents, container);
  const elements = textElements.map((element) => ({ element, zIndex }));

  // Extract border/shadow if present
  const cards: Array<{ element: any; zIndex: number }> = [];
  if (container.border || container.shadow) {
    const instance = {
      ...container,
      bounds: container.bounds,
    } as TextLayoutBlockInstance;
    const cardElements = buildCards(instance);
    cards.push(...cardElements.map((element) => ({ element, zIndex })));
  }

  return { elements, cards };
}

/**
 * Applies pattern with label-specific styles to data item.
 * Replaces placeholders like {label}, {content} with styled span elements.
 *
 * @param pattern - HTML pattern with placeholders (e.g., "<strong>{label}:</strong> {content}")
 * @param item - Data item with values for each label
 * @param labelStyles - Map of label names to their styles
 * @returns Formatted HTML string with styled content
 *
 * @example
 * applyPatternWithStyles(
 *   '<strong>{label}:</strong> {content}',
 *   { label: 'Q1', content: 'Revenue' },
 *   Map { label: { fontWeight: 'bold' }, content: { fontWeight: 'normal' } }
 * )
 * // Returns: '<strong><span style="font-weight: bold">Q1</span>:</strong> <span style="font-weight: normal">Revenue</span>'
 */
function applyPatternWithStyles(
  pattern: string,
  item: Record<string, string>,
  labelStyles: Map<string, TextStyleConfig>
): string {
  let formatted = pattern;

  // Replace all placeholders in the pattern with styled values
  for (const [key, value] of Object.entries(item)) {
    const placeholder = `{${key}}`;

    // Get styles for this label from children config
    const styles = labelStyles.get(key);

    // Wrap value with span containing label-specific styles
    let styledValue = value;
    if (styles) {
      const styleAttrs: string[] = [];
      if (styles.fontFamily) styleAttrs.push(`font-family: ${styles.fontFamily}`);
      if (styles.color) styleAttrs.push(`color: ${styles.color}`);
      if (styles.fontWeight) styleAttrs.push(`font-weight: ${styles.fontWeight}`);
      if (styles.fontStyle) styleAttrs.push(`font-style: ${styles.fontStyle}`);

      if (styleAttrs.length > 0) {
        styledValue = `<span style="${styleAttrs.join('; ')}">${value}</span>`;
      }
    }

    formatted = formatted.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), styledValue || '');
  }

  return formatted;
}
