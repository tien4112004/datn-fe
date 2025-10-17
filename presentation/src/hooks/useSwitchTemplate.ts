import { useSlidesStore } from '@/store';
import { convertToSlide } from '@/utils/slideLayout';
import { getTemplateVariations } from '@/utils/slideLayout/converters/templateSelector';
import type { Template } from '@/utils/slideLayout/types';

/**
 * Hook for switching slide templates
 * Allows switching between different template variations within the same layout type
 */
export default function useSwitchTemplate() {
  const slidesStore = useSlidesStore();

  /**
   * Get available template variations for a slide
   * @param slideId - The ID of the slide
   * @returns Array of template variations, or empty array if slide has no layout metadata
   */
  const getAvailableTemplates = (slideId: string): Template[] => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);
    if (!slide?.layout?.layoutType) {
      return [];
    }
    return getTemplateVariations(slide.layout.layoutType);
  };

  /**
   * Switch a slide to a different template
   * Preserves the original content but re-renders with the new template
   * @param slideId - The ID of the slide to update
   * @param newTemplateId - The ID of the template to switch to
   */
  const switchTemplate = async (slideId: string, newTemplateId: string): Promise<void> => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);

    if (!slide?.layout?.schema || !slide.layout.layoutType) {
      console.error('Cannot switch template: slide missing layout metadata');
      return;
    }

    // Find the new template
    const availableTemplates = getTemplateVariations(slide.layout.layoutType);
    const newTemplate = availableTemplates.find((t) => t.id === newTemplateId);

    if (!newTemplate) {
      console.error(`Template not found: ${newTemplateId}`);
      return;
    }

    // Get current theme and viewport
    const theme = slidesStore.theme;
    const viewport = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };

    try {
      // Generate a seed that will directly select this specific template by ID
      const seed = `template-id:${newTemplateId}`;

      // Re-convert the slide with the new template
      const newSlide = await convertToSlide(
        slide.layout.schema,
        viewport,
        theme,
        slide.id, // Preserve the slide ID
        seed
      );

      // Preserve properties that shouldn't change
      newSlide.notes = slide.notes;
      newSlide.remark = slide.remark;
      newSlide.animations = slide.animations;
      newSlide.turningMode = slide.turningMode;
      newSlide.sectionTag = slide.sectionTag;
      newSlide.type = slide.type;

      // Update background only if the new slide doesn't override it
      if (!newSlide.background && slide.background) {
        newSlide.background = slide.background;
      }

      // Update the slide in the store
      slidesStore.updateSlide(newSlide, slideId);
    } catch (error) {
      console.error('Error switching template:', error);
    }
  };

  /**
   * Check if a slide supports template switching
   * @param slideId - The ID of the slide
   * @returns true if the slide has layout metadata and multiple templates available
   */
  const canSwitchTemplate = (slideId: string): boolean => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);
    if (!slide?.layout?.layoutType) {
      return false;
    }
    const templates = getTemplateVariations(slide.layout.layoutType);
    return templates.length > 1;
  };

  return {
    getAvailableTemplates,
    switchTemplate,
    canSwitchTemplate,
  };
}
