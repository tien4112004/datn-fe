import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import AdvancedOptions from '@/features/mindmap/components/AdvancedOptions';
import type { CreateMindmapFormData } from '@/features/mindmap/types';
import useGenerateMindmap from '../hooks/useGenerateMindmap';
import useFormPersist from 'react-hook-form-persist';
import { getLocalStorageData } from '@/shared/lib/utils';

const MINDMAP_FORM_PERSIST = 'create-mindmap-form';

const CreateMindmapPage = () => {
  const { t } = useTranslation('mindmap');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const generate = useGenerateMindmap();

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const persistedData = useMemo(() => getLocalStorageData(MINDMAP_FORM_PERSIST), []);

  const form = useForm<CreateMindmapFormData>({
    defaultValues: {
      topic: '',
      model: {
        name: '',
        provider: '',
      },
      language: 'en',
      maxDepth: 3,
      maxBranchesPerNode: 5,
      ...persistedData,
    },
  });

  const { setValue, watch, control, handleSubmit } = form;

  useFormPersist(MINDMAP_FORM_PERSIST, {
    watch: form.watch,
    setValue: form.setValue,
    storage: window.localStorage,
  });

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
    setSearchParams(newParams, { replace: true });
  };

  const showExamplePrompts = watch('topic').trim() === '' && !isAdvancedOpen;

  // Mindmap-specific example prompts
  const mindmapExamplePrompts = [
    t('create.examples.prompt1'),
    t('create.examples.prompt2'),
    t('create.examples.prompt3'),
    t('create.examples.prompt4'),
    t('create.examples.prompt5'),
    t('create.examples.prompt6'),
  ];

  const handleExampleClick = (example: string) => {
    setValue('topic', example);
  };

  // Transform form data to API request format
  const transformToApiRequest = (formData: CreateMindmapFormData) => {
    return {
      topic: formData.topic,
      model: formData.model.name,
      provider: formData.model.provider,
      language: formData.language,
      maxDepth: formData.maxDepth,
      maxBranchesPerNode: formData.maxBranchesPerNode,
    };
  };

  const onSubmit = async (data: CreateMindmapFormData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const apiRequest = transformToApiRequest(data);
      const response = await generate.mutateAsync(apiRequest);

      // Navigate to the mindmap details page with the generated mindmap ID
      navigate(`/mindmap/${response.id}`);
      setValue('topic', '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
      console.error('Mindmap generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center sm:w-full">
      <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('create.title')}</h1>
      <ResourceTypeSwitcher />
      <h2 className="text-xl font-bold leading-10 text-sky-500/80">{t('create.subtitle')}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Card className="w-full">
          <CardContent>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-medium">{t('create.promptTitle')}</CardTitle>
              <div className="border-primary rounded border-2 px-2 pt-2">
                <Controller
                  name="topic"
                  control={control}
                  rules={{ required: true, minLength: 1, maxLength: 500 }}
                  render={({ field }) => (
                    <AutosizeTextarea
                      className="w-full"
                      placeholder={t('create.promptPlaceholder')}
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
              prompts={mindmapExamplePrompts}
              title={t('create.examples.title')}
            />

            <AdvancedOptions control={control} isOpen={isAdvancedOpen} onToggle={toggleAdvancedOptions} />
          </CardContent>
        </Card>

        {error && <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Button type="submit" className="mt-4 w-full" disabled={isGenerating}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? t('create.generating') : t('create.generateMindmap')}
        </Button>
      </form>
    </div>
  );
};

export default CreateMindmapPage;
