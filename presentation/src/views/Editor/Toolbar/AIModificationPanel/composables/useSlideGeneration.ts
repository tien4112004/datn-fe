import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSlidesStore, useContainerStore } from '@/store';
import { useModelStore } from '@/stores/modelStore';
import { aiModificationService } from '@/services/ai/modifications';
import { convertToSlide, updateImageSource } from '@/utils/slideLayout';
import { selectRandomTemplate } from '@/utils/slideLayout/converters/templateSelectionHelpers';
import type { SlideLayoutSchema } from '@/utils/slideLayout/types';
import type { Slide, PPTImageElement } from '@/types/slides';
import useHistorySnapshot from '@/hooks/useHistorySnapshot';
import { useGenerateImage } from '@/services/image/queries';
import { useArtStyles } from './useArtStyles';
import { buildContext } from './useContextExtraction';

export function useSlideGeneration() {
  const containerStore = useContainerStore();
  const slidesStore = useSlidesStore();
  const modelStore = useModelStore();
  const { addHistorySnapshot } = useHistorySnapshot();
  const { theme } = storeToRefs(slidesStore);
  const { mutateAsync: generateImageMutation } = useGenerateImage();
  const { getStyleModifiers } = useArtStyles();

  const presentationId = computed(() => containerStore.presentation?.id || '');

  // Form state
  const prompt = ref('');
  const slideCount = ref(2);
  const selectedArtStyle = ref('');

  // Processing state
  const isProcessing = ref(false);
  const feedbackMessage = ref('');
  const feedbackType = ref<'info' | 'success' | 'error'>('info');

  const canGenerate = computed(() => prompt.value.trim().length > 0 && !isProcessing.value);

  async function handleImageGeneration(
    slideId: string,
    imageElement: PPTImageElement,
    imagePrompt: string,
    documentId?: string
  ) {
    // Set loading state
    const loadingUrl = 'https://elearning-storage.llms.vn/ai-primary/loading.gif';
    updateSlideImage(slideId, imageElement.id, loadingUrl);

    try {
      const currentTheme = theme.value;
      const artStyleModifiers = selectedArtStyle.value
        ? getStyleModifiers(selectedArtStyle.value)
        : undefined;

      const response = await generateImageMutation({
        presentationId: presentationId.value,
        slideId,
        params: {
          prompt: imagePrompt,
          imageModel: {
            name: modelStore.selectedImageModel.name,
            provider: modelStore.selectedImageModel.provider,
          },
          themeStyle: currentTheme.id,
          themeDescription: currentTheme.modifiers || undefined,
          artStyle: selectedArtStyle.value || undefined,
          artStyleModifiers,
          documentId,
        },
      });

      if (response.imageUrl) {
        await updateSlideImage(slideId, imageElement.id, response.imageUrl, imagePrompt);
      }
    } catch (error) {
      console.error('Image generation failed for slide:', slideId, error);
      const errorUrl = 'https://elearning-storage.llms.vn/ai-primary/error.svg';
      updateSlideImage(slideId, imageElement.id, errorUrl);
    }
  }

  async function updateSlideImage(slideId: string, elementId: string, url: string, prompt?: string) {
    const slideIndex = slidesStore.slides.findIndex((s) => s.id === slideId);
    if (slideIndex === -1) return;

    const slide = { ...slidesStore.slides[slideIndex] };
    const elementIndex = slide.elements.findIndex((el) => el.id === elementId);
    if (elementIndex === -1) return;

    const updatedElement = await updateImageSource(slide.elements[elementIndex] as PPTImageElement, url);
    slide.elements = [...slide.elements];
    slide.elements[elementIndex] = updatedElement;

    if (slide.layout?.schema?.data) {
      const updatedLayout = JSON.parse(JSON.stringify(slide.layout));
      if ('image' in updatedLayout.schema.data) {
        updatedLayout.schema.data.image = url;
      }
      if (prompt) {
        updatedLayout.schema.data.prompt = prompt;
      }
      slide.layout = updatedLayout;
    }

    const newSlides = [...slidesStore.slides];
    newSlides[slideIndex] = slide;
    slidesStore.setSlides(newSlides);
  }

  async function generateSlides() {
    if (!canGenerate.value) return;

    isProcessing.value = true;
    feedbackMessage.value = '';

    try {
      const result = await aiModificationService.generateSlides(
        {
          prompt: prompt.value,
          slideCount: slideCount.value,
          artStyle: selectedArtStyle.value || undefined,
          imageModel: modelStore.selectedImageModel.name,
          imageProvider: modelStore.selectedImageModel.provider,
          context: buildContext(slidesStore.slides, slidesStore.slideIndex),
          language: 'vi',
          presentationId: presentationId.value || undefined,
        },
        modelStore.selectedModel.name,
        modelStore.selectedModel.provider
      );

      if (!result.success || !result.data?.schemas) {
        throw new Error(result.error || 'Failed to generate slides');
      }

      const schemas = result.data.schemas as SlideLayoutSchema[];
      const slideGenDocumentId = result.data.documentId as string | undefined;

      if (schemas.length === 0) {
        throw new Error('No slides were generated');
      }

      const viewport = {
        width: slidesStore.viewportSize,
        height: slidesStore.viewportSize * slidesStore.viewportRatio,
      };

      const slides: Slide[] = [];
      for (const schema of schemas) {
        const template = await selectRandomTemplate(schema.type);
        const slide = await convertToSlide(schema, viewport, theme.value, template);
        slides.push(slide);
      }

      // addSlide inserts after current slide
      slidesStore.addSlide(slides);
      addHistorySnapshot();

      feedbackMessage.value = `Generated ${slides.length} slide(s)`;
      feedbackType.value = 'success';
      prompt.value = '';

      // Trigger image generation for slides with data.image (fire-and-forget)
      const imagePromises: Promise<void>[] = [];
      for (let i = 0; i < slides.length; i++) {
        const schema = schemas[i];
        const slide = slides[i];
        const imagePrompt = schema.data && 'image' in schema.data ? (schema.data as any).image : undefined;
        if (!imagePrompt) continue;

        const imageElement = slide.elements.find((el) => el.type === 'image') as PPTImageElement | undefined;
        if (!imageElement) continue;

        imagePromises.push(handleImageGeneration(slide.id, imageElement, imagePrompt, slideGenDocumentId));
      }

      if (imagePromises.length > 0) {
        Promise.allSettled(imagePromises).then(() => {
          addHistorySnapshot();
        });
      }
    } catch (error: any) {
      console.error('Slide generation error:', error);
      feedbackMessage.value = error.message || 'Failed to generate slides';
      feedbackType.value = 'error';
    } finally {
      isProcessing.value = false;
    }
  }

  function clearFeedback() {
    feedbackMessage.value = '';
    feedbackType.value = 'info';
  }

  return {
    prompt,
    slideCount,
    selectedArtStyle,
    isProcessing,
    feedbackMessage,
    feedbackType,
    canGenerate,
    generateSlides,
    clearFeedback,
  };
}
