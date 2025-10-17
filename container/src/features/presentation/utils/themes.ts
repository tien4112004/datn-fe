import { moduleMethodMap } from '../components/remote/module';
import type { SlideTheme } from '../types/slide';

export let THEMES_DATA: Record<string, SlideTheme> = {};

moduleMethodMap['method']().then((mod) => {
  THEMES_DATA = (mod.default as any).getThemes();
});

/**
 * Get a theme by its ID
 * @param themeId - The ID of the theme to retrieve
 * @returns The theme object, or the default theme if not found
 */
export const getTheme = (themeId: string): SlideTheme => {
  return THEMES_DATA[themeId] || THEMES_DATA.default;
};

/**
 * Get the default presentation theme
 * @returns The default theme configuration
 */
export const getDefaultPresentationTheme = (): SlideTheme => {
  return THEMES_DATA.default;
};

/**
 * Get all available presentation themes
 * @returns Array of all theme objects
 */
export const getPresentationThemes = (): SlideTheme[] => {
  return Object.values(THEMES_DATA).filter((theme) => theme.id !== 'default');
};

/**
 * Get all theme IDs
 * @returns Array of all theme IDs
 */
export const getThemeIds = (): string[] => {
  return Object.keys(THEMES_DATA);
};
