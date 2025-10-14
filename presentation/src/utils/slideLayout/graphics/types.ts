/**
 * Graphics System - Simple type-safe decorative elements for slides
 *
 * Each graphic type is a separate interface. Adding new types requires:
 * 1. Add interface here
 * 2. Add renderer in renderer.ts
 * 3. Add to GraphicElement union type
 */

/**
 * Horizontal line below title
 */
export interface TitleLine {
  type: 'titleLine';
  color?: string; // Defaults to theme.themeColors[0]
  width?: number; // Width in pixels, defaults to title width
  thickness?: number; // Line thickness, defaults to 4
}

/**
 * Separator between content sections
 * Automatically positions itself between two containers
 */
export interface ContentSeparator {
  type: 'contentSeparator';
  orientation: 'horizontal' | 'vertical';
  color?: string; // Defaults to theme.fontColor
  thickness?: number; // Defaults to 2
  containers: [string, string]; // [container1, container2] - separator positioned between them
}

/**
 * Corner decoration (e.g., corner brackets, ornaments)
 */
export interface CornerDecoration {
  type: 'cornerDecoration';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style: 'bracket';
  color?: string; // Defaults to theme.themeColors[0]
  size?: number; // Size in pixels, defaults to 30
  thickness?: number; // Line thickness, defaults to 2
}

/**
 * Union of all graphic types
 */
export type GraphicElement = TitleLine | ContentSeparator | CornerDecoration;

/**
 * Graphics collection for a template
 */
export interface TemplateGraphics {
  elements: GraphicElement[];
}
