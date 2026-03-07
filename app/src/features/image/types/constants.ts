// Image generation dropdown options (i18n keys only, no hardcoded labels)

export { ART_STYLE_OPTIONS } from '@aiprimary/core';

export const IMAGE_DIMENSION_OPTIONS = [
  { value: '1024x1024', labelKey: '1024x1024' },
  { value: '1792x1024', labelKey: '1792x1024' },
  { value: '1024x1792', labelKey: '1024x1792' },
  { value: '1536x1024', labelKey: '1536x1024' },
  { value: '1024x1536', labelKey: '1024x1536' },
];

// Convert size string (e.g., "1024x1024") to the nearest supported aspect ratio
export const convertSizeToAspectRatio = (size: string): string => {
  const [width, height] = size.split('x').map(Number);
  const ratio = width / height;

  // Find the closest supported aspect ratio
  const ratioValues: Record<string, number> = {
    '1:1': 1,
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '4:3': 4 / 3,
    '3:4': 3 / 4,
  };

  let closestRatio = '1:1';
  let smallestDiff = Infinity;

  for (const [ratioKey, ratioValue] of Object.entries(ratioValues)) {
    const diff = Math.abs(ratio - ratioValue);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRatio = ratioKey;
    }
  }

  return closestRatio;
};
