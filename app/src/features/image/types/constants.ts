// Image generation dropdown options (i18n keys only, no hardcoded labels)

import type { ArtStyle } from '@aiprimary/core';

export const IMAGE_DIMENSION_OPTIONS = [
  { value: '1024x1024', labelKey: '1024x1024' },
  { value: '1792x1024', labelKey: '1792x1024' },
  { value: '1024x1792', labelKey: '1024x1792' },
  { value: '1536x1024', labelKey: '1536x1024' },
  { value: '1024x1536', labelKey: '1024x1536' },
];

// Convert size string (e.g., "1024x1024") to aspect ratio (e.g., "1:1")
export const convertSizeToAspectRatio = (size: string): string => {
  const [width, height] = size.split('x').map(Number);

  // Calculate GCD to simplify ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);

  return `${width / divisor}:${height / divisor}`;
};

export const ART_STYLE_OPTIONS: ArtStyle[] = [
  {
    id: '',
    name: '',
    labelKey: 'none',
    visual: 'https://placehold.co/600x400/FFFFFF/31343C?text=None',
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    labelKey: 'photorealistic',
    visual: 'https://placehold.co/600x400/667eea/ffffff?text=Photorealistic',
  },
  {
    id: 'digital-art',
    name: 'Digital Art',
    labelKey: 'digitalArt',
    visual: 'https://placehold.co/600x400/f093fb/ffffff?text=Digital+Art',
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    labelKey: 'oilPainting',
    visual: 'https://placehold.co/600x400/4facfe/ffffff?text=Oil+Painting',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    labelKey: 'watercolor',
    visual: 'https://placehold.co/600x400/00f2fe/ffffff?text=Watercolor',
  },
  {
    id: 'anime',
    name: 'Anime',
    labelKey: 'anime',
    visual: 'https://placehold.co/600x400/43e97b/ffffff?text=Anime',
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    labelKey: 'cartoon',
    visual: 'https://placehold.co/600x400/fa709a/ffffff?text=Cartoon',
  },
  {
    id: 'sketch',
    name: 'Sketch',
    labelKey: 'sketch',
    visual: 'https://placehold.co/600x400/fee140/ffffff?text=Sketch',
  },
  {
    id: 'abstract',
    name: 'Abstract',
    labelKey: 'abstract',
    visual: 'https://placehold.co/600x400/30cfd0/ffffff?text=Abstract',
  },
  {
    id: 'surreal',
    name: 'Surreal',
    labelKey: 'surreal',
    visual: 'https://placehold.co/600x400/ffecd2/ffffff?text=Surreal',
  },
];
