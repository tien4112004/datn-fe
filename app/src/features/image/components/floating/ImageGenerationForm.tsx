import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { MODEL_TYPES, useModels } from '@/features/model';
import { useArtStyles } from '../../hooks';
import AdvancedOptions from '../../components/AdvancedOptions';
import type { CreateImageFormData } from '../../types';

interface ImageGenerationFormProps {
  onSubmit: (data: CreateImageFormData) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Compact image generation form optimized for the floating dialog
 * Reuses most components from CreateImagePage
 */
export const ImageGenerationForm = ({ onSubmit, isGenerating, error }: ImageGenerationFormProps) => {
  const { t } = useTranslation('image');
  const { models } = useModels(MODEL_TYPES.IMAGE);
  const { artStyles } = useArtStyles();

  const form = useForm<CreateImageFormData>({
    defaultValues: {
      topic: '',
      model: {
        name: '',
        provider: '',
      },
      imageDimension: '1024x1024',
      artStyle: '',
      artDescription: '',
      negativePrompt: '',
    },
  });

  const { control, register, watch, handleSubmit, setValue } = form;

  // Synchronize artDescription with artStyle selection
  const selectedArtStyle = watch('artStyle');
  useEffect(() => {
    if (selectedArtStyle) {
      const matchedStyle = artStyles.find(
        (style) => style.id === selectedArtStyle || style.name === selectedArtStyle
      );
      if (matchedStyle?.modifiers) {
        setValue('artDescription', matchedStyle.modifiers);
      } else if (selectedArtStyle === '') {
        setValue('artDescription', '');
      }
    }
  }, [selectedArtStyle, artStyles, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Prompt Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {t('create.promptTitle')}
        </label>
        <div className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 dark:border-gray-800 dark:bg-gray-900/50">
          <Controller
            name="topic"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <AutosizeTextarea
                className="w-full text-sm"
                placeholder={t('create.promptPlaceholder')}
                minHeight={32}
                maxHeight={120}
                variant="ghost"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />

          {/* Model Selection */}
          <div className="mt-2">
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <ModelSelect
                  models={models}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t('create.model.placeholder')}
                  label={t('create.model.label')}
                  showProviderLogo={true}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Advanced Options - Collapsible */}
      <div className="text-xs">
        <AdvancedOptions register={register} control={control} isOpen={false} onToggle={() => {}} />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button type="submit" disabled={isGenerating} className="h-8 w-full text-sm" size="sm">
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? t('create.generating') : t('create.generateImage')}
      </Button>
    </form>
  );
};
