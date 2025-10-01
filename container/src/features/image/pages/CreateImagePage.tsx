import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AdvancedOptions from '@/features/image/components/AdvancedOptions';
import type { CreateImageFormData } from '@/features/image/types';
import { useImageApiService } from '@/features/image/api';

const CreateImagePage = () => {
  const { t } = useTranslation('image', { keyPrefix: 'createImage' });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const imageApiService = useImageApiService();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateImageFormData>({
    defaultValues: {
      topic: '',
      imageModel: '',
      imageDimension: '',
      artStyle: '',
      negativePrompt: '',
    },
  });
  const { setValue, watch, control, register, handleSubmit } = form;

  // Read advanced options state directly from URL
  const isAdvancedOpen = searchParams.get('advanced') === 'true';

  // Update URL when advanced options state changes
  const toggleAdvancedOptions = (open: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (open) {
      newParams.set('advanced', 'true');
    } else {
      newParams.delete('advanced');
    }
    setSearchParams(newParams);
  };

  // const topicValue = watch('topic') as string;
  const showExamplePrompts = watch('topic').trim() === '' && !isAdvancedOpen;

  // Image-specific example prompts
  const imageExamplePrompts = [
    t('examplePrompt1'),
    t('examplePrompt2'),
    t('examplePrompt3'),
    t('examplePrompt4'),
    t('examplePrompt5'),
    t('examplePrompt6'),
  ];

  const handleExampleClick = (example: string) => {
    setValue('topic', example);
  };

  // Transform form data to API request format
  const transformToApiRequest = (formData: CreateImageFormData) => {
    return {
      prompt: formData.topic,
      style: formData.artStyle || undefined,
      size: formData.imageDimension || undefined,
      quality: formData.imageModel || undefined,
    };
  };

  const onSubmit = async (data: CreateImageFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const apiRequest = transformToApiRequest(data);
      const response = await imageApiService.generateImage(apiRequest);

      // Navigate to the image details page with the generated image ID
      navigate(`/image/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      console.error('Image generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center sm:w-full">
      <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('title')}</h1>
      <ResourceTypeSwitcher />
      <h2 className="text-xl font-bold leading-10 text-sky-500/80">{t('subtitle')}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Card className="w-full">
          <CardContent>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-medium">{t('promptTitle')}</CardTitle>
              <div className="border-primary rounded border-2 px-2 pt-2">
                <Controller
                  name="topic"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <AutosizeTextarea
                      className="w-full"
                      placeholder={t('promptPlaceholder')}
                      minHeight={36}
                      maxHeight={200}
                      variant="ghost"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>
            <ExamplePrompts
              onExampleClick={handleExampleClick}
              isShown={showExamplePrompts}
              prompts={imageExamplePrompts}
              title={t('examplePromptTitle')}
            />

            <AdvancedOptions
              register={register}
              control={control}
              isOpen={isAdvancedOpen}
              onToggle={toggleAdvancedOptions}
            />
          </CardContent>
        </Card>

        {error && <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Button type="submit" className="mt-4 w-full" disabled={isGenerating}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? t('generating') : t('generateImage')}
        </Button>
      </form>
    </div>
  );
};

export default CreateImagePage;
