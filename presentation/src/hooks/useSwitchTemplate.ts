import { useSlidesStore } from '@/store';
import { convertToSlide, selectTemplateById } from '@/utils/slideLayout';
import { getTemplateVariations } from '@/utils/slideLayout/converters/templateSelector';
import type { Template } from '@/utils/slideLayout/types';
import type { PPTImageElement } from '@/types/slides';

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
      // Preserve current image sources by updating the schema with current element data
      const updatedSchema = { ...slide.layout.schema };
      const imageElements = slide.elements.filter((el) => el.type === 'image') as PPTImageElement[];

      // Update schema with current image sources based on layout type
      if (updatedSchema.data && imageElements.length > 0) {
        // For layouts with a single image field
        if ('image' in updatedSchema.data && typeof updatedSchema.data.image === 'string') {
          // Use the first image element's source
          updatedSchema.data = { ...updatedSchema.data, image: imageElements[0].src };
        }
      }

      // Select the specific template by ID
      const template = await selectTemplateById(slide.layout.layoutType, newTemplateId);

      // Re-convert the slide with the new template, preserving parameter overrides
      const newSlide = await convertToSlide(
        updatedSchema,
        viewport,
        theme,
        template,
        slide.id, // Preserve the slide ID
        slide.layout.parameterOverrides // Preserve parameter customizations
      );

      // Preserve properties that shouldn't change
      newSlide.notes = slide.notes;
      newSlide.remark = slide.remark;
      newSlide.animations = slide.animations;
      newSlide.turningMode = slide.turningMode;
      newSlide.sectionTag = slide.sectionTag;
      newSlide.type = slide.type;

      // Preserve template preview mode state when switching
      if (newSlide.layout && slide.layout?.isTemplatePreview !== undefined) {
        newSlide.layout.isTemplatePreview = slide.layout.isTemplatePreview;
      }

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
   * Update template parameters for a slide
   * Re-renders the slide with the same template but different parameter values
   * @param slideId - The ID of the slide to update
   * @param parameterOverrides - New parameter values to apply
   */
  const updateTemplateParameters = async (
    slideId: string,
    parameterOverrides: Record<string, number>
  ): Promise<void> => {
    const slide = slidesStore.slides.find((s) => s.id === slideId);

    if (!slide?.layout?.schema || !slide.layout.layoutType || !slide.layout.templateId) {
      console.error('Cannot update parameters: slide missing layout metadata');
      return;
    }

    // Get current theme and viewport
    const theme = slidesStore.theme;
    const viewport = {
      width: slidesStore.viewportSize,
      height: slidesStore.viewportSize * slidesStore.viewportRatio,
    };

    try {
      // Preserve current image sources by updating the schema with current element data
      const updatedSchema = { ...slide.layout.schema };
      const imageElements = slide.elements.filter((el) => el.type === 'image') as PPTImageElement[];

      // Update schema with current image sources based on layout type
      if (updatedSchema.data && imageElements.length > 0) {
        // For layouts with a single image field
        if ('image' in updatedSchema.data && typeof updatedSchema.data.image === 'string') {
          // Use the first image element's source
          updatedSchema.data = { ...updatedSchema.data, image: imageElements[0].src };
        }
      }

      // Select the same template by ID to keep the current template
      const template = await selectTemplateById(slide.layout.layoutType, slide.layout.templateId);

      // Re-convert the slide with the updated parameters
      const newSlide = await convertToSlide(
        updatedSchema,
        viewport,
        theme,
        template,
        slide.id, // Preserve the slide ID
        parameterOverrides // Apply new parameter values
      );

      // Preserve properties that shouldn't change
      newSlide.notes = slide.notes;
      newSlide.remark = slide.remark;
      newSlide.animations = slide.animations;
      newSlide.turningMode = slide.turningMode;
      newSlide.sectionTag = slide.sectionTag;
      newSlide.type = slide.type;

      // Preserve template preview mode state
      if (newSlide.layout && slide.layout?.isTemplatePreview !== undefined) {
        newSlide.layout.isTemplatePreview = slide.layout.isTemplatePreview;
      }

      // Update background only if the new slide doesn't override it
      if (!newSlide.background && slide.background) {
        newSlide.background = slide.background;
      }

      // Update the slide in the store
      slidesStore.updateSlide(newSlide, slideId);
    } catch (error) {
      console.error('Error updating template parameters:', error);
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
    updateTemplateParameters,
    canSwitchTemplate,
  };
}
