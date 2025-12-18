// Image generation dropdown options (i18n keys only, no hardcoded labels)

export const IMAGE_DIMENSION_OPTIONS = [
  { value: '1024x1024', labelKey: '1024x1024' },
  { value: '1792x1024', labelKey: '1792x1024' },
  { value: '1024x1792', labelKey: '1024x1792' },
  { value: '1536x1024', labelKey: '1536x1024' },
  { value: '1024x1536', labelKey: '1024x1536' },
];

export const ART_STYLE_OPTIONS = [
  { id: '', value: '', labelKey: 'none', visual: 'string' },
  { id: '', value: 'photorealistic', labelKey: 'photorealistic', visual: 'string' },
  { id: '', value: 'digital-art', labelKey: 'digitalArt', visual: 'string' },
  { id: '', value: 'oil-painting', labelKey: 'oilPainting', visual: 'string' },
  { id: '', value: 'watercolor', labelKey: 'watercolor', visual: 'string' },
  { id: '', value: 'anime', labelKey: 'anime', visual: 'string' },
  { id: '', value: 'cartoon', labelKey: 'cartoon', visual: 'string' },
  { id: '', value: 'sketch', labelKey: 'sketch', visual: 'string' },
  { id: '', value: 'abstract', labelKey: 'abstract', visual: 'string' },
  { id: '', value: 'surreal', labelKey: 'surreal', visual: 'string' },
] as const;

export type ArtStyle = (typeof ART_STYLE_OPTIONS)[number]['value'];
