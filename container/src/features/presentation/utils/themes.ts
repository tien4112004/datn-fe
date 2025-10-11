import type { SlideTheme } from '../types/slide';

/**
 * Default theme configuration for generated presentations
 */
export const getDefaultPresentationTheme = (): SlideTheme => ({
  id: 'default',
  name: 'Default',
  backgroundColor: '#ffffff',
  themeColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'],
  fontColor: '#333333',
  fontName: 'Roboto',
  outline: {
    style: 'solid',
    width: 1,
    color: '#cccccc',
  },
  shadow: {
    h: 2,
    v: 2,
    blur: 4,
    color: 'rgba(0, 0, 0, 0.1)',
  },
  titleFontColor: '#0A2540',
  titleFontName: 'Roboto',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 8,
    borderWidth: 1,
    fill: 'semi',
    shadow: {
      h: 0,
      v: 2,
      blur: 8,
      color: 'rgba(0, 0, 0, 0.1)',
    },
    backgroundColor: 'transparent',
    textColor: '#333333',
  },
});

/**
 * Business theme - Professional and corporate
 */
export const getBusinessTheme = (): SlideTheme => ({
  id: 'business',
  name: 'Business',
  backgroundColor: '#f8fafc',
  themeColors: ['#1e40af', '#0f172a', '#475569', '#64748b', '#94a3b8'],
  fontColor: '#1e293b',
  fontName: 'Inter',
  outline: {
    style: 'solid',
    width: 1,
    color: '#e2e8f0',
  },
  shadow: {
    h: 0,
    v: 4,
    blur: 6,
    color: 'rgba(0, 0, 0, 0.07)',
  },
  titleFontColor: '#1e40af',
  titleFontName: 'Inter',
  labelFontColor: '#64748b',
  labelFontName: 'Inter',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 6,
    borderWidth: 1,
    fill: 'semi',
    shadow: {
      h: 0,
      v: 2,
      blur: 4,
      color: 'rgba(30, 64, 175, 0.1)',
    },
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
  },
});

/**
 * Education theme - Friendly and approachable
 */
export const getEducationTheme = (): SlideTheme => ({
  id: 'education',
  name: 'Education',
  backgroundColor: {
    type: 'linear',
    colors: [
      { color: '#d2f5e9ff', pos: 0 },
      { color: '#f0fdf4', pos: 100 },
    ],
    rotate: 45,
  },
  themeColors: ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c'],
  fontColor: '#374151',
  fontName: 'Open Sans',
  outline: {
    style: 'solid',
    width: 2,
    color: '#d1fae5',
  },
  shadow: {
    h: 2,
    v: 2,
    blur: 8,
    color: 'rgba(5, 150, 105, 0.15)',
  },
  titleFontColor: '#059669',
  titleFontName: 'Quicksand',
  labelFontColor: '#0891b2',
  labelFontName: 'Nunito',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 12,
    borderWidth: 2,
    fill: 'semi',
    shadow: {
      h: 0,
      v: 3,
      blur: 10,
      color: 'rgba(5, 150, 105, 0.2)',
    },
    backgroundColor: '#f0fdf4',
    textColor: '#065f46',
  },
});

/**
 * Creative theme - Vibrant and artistic
 */
export const getCreativeTheme = (): SlideTheme => ({
  id: 'creative',
  name: 'Creative',
  backgroundColor: {
    type: 'linear',
    colors: [
      { color: '#d7d0ffff', pos: 0 },
      { color: '#f7f4f7ff', pos: 100 },
    ],
    rotate: 45,
  },
  themeColors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  fontColor: '#581c87',
  fontName: 'Poppins',
  outline: {
    style: 'solid',
    width: 2,
    color: '#e9d5ff',
  },
  shadow: {
    h: 3,
    v: 3,
    blur: 12,
    color: 'rgba(139, 92, 246, 0.25)',
  },
  titleFontColor: '#7c3aed',
  titleFontName: 'Comfortaa',
  labelFontColor: '#ec4899',
  labelFontName: 'Fredoka',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 16,
    borderWidth: 2,
    fill: 'semi',
    shadow: {
      h: 0,
      v: 4,
      blur: 16,
      color: 'rgba(139, 92, 246, 0.2)',
    },
    backgroundColor: '#faf5ff',
    textColor: '#6b21a8',
  },
});

/**
 * Minimal theme - Clean and simple
 */
export const getMinimalTheme = (): SlideTheme => ({
  id: 'minimal',
  name: 'Minimal',
  backgroundColor: '#ffffff',
  themeColors: ['#000000', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
  fontColor: '#111827',
  fontName: 'Work Sans',
  outline: {
    style: 'solid',
    width: 1,
    color: '#e5e7eb',
  },
  shadow: {
    h: 0,
    v: 1,
    blur: 2,
    color: 'rgba(0, 0, 0, 0.05)',
  },
  titleFontColor: '#000000',
  titleFontName: 'Space Grotesk',
  labelFontColor: '#6b7280',
  labelFontName: 'DM Sans',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 4,
    borderWidth: 1,
    fill: 'none',
    shadow: {
      h: 0,
      v: 1,
      blur: 3,
      color: 'rgba(0, 0, 0, 0.1)',
    },
    backgroundColor: '#fafafa',
    textColor: '#111827',
  },
});

/**
 * Modern theme - Sleek and contemporary
 */
export const getModernTheme = (): SlideTheme => ({
  id: 'modern',
  name: 'Modern',
  backgroundColor: '#0f172a',
  themeColors: ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'],
  fontColor: '#e2e8f0',
  fontName: 'Montserrat',
  outline: {
    style: 'solid',
    width: 1,
    color: '#334155',
  },
  shadow: {
    h: 0,
    v: 4,
    blur: 8,
    color: 'rgba(6, 182, 212, 0.2)',
  },
  titleFontColor: '#06b6d4',
  titleFontName: 'Montserrat',
  labelFontColor: '#06b6d4',
  labelFontName: 'Oswald',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 8,
    borderWidth: 1,
    fill: 'semi',
    shadow: {
      h: 0,
      v: 4,
      blur: 12,
      color: 'rgba(6, 182, 212, 0.3)',
    },
    backgroundColor: '#74a8fa',
    textColor: '#3d4b5e',
  },
});

/**
 * Classic theme - Traditional and elegant
 */
export const getClassicTheme = (): SlideTheme => ({
  id: 'classic',
  name: 'Classic',
  backgroundColor: '#fefcf0',
  themeColors: ['#92400e', '#7c2d12', '#a16207', '#166534', '#1e40af'],
  fontColor: '#451a03',
  fontName: 'Merriweather',
  outline: {
    style: 'solid',
    width: 2,
    color: '#fde68a',
  },
  shadow: {
    h: 2,
    v: 4,
    blur: 6,
    color: 'rgba(146, 64, 14, 0.15)',
  },
  titleFontColor: '#92400e',
  titleFontName: 'Playfair Display',
  labelFontColor: '#a16207',
  labelFontName: 'Lora',
  accentImageShape: 'default',
  card: {
    enabled: true,
    borderRadius: 6,
    borderWidth: 2,
    fill: 'semi',
    shadow: {
      h: 1,
      v: 3,
      blur: 6,
      color: 'rgba(146, 64, 14, 0.2)',
    },
    backgroundColor: '#fffbeb',
    textColor: '#78350f',
  },
});

/**
 * Collection of all available presentation themes
 */
export const getPresentationThemes = () => [
  getBusinessTheme(),
  getEducationTheme(),
  getCreativeTheme(),
  getMinimalTheme(),
  getModernTheme(),
  getClassicTheme(),
];
