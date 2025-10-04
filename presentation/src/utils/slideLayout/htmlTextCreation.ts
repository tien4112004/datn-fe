export interface TextElementConfig {
  fontSize: number;
  lineHeight: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

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

export function createTextElement(content: string, config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling
  p.style.textAlign = config.textAlign || 'left';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontSize = `${config.fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.margin = '0';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = content;

  p.appendChild(span);
  return p;
}

export function createTitleElement(content: string, config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const span = document.createElement('span');

  // Apply paragraph styling
  p.style.textAlign = 'center';
  p.style.margin = '0';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontSize = `${config.fontSize}px`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';

  // Apply span styling
  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = content;

  strong.appendChild(span);
  p.appendChild(strong);
  return p;
}

export function createLabelElement(content: string, config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const strong = document.createElement('strong');
  const span = document.createElement('span');

  // Apply paragraph styling for labels (center-aligned)
  p.style.textAlign = 'center';
  p.style.margin = '0';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.fontSize = `${config.fontSize}px`;

  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  if (config.color) {
    span.style.color = config.color;
  }
  span.textContent = content;

  strong.appendChild(span);
  p.appendChild(strong);
  return p;
}

export function createHorizontalItemContentElement(content: string, config: TextElementConfig): HTMLElement {
  const p = document.createElement('p');
  const span = document.createElement('span');

  // Apply paragraph styling for horizontal content (center-aligned)
  p.style.textAlign = 'center';
  p.style.lineHeight = `${config.lineHeight}`;
  p.style.margin = '0';
  p.style.fontFamily = config.fontFamily || 'Arial, sans-serif';
  p.style.fontSize = `${config.fontSize}px`;

  const fontWeightValue = config.fontWeight || 'normal';
  span.style.fontWeight = fontWeightMap[fontWeightValue.toString()] || fontWeightValue.toString();

  // Apply span styling
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
