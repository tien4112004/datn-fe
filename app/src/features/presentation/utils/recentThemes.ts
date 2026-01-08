const RECENT_THEMES_KEY = 'recent-slide-theme-ids';
const MAX_RECENT_THEMES = 6;

/**
 * Get recent theme IDs from localStorage
 * @returns Array of theme IDs, most recent first
 */
export const getRecentThemeIds = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_THEMES_KEY);
    if (!stored) return [];

    const ids = JSON.parse(stored);
    return Array.isArray(ids) ? ids.slice(0, MAX_RECENT_THEMES) : [];
  } catch (error) {
    console.warn('Failed to read recent theme IDs from localStorage:', error);
    return [];
  }
};

/**
 * Add a theme ID to the recent themes list
 * Most recent theme is at position 0
 * Removes duplicates and enforces 6-item limit
 * @param themeId - The ID of the theme to add
 */
export const addRecentThemeId = (themeId: string): void => {
  try {
    const currentIds = getRecentThemeIds();

    // Remove theme if it already exists (to avoid duplicates)
    const filteredIds = currentIds.filter((id) => id !== themeId);

    // Add to beginning of array
    const newIds = [themeId, ...filteredIds].slice(0, MAX_RECENT_THEMES);

    localStorage.setItem(RECENT_THEMES_KEY, JSON.stringify(newIds));
  } catch (error) {
    console.error('Failed to save recent theme ID to localStorage:', error);
  }
};

/**
 * Clear all recent theme IDs (useful for testing/debugging)
 */
export const clearRecentThemeIds = (): void => {
  try {
    localStorage.removeItem(RECENT_THEMES_KEY);
  } catch (error) {
    console.error('Failed to clear recent theme IDs from localStorage:', error);
  }
};
