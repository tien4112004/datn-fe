import type { PPTLineElement, SlideTheme } from '@/types/slides';
import { generateUniqueId } from './utils';

export const createTitleLine = (
  titleDimensions: { width: number; height: number; left: number; top: number },
  theme: SlideTheme
) => {
  return {
    id: generateUniqueId(),
    type: 'line',
    style: 'solid',
    left: titleDimensions.left,
    top: titleDimensions.top + titleDimensions.height + 10,
    start: [0, 0],
    end: [titleDimensions.width, 0],
    width: 2,
    color: theme.themeColors[0],
    points: ['', ''],
  } as PPTLineElement;
};
