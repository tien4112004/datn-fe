import type { PPTLineElement, PPTImageElement, ImageElementClip, SlideTheme } from '@/types/slides';
import { generateUniqueId } from './utils';
import { getImageSize } from '../image';

export const createImageElement = async (
  src: string,
  bounds: { left: number; top: number; width: number; height: number },
  options: { fixedRatio?: boolean; clip?: ImageElementClip | 'auto'; rotate?: number } = {}
): Promise<PPTImageElement> => {
  let finalClip = options.clip;

  // Auto-calculate clip range when clip is 'auto'
  if (options.clip === 'auto') {
    const imageOriginalSize = await getImageSize(src);
    const imageRatio = imageOriginalSize.width / imageOriginalSize.height;

    finalClip = {
      shape: 'rect',
      range: [
        [100 / (imageRatio + 1), 0],
        [100 - 100 / (imageRatio + 1), 100],
      ],
    };
  }

  return {
    id: generateUniqueId(),
    type: 'image',
    src,
    fixedRatio: options.fixedRatio ?? true,
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
    rotate: options.rotate ?? 0,
    clip: finalClip ?? {
      shape: 'rect',
      range: [
        [0, 0],
        [100, 100],
      ],
    },
  } as PPTImageElement;
};

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
