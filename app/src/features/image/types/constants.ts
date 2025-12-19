// Image generation dropdown options (i18n keys only, no hardcoded labels)

export const IMAGE_DIMENSION_OPTIONS = [
  { value: '1024x1024', labelKey: '1024x1024' },
  { value: '1792x1024', labelKey: '1792x1024' },
  { value: '1024x1792', labelKey: '1024x1792' },
  { value: '1536x1024', labelKey: '1536x1024' },
  { value: '1024x1536', labelKey: '1024x1536' },
];

export const ART_STYLE_OPTIONS = [
  { id: '', value: '', labelKey: 'none', visual: 'https://placehold.co/600x400/FFFFFF/31343C?text=None' },
  {
    id: '',
    value: 'photorealistic',
    labelKey: 'photorealistic',
    visual: 'https://placehold.co/600x400/667eea/ffffff?text=Photorealistic',
  },
  {
    id: '',
    value: 'digital-art',
    labelKey: 'digitalArt',
    visual: 'https://placehold.co/600x400/f093fb/ffffff?text=Digital+Art',
  },
  {
    id: '',
    value: 'oil-painting',
    labelKey: 'oilPainting',
    visual: 'https://placehold.co/600x400/4facfe/ffffff?text=Oil+Painting',
  },
  {
    id: '',
    value: 'watercolor',
    labelKey: 'watercolor',
    visual: 'https://placehold.co/600x400/00f2fe/ffffff?text=Watercolor',
  },
  {
    id: '',
    value: 'anime',
    labelKey: 'anime',
    visual: 'https://placehold.co/600x400/43e97b/ffffff?text=Anime',
  },
  {
    id: '',
    value: 'cartoon',
    labelKey: 'cartoon',
    visual: 'https://placehold.co/600x400/fa709a/ffffff?text=Cartoon',
  },
  {
    id: '',
    value: 'sketch',
    labelKey: 'sketch',
    visual: 'https://placehold.co/600x400/fee140/ffffff?text=Sketch',
  },
  {
    id: '',
    value: 'abstract',
    labelKey: 'abstract',
    visual: 'https://placehold.co/600x400/30cfd0/ffffff?text=Abstract',
  },
  {
    id: '',
    value: 'surreal',
    labelKey: 'surreal',
    visual: 'https://placehold.co/600x400/ffecd2/ffffff?text=Surreal',
  },
] as const;

export type ArtStyle = (typeof ART_STYLE_OPTIONS)[number]['value'];

// Art Style Option type for component usage
export interface ArtStyleOption {
  id: string;
  value: ArtStyle;
  labelKey: string;
  visual: string;
}
