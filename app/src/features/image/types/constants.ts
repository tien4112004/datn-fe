// Image generation dropdown options (i18n keys only, no hardcoded labels)

export const IMAGE_DIMENSION_OPTIONS = [
  { value: '1024x1024', labelKey: '1024x1024' },
  { value: '1792x1024', labelKey: '1792x1024' },
  { value: '1024x1792', labelKey: '1024x1792' },
  { value: '1536x1024', labelKey: '1536x1024' },
  { value: '1024x1536', labelKey: '1024x1536' },
];

export const ART_STYLE_OPTIONS = [
  { value: '', labelKey: 'none' },
  { value: 'photorealistic', labelKey: 'photorealistic' },
  { value: 'digital-art', labelKey: 'digitalArt' },
  { value: 'oil-painting', labelKey: 'oilPainting' },
  { value: 'watercolor', labelKey: 'watercolor' },
  { value: 'anime', labelKey: 'anime' },
  { value: 'cartoon', labelKey: 'cartoon' },
  { value: 'sketch', labelKey: 'sketch' },
  { value: 'abstract', labelKey: 'abstract' },
  { value: 'surreal', labelKey: 'surreal' },
  { value: 'minimalist', labelKey: 'minimalist' },
] as const;

export type ArtStyle = (typeof ART_STYLE_OPTIONS)[number]['value'];

export const THEME_OPTIONS = [
  { value: 'nature', labelKey: 'nature' },
  { value: 'urban', labelKey: 'urban' },
  { value: 'fantasy', labelKey: 'fantasy' },
  { value: 'sci-fi', labelKey: 'sciFi' },
  { value: 'vintage', labelKey: 'vintage' },
  { value: 'modern', labelKey: 'modern' },
  { value: 'dark', labelKey: 'dark' },
  { value: 'bright', labelKey: 'bright' },
  { value: 'pastel', labelKey: 'pastel' },
  { value: 'monochrome', labelKey: 'monochrome' },
];
