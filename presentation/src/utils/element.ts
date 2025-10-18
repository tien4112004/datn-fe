import tinycolor from 'tinycolor2';
import { nanoid } from 'nanoid';
import type { PPTElement, PPTLineElement, Slide } from '@/types/slides';

interface RotatedElementData {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
}

interface IdMap {
  [id: string]: string;
}

/**
 * Calculate the new position range of an element's rectangular bounds in the canvas after rotation
 * @param element Element's position, size, and rotation angle information
 */
export const getRectRotatedRange = (element: RotatedElementData) => {
  const { left, top, width, height, rotate = 0 } = element;

  const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / 2;
  const auxiliaryAngle = (Math.atan(height / width) * 180) / Math.PI;

  const tlbraRadian = ((180 - rotate - auxiliaryAngle) * Math.PI) / 180;
  const trblaRadian = ((auxiliaryAngle - rotate) * Math.PI) / 180;

  const middleLeft = left + width / 2;
  const middleTop = top + height / 2;

  const xAxis = [
    middleLeft + radius * Math.cos(tlbraRadian),
    middleLeft + radius * Math.cos(trblaRadian),
    middleLeft - radius * Math.cos(tlbraRadian),
    middleLeft - radius * Math.cos(trblaRadian),
  ];
  const yAxis = [
    middleTop - radius * Math.sin(tlbraRadian),
    middleTop - radius * Math.sin(trblaRadian),
    middleTop + radius * Math.sin(tlbraRadian),
    middleTop + radius * Math.sin(trblaRadian),
  ];

  return {
    xRange: [Math.min(...xAxis), Math.max(...xAxis)],
    yRange: [Math.min(...yAxis), Math.max(...yAxis)],
  };
};

/**
 * Calculate the offset distance between the new position of an element's rectangular bounds in the canvas after rotation and the position before rotation
 * @param element Element's position, size, and rotation angle information
 */
export const getRectRotatedOffset = (element: RotatedElementData) => {
  const { xRange: originXRange, yRange: originYRange } = getRectRotatedRange({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    rotate: 0,
  });
  const { xRange: rotatedXRange, yRange: rotatedYRange } = getRectRotatedRange({
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    rotate: element.rotate,
  });
  return {
    offsetX: rotatedXRange[0] - originXRange[0],
    offsetY: rotatedYRange[0] - originYRange[0],
  };
};

/**
 * Calculate the position range of an element in the canvas
 * @param element Element information
 */
export const getElementRange = (element: PPTElement) => {
  let minX, maxX, minY, maxY;

  if (element.type === 'line') {
    // For lines, we need to consider both start and end points
    // start and end are relative coordinates, so we add them to left/top
    const x1 = element.left + element.start[0];
    const x2 = element.left + element.end[0];
    const y1 = element.top + element.start[1];
    const y2 = element.top + element.end[1];

    minX = Math.min(x1, x2);
    maxX = Math.max(x1, x2);
    minY = Math.min(y1, y2);
    maxY = Math.max(y1, y2);
  } else if ('rotate' in element && element.rotate) {
    const { left, top, width, height, rotate } = element;
    const { xRange, yRange } = getRectRotatedRange({
      left,
      top,
      width,
      height,
      rotate,
    });
    minX = xRange[0];
    maxX = xRange[1];
    minY = yRange[0];
    maxY = yRange[1];
  } else {
    minX = element.left;
    maxX = element.left + element.width;
    minY = element.top;
    maxY = element.top + element.height;
  }
  return { minX, maxX, minY, maxY };
};

/**
 * Calculate the position range of a group of elements in the canvas
 * @param elementList A group of element information
 */
export const getElementListRange = (elementList: PPTElement[]) => {
  const leftValues: number[] = [];
  const topValues: number[] = [];
  const rightValues: number[] = [];
  const bottomValues: number[] = [];

  elementList.forEach((element) => {
    const { minX, maxX, minY, maxY } = getElementRange(element);
    leftValues.push(minX);
    topValues.push(minY);
    rightValues.push(maxX);
    bottomValues.push(maxY);
  });

  const minX = Math.min(...leftValues);
  const maxX = Math.max(...rightValues);
  const minY = Math.min(...topValues);
  const maxY = Math.max(...bottomValues);

  return { minX, maxX, minY, maxY };
};

/**
 * Calculate the length of a line element
 * @param element Line element
 */
export const getLineElementLength = (element: PPTLineElement) => {
  const deltaX = element.end[0] - element.start[0];
  const deltaY = element.end[1] - element.start[1];
  const len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return len;
};

export interface AlignLine {
  value: number;
  range: [number, number];
}

/**
 * Deduplicate a group of alignment snap lines: keep only one alignment snap line at the same position, taking the maximum and minimum values of all alignment snap lines at that position as the new range
 * @param lines A group of alignment snap line information
 */
export const uniqAlignLines = (lines: AlignLine[]) => {
  const uniqLines: AlignLine[] = [];
  lines.forEach((line) => {
    const index = uniqLines.findIndex((_line) => _line.value === line.value);
    if (index === -1) uniqLines.push(line);
    else {
      const uniqLine = uniqLines[index];
      const rangeMin = Math.min(uniqLine.range[0], line.range[0]);
      const rangeMax = Math.max(uniqLine.range[1], line.range[1]);
      const range: [number, number] = [rangeMin, rangeMax];
      const _line = { value: line.value, range };
      uniqLines[index] = _line;
    }
  });
  return uniqLines;
};

/**
 * Based on the slide list, generate new IDs for each slide and associate them with old IDs to form a dictionary
 * Mainly used when copying slides to maintain the original relationships of slide IDs throughout the data
 * @param slides Slide list
 */
export const createSlideIdMap = (slides: Slide[]) => {
  const slideIdMap: IdMap = {};
  for (const slide of slides) {
    slideIdMap[slide.id] = nanoid(10);
  }
  return slideIdMap;
};

/**
 * Based on the element list, generate new IDs for each element and associate them with old IDs to form a dictionary
 * Mainly used when copying elements to maintain the original relationships of element IDs throughout the data
 * For example: originally two grouped elements have the same groupId, after copying they will still have another identical groupId
 * @param elements Element list data
 */
export const createElementIdMap = (elements: PPTElement[]) => {
  const groupIdMap: IdMap = {};
  const elIdMap: IdMap = {};
  for (const element of elements) {
    const groupId = element.groupId;
    if (groupId && !groupIdMap[groupId]) {
      groupIdMap[groupId] = nanoid(10);
    }
    elIdMap[element.id] = nanoid(10);
  }
  return {
    groupIdMap,
    elIdMap,
  };
};

/**
 * Based on the table theme color, get the sub-color applied to the color
 * @param themeColor Theme color
 */
export const getTableSubThemeColor = (themeColor: string) => {
  const rgba = tinycolor(themeColor);
  return [rgba.setAlpha(0.3).toRgbString(), rgba.setAlpha(0.1).toRgbString()];
};

/**
 * Get the line element path string
 * @param element Line element
 */
export const getLineElementPath = (element: PPTLineElement) => {
  const start = element.start.join(',');
  const end = element.end.join(',');
  if (element.broken) {
    const mid = element.broken.join(',');
    return `M${start} L${mid} L${end}`;
  } else if (element.broken2) {
    const { minX, maxX, minY, maxY } = getElementRange(element);
    if (maxX - minX >= maxY - minY)
      return `M${start} L${element.broken2[0]},${element.start[1]} L${element.broken2[0]},${element.end[1]} ${end}`;
    return `M${start} L${element.start[0]},${element.broken2[1]} L${element.end[0]},${element.broken2[1]} ${end}`;
  } else if (element.curve) {
    const mid = element.curve.join(',');
    return `M${start} Q${mid} ${end}`;
  } else if (element.cubic) {
    const [c1, c2] = element.cubic;
    const p1 = c1.join(',');
    const p2 = c2.join(',');
    return `M${start} C${p1} ${p2} ${end}`;
  }
  return `M${start} L${end}`;
};

/**
 * Determine if an element is within the visible range
 * @param element Element
 * @param parent Parent element
 */
export const isElementInViewport = (element: HTMLElement, parent: HTMLElement): boolean => {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return elementRect.top >= parentRect.top && elementRect.bottom <= parentRect.bottom;
};
