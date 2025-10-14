/**
 * Graphics System - Public exports
 */

export type {
  TitleLine,
  ContentSeparator,
  CornerDecoration,
  GraphicElement,
  TemplateGraphics,
} from './types';

export { renderGraphic, renderGraphics } from './renderer';
export type { GraphicsRenderContext } from './renderer';
