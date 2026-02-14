/**
 * Extract key colors from theme data for API submission
 * Handles both solid and gradient backgrounds
 */

import type { SlideTheme } from '@/types/slides';

export interface ExtractedColors {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export function extractThemeColors(theme: SlideTheme | null | undefined): ExtractedColors {
  if (!theme) {
    return {
      primaryColor: '#1e40af',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    };
  }

  // Primary: first theme color
  const primaryColor = theme.themeColors?.[0] || '#1e40af';

  // Background: handle solid or gradient
  let backgroundColor: string = '#ffffff';
  if (typeof theme.backgroundColor === 'string') {
    backgroundColor = theme.backgroundColor;
  } else if (
    theme.backgroundColor &&
    typeof theme.backgroundColor === 'object' &&
    'colors' in theme.backgroundColor
  ) {
    // @ts-ignore - Handle gradient type
    const colors = theme.backgroundColor.colors;
    if (Array.isArray(colors) && colors.length > 0 && colors[0].color) {
      backgroundColor = colors[0].color; // First gradient color
    }
  }

  // Text: font color
  const textColor = theme.fontColor || '#000000';

  return { primaryColor, backgroundColor, textColor };
}
