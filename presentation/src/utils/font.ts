import { FONTS } from '@/configs/font';

// THIS FILE IS FULLY VIBE-CODED. UNCOMMENT THE CONSOLE LOGS TO DEBUG IF NEEDED.

const loadedFonts = new Set<string>();

function loadGoogleFont(fontFamily: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (loadedFonts.has(fontFamily)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;

    link.onload = () => {
      loadedFonts.add(fontFamily);
      resolve();
    };

    link.onerror = () => {
      reject(new Error(`Failed to load font: ${fontFamily}`));
    };

    document.head.appendChild(link);
  });
}

export function testFontRendering(fontFamily: string): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return false;

  ctx.font = '12px monospace';
  const fallbackWidth = ctx.measureText('mmmmmmmmmmlli').width;

  ctx.font = `12px ${fontFamily}, monospace`;
  const testWidth = ctx.measureText('mmmmmmmmmmlli').width;

  return fallbackWidth !== testWidth;
}

export async function ensureFontAvailability(fontFamily: string): Promise<boolean> {
  if (fontFamily === 'sans-serif') return true;

  const isAvailable = testFontRendering(fontFamily);

  if (!isAvailable) {
    try {
      await loadGoogleFont(fontFamily);
      await new Promise((resolve) => setTimeout(resolve, 100));
      return testFontRendering(fontFamily);
    } catch (error) {
      return false;
    }
  }

  return true;
}

export async function initializeFonts(): Promise<void> {
  const fallbackFonts: string[] = [];

  FONTS.forEach((font) => {
    const available = testFontRendering(font.value);
    // console.log(`${font.label}: ${available ? 'AVAILABLE' : 'FALLBACK'}`);

    if (!available && font.value !== 'sans-serif') {
      fallbackFonts.push(font.value);
    }
  });

  if (fallbackFonts.length > 0) {
    // console.log(`Loading ${fallbackFonts.length} Google Fonts...`);

    try {
      await Promise.all(fallbackFonts.map((font) => loadGoogleFont(font)));
      //   console.log('Google Fonts loaded successfully');

      FONTS.forEach((font) => {
        const available = testFontRendering(font.value);
        // console.log(`${font.label}: ${available ? 'AVAILABLE' : 'STILL_FALLBACK'}`);
      });
    } catch (error) {
      //   console.error('Error loading some Google Fonts:', error);
    }
  }
}
