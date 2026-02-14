import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { PopoverContent } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { useFloatingImageGenerator } from '../../context/FloatingImageGeneratorContext';
import { useGenerateImage } from '../../hooks';
import { ImageGenerationForm } from './ImageGenerationForm';
import { ImageGenerationSuccess } from './ImageGenerationSuccess';
import type { CreateImageFormData, ImageGenerationRequest } from '../../types';
import type { FloatingImageGeneratorState } from '../../types/floating';
import { toast } from 'sonner';

interface FloatingImageGeneratorPopoverProps {
  setState: Dispatch<SetStateAction<FloatingImageGeneratorState>>;
}

/**
 * Main popover component for the floating image generator
 * Anchored to FAB button, non-modal behavior (stays open on outside click)
 * Manages state transitions: Form → Generating → Success → Reset to Form
 */
export const FloatingImageGeneratorPopover = ({ setState }: FloatingImageGeneratorPopoverProps) => {
  const { t } = useTranslation('image');
  const { state, close } = useFloatingImageGenerator();
  const generate = useGenerateImage();

  /**
   * Transform form data to API request format
   */
  const transformToApiRequest = (formData: CreateImageFormData): ImageGenerationRequest => {
    const request: ImageGenerationRequest = {
      prompt: formData.topic,
      model: formData.model.name,
      provider: formData.model.provider,
      aspectRatio: formData.imageDimension || '1:1',
    };

    // Include artStyle and artDescription if selected
    if (formData.artStyle && formData.artStyle !== '') {
      request.artStyle = formData.artStyle;
      if (formData.artDescription) {
        request.artDescription = formData.artDescription;
      }
    }

    // Include negativePrompt if provided
    if (formData.negativePrompt && formData.negativePrompt.trim() !== '') {
      request.negativePrompt = formData.negativePrompt;
    }

    return request;
  };

  /**
   * Handle form submission - generate image
   */
  const handleSubmit = async (data: CreateImageFormData) => {
    // Validate required fields
    if (!data.topic.trim()) {
      toast.error(t('floating.promptRequired'));
      return;
    }

    if (!data.model.name || !data.model.provider) {
      toast.error(t('floating.modelRequired'));
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const request = transformToApiRequest(data);
      const response = await generate.mutateAsync(request);

      if (!response.images || response.images.length === 0) {
        throw new Error(t('floating.noImageGenerated'));
      }

      // Use first image
      const image = response.images[0];

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generatedImage: image,
        error: null,
      }));

      toast.success(t('floating.generationSuccess'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('floating.generationError');
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  };

  /**
   * Reset popover state back to form (for "Generate Another" button)
   */
  const handleReset = () => {
    setState((prev) => ({
      ...prev,
      generatedImage: null,
      error: null,
    }));
  };

  return (
    <PopoverContent
      side="top"
      align="end"
      className="max-h-[85vh] w-96 overflow-y-auto border border-gray-200 p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950"
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      {/* Header with Close Button */}
      <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('floating.dialogTitle')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={close}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content - Form or Success */}
      <div className="min-h-0">
        {state.generatedImage ? (
          <ImageGenerationSuccess image={state.generatedImage} onReset={handleReset} />
        ) : (
          <ImageGenerationForm
            onSubmit={handleSubmit}
            isGenerating={state.isGenerating}
            error={state.error}
          />
        )}
      </div>
    </PopoverContent>
  );
};
