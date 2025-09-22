import type { ExtendedSlideTheme } from '@/features/presentation/types/slide';
import { moduleMethodMap } from '../components/remote/module';
import type { SlideLayoutSchema } from '../types';

export interface SlideViewport {
  size: number;
  ratio: number;
}

/**
 * Processes AI-generated slide data and converts it to presentation format
 * This function takes the raw AI response and transforms it into slide objects
 * that can be consumed by the presentation editor
 */
export const processGeneratedSlides = async (
  generatedData: SlideLayoutSchema[],
  viewport: SlideViewport,
  theme: ExtendedSlideTheme
): Promise<any[]> => {
  const convertToSlide = await moduleMethodMap['convertToSlide']().then((mod) => mod.default);

  const processedSlides = [];

  for (const slideData of generatedData) {
    // Process each slide according to its type
    const processedSlide = await convertToSlide(
      slideData,
      {
        size: viewport.size,
        ratio: viewport.ratio,
      },
      theme
    );

    processedSlides.push(processedSlide);
  }

  return processedSlides;
};
