import type { SlideTheme } from '@/features/presentation/types/slide';

export interface SlideViewport {
  size: string;
  ratio: number;
}

export interface SlideData {
  type: string;
  title?: string;
  data: any;
}

/**
 * Processes AI-generated slide data and converts it to presentation format
 * This function takes the raw AI response and transforms it into slide objects
 * that can be consumed by the presentation editor
 */
export const processGeneratedSlides = async (
  generatedData: SlideData[],
  viewport: SlideViewport,
  theme: SlideTheme
): Promise<any[]> => {
  // This will be implemented to call the convertToSlide utility from the presentation package
  // For now, we'll return the data structure that matches what the presentation editor expects

  const processedSlides = [];

  for (const slideData of generatedData) {
    // Process each slide according to its type
    const processedSlide = {
      id: crypto.randomUUID(),
      type: slideData.type,
      title: slideData.title,
      data: slideData.data,
      viewport,
      theme,
    };

    processedSlides.push(processedSlide);
  }

  return processedSlides;
};
