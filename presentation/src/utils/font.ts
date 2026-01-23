import { FONTS } from '@/configs/font';

// THIS FILE IS FULLY VIBE-CODED. UNCOMMENT THE CONSOLE LOGS TO DEBUG IF NEEDED.

const loadedFonts = new Set<string>();

// System fonts that are NOT available on Google Fonts - skip loading attempts
const SYSTEM_FONTS = new Set([
  'Arial',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Tahoma',
  'Lucida Console',
  'sans-serif',
  'serif',
  'monospace',
]);

function isSystemFont(fontFamily: string): boolean {
  return SYSTEM_FONTS.has(fontFamily);
}

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
  // System fonts are assumed available (browser will use fallback if not)
  if (isSystemFont(fontFamily)) return true;

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
    // Skip system fonts - they're not on Google Fonts
    if (isSystemFont(font.value)) return;

    const available = testFontRendering(font.value);
    // console.log(`${font.label}: ${available ? 'AVAILABLE' : 'FALLBACK'}`);

    if (!available) {
      fallbackFonts.push(font.value);
    }
  });

  async function retryLoadGoogleFont(font: string, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await loadGoogleFont(font);
        return;
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  try {
    await Promise.all(fallbackFonts.map((font) => retryLoadGoogleFont(font, 3)));
    console.log('Google Fonts loaded successfully');

    FONTS.forEach((font) => {
      const available = testFontRendering(font.value);
      //   console.log(`${font.label}: ${available ? 'AVAILABLE' : 'STILL_FALLBACK'}`);
    });
  } catch (error) {
    console.error('Error loading some Google Fonts:', error);
  }
}
