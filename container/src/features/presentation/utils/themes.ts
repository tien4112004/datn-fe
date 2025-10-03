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
  fontName: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
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
  fontName: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
  },
});

/**
 * Education theme - Friendly and approachable
 */
export const getEducationTheme = (): SlideTheme => ({
  id: 'education',
  name: 'Education',
  backgroundColor: '#fefefe',
  themeColors: ['#059669', '#0891b2', '#7c3aed', '#dc2626', '#ea580c'],
  fontColor: '#374151',
  fontName: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Nunito, -apple-system, BlinkMacSystemFont, sans-serif',
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
  },
});

/**
 * Creative theme - Vibrant and artistic
 */
export const getCreativeTheme = (): SlideTheme => ({
  id: 'creative',
  name: 'Creative',
  backgroundColor: '#faf5ff',
  themeColors: ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  fontColor: '#581c87',
  fontName: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
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
  fontName: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
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
  fontName: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
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
  titleFontName: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
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
  fontName: 'Georgia, "Times New Roman", serif',
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
  titleFontName: 'Georgia, "Times New Roman", serif',
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
