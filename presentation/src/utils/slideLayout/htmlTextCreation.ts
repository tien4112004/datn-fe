export interface TextElementConfig {
  content: string;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface ElementMeasurementConstraints {
  maxWidth?: number;
  maxHeight?: number;
  paddingX?: number;
  paddingY?: number;
}

export function createItemElement(config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling
  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontSize = `${config.fontSize}px`;
  p.style.fontFamily = config.fontFamily;
  p.style.margin = '0';
  p.style.padding = '0';
  p.style.paddingRight = '20px';

  // Apply span styling
  span.style.fontWeight = config.fontWeight || 'normal';
  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = config.content;

  p.appendChild(span);
  return p;
}

export function createTitleElement(config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const span = document.createElement('span');

  // Apply paragraph styling
  p.style.textAlign = 'center';
  p.style.margin = '0';
  p.style.padding = '10px 40px';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontSize = `${config.fontSize}px`;
  p.style.fontFamily = config.fontFamily;

  // Apply span styling
  span.style.fontWeight = config.fontWeight || 'bold';
  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = config.content;

  strong.appendChild(span);
  p.appendChild(strong);
  return p;
}

export function createLabelElement(config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const span = document.createElement('span');

  // Apply paragraph styling for labels (center-aligned)
  p.style.textAlign = 'center';
  p.style.margin = '0';
  p.style.padding = '0';
  p.style.paddingRight = '20px';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontFamily = config.fontFamily;
  p.style.fontSize = `${config.fontSize}px`;

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = config.content;

  strong.appendChild(span);
  p.appendChild(strong);
  return p;
}

export function createHorizontalItemContentElement(config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling for horizontal content (center-aligned)
  p.style.textAlign = 'center';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.margin = '0';
  p.style.padding = '0 10px';
  p.style.fontFamily = config.fontFamily;
  p.style.fontSize = `${config.fontSize}px`;

  // Apply span styling
  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = config.content;

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
