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
