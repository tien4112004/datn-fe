/**
 * List Content Parser
 *
 * Utilities for parsing combined list HTML content back into individual items.
 * Used for extracting edited list content and mapping it back to schema items.
 */

import { toAST, type AST } from '@/utils/htmlParser';

/**
 * Parses combined list HTML into individual items
 *
 * Extracts <li> elements from <ul> or <ol>, limiting to expected count.
 * If no list structure is found, falls back to newline-based splitting.
 *
 * @param htmlContent - Combined list HTML (may contain <ul> or <ol>)
 * @param pattern - Pattern for validation (unused in MVP, reserved for future)
 * @param expectedItemCount - Expected number of items (from compound ID range)
 * @returns Array of HTML strings, one per list item
 */
export function parseListContentByPattern(
  htmlContent: string,
  pattern: string,
  expectedItemCount: number
): string[] {
  console.log('[ListParser] Parsing list content, expected items:', expectedItemCount);

  // Parse HTML to AST
  const ast = toAST(htmlContent);

  // Find list node (ul or ol)
  const listNode = findListNode(ast);

  if (!listNode) {
    console.warn('[ListParser] No list node found, falling back to newline split');
    // Fallback: split by newlines
    return htmlContent
      .split('\n')
      .filter((line) => line.trim())
      .slice(0, expectedItemCount);
  }

  // Extract li elements
  const items = extractListItems(listNode);

  console.log('[ListParser] Extracted', items.length, 'items');

  // Limit to expected count (handle extra items edge case)
  const limitedItems = items.slice(0, expectedItemCount);

  if (items.length > expectedItemCount) {
    console.warn(`[ListParser] Extra items detected (${items.length} > ${expectedItemCount}), truncating`);
  }

  return limitedItems;
}

/**
 * Finds the list node (ul or ol) in AST
 * @internal
 */
function findListNode(nodes: AST[]): AST | null {
  for (const node of nodes) {
    if (
      node.type === 'element' &&
      'name' in node &&
      node.name &&
      (node.name === 'ul' || node.name === 'ol')
    ) {
      return node;
    }

    // Recursively search children
    if (node.type === 'element' && 'children' in node && node.children) {
      const found = findListNode(node.children as AST[]);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extracts <li> elements from list node
 * @internal
 */
function extractListItems(listNode: AST): string[] {
  if (!('children' in listNode) || !listNode.children) return [];

  const items: string[] = [];

  for (const child of listNode.children as AST[]) {
    if (child.type === 'element' && 'name' in child && child.name === 'li') {
      // Convert li node back to HTML
      const itemHtml = nodeToHTML(child);
      items.push(itemHtml);
    }
  }

  return items;
}

/**
 * Converts AST node back to HTML string
 * @internal
 */
function nodeToHTML(node: AST): string {
  if (node.type === 'text') {
    return ('content' in node ? node.content : '') || '';
  }

  if (node.type === 'element' && 'name' in node) {
    const children = 'children' in node ? (node.children as AST[])?.map(nodeToHTML).join('') || '' : '';

    // For li, just return inner content (strip <li> tags)
    if (node.name === 'li') {
      return children;
    }

    // For other tags, include the tag
    const attrs = 'attrs' in node && node.attrs ? formatAttributes(node.attrs as Record<string, string>) : '';
    return `<${node.name}${attrs}>${children}</${node.name}>`;
  }

  return '';
}

/**
 * Formats attributes object into HTML attribute string
 * @internal
 */
function formatAttributes(attrs: Record<string, string>): string {
  return Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');
}

/**
 * Extracts field values from a single list item based on pattern
 *
 * MVP implementation: Returns full item content as-is.
 * Future versions can parse against the pattern to extract individual fields.
 *
 * @param itemContent - HTML content of single list item
 * @param pattern - Pattern like "{label}: {content}" (unused in MVP)
 * @returns Processed item content (trimmed and ready for schema storage)
 */
export function extractFieldsFromItem(itemContent: string, pattern: string): string {
  // MVP: Return full content as-is (trimmed)
  // The content will be stored directly in the schema item
  return itemContent.trim();
}
