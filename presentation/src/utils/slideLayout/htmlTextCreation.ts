import type { TextStyleConfig } from './types';

// Font weight mapping
const fontWeightMap: Record<string, string> = {
  normal: '400',
  bold: '700',
  bolder: 'bolder',
  lighter: 'lighter',
};

export interface ElementMeasurementConstraints {
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Unified element creation function - single source of truth for all text element creation
 */
export function createElement(content: string, config: TextStyleConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling with defaults
  const fontSize = config.fontSize ?? 16;
  const lineHeight = config.lineHeight ?? 1.4;

  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${lineHeight}`;
  p.style.fontSize = `${fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.margin = '0';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.fontStyle) {
    span.style.fontStyle = config.fontStyle;
  }

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = content;

  p.appendChild(span);
  return p;
}

export function updateElementFontSize(element: HTMLElement, newFontSize: number): void {
  element.style.fontSize = `${newFontSize}px`;
}

export function updateElementLineHeight(element: HTMLElement, newLineHeight: number): void {
  element.style.lineHeight = `${newLineHeight}`;
}

export function getElementContent(element: HTMLElement): string {
  const span = element.querySelector('span');
  return span ? span.textContent || '' : '';
}

export function getElementFontSize(element: HTMLElement): number {
  const span = element.querySelector('span');
  if (span && span.style.fontSize) {
    return parseFloat(span.style.fontSize);
  }
  return 16; // default fallback
}
