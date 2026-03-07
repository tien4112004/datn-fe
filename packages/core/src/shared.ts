// Art Style Interface
export interface ArtStyle {
  id: string;
  name: string;
  labelKey: string;
  visual?: string; // CDN URL for preview image
  modifiers?: string; // Prompt enhancement keywords
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// Shared fallback art styles with placeholder visuals
export const ART_STYLE_OPTIONS: ArtStyle[] = [
  { id: '', name: '', labelKey: 'none' },
  { id: 'photorealistic', name: 'Photorealistic', labelKey: 'photorealistic', visual: 'https://placehold.co/600x400/667eea/ffffff?text=Photorealistic' },
  { id: 'digital-art', name: 'Digital Art', labelKey: 'digitalArt', visual: 'https://placehold.co/600x400/f093fb/ffffff?text=Digital+Art' },
  { id: 'oil-painting', name: 'Oil Painting', labelKey: 'oilPainting', visual: 'https://placehold.co/600x400/4facfe/ffffff?text=Oil+Painting' },
  { id: 'watercolor', name: 'Watercolor', labelKey: 'watercolor', visual: 'https://placehold.co/600x400/00f2fe/ffffff?text=Watercolor' },
  { id: 'anime', name: 'Anime', labelKey: 'anime', visual: 'https://placehold.co/600x400/43e97b/ffffff?text=Anime' },
  { id: 'cartoon', name: 'Cartoon', labelKey: 'cartoon', visual: 'https://placehold.co/600x400/fa709a/ffffff?text=Cartoon' },
  { id: 'sketch', name: 'Sketch', labelKey: 'sketch', visual: 'https://placehold.co/600x400/fee140/ffffff?text=Sketch' },
  { id: 'abstract', name: 'Abstract', labelKey: 'abstract', visual: 'https://placehold.co/600x400/30cfd0/ffffff?text=Abstract' },
  { id: 'surreal', name: 'Surreal', labelKey: 'surreal', visual: 'https://placehold.co/600x400/ffecd2/ffffff?text=Surreal' },
];
