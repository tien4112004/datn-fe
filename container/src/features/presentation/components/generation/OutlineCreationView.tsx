import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import { SLIDE_COUNT_OPTIONS, LANGUAGE_OPTIONS } from '@/features/presentation/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/components/common/ModelSelect';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';

interface OutlineCreationViewProps {
  onCreateOutline: () => void;
}

const OutlineCreationView = ({ onCreateOutline }: OutlineCreationViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { control, setValue, watch, trigger } = usePresentationForm();
  const { models } = useModels(MODEL_TYPES.TEXT);

  // const topicValue = watch('topic');
  const showExamplePrompts = watch('topic') === '';

  // Presentation-specific example prompts
  const presentationExamplePrompts = [
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

  const handleSubmit = async () => {
    const isValid = await trigger(['topic', 'slideCount', 'language', 'model']);
    if (isValid) {
      onCreateOutline();
    }
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center sm:w-full">
      <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('title')}</h1>
      <ResourceTypeSwitcher />
      <h2 className="text-xl font-bold leading-10 text-sky-500/80">{t('subtitle')}</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full"
      >
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
                <div className="my-2 flex flex-row gap-1">
                  <Controller
                    name="slideCount"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-fit">
                          <SelectValue placeholder={t('slideCountPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t('slideCountLabel')}</SelectLabel>
                            {SLIDE_COUNT_OPTIONS.map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {t('slideCountUnit')}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-fit">
                          <SelectValue placeholder={t('language.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t('language.label')}</SelectLabel>
                            {LANGUAGE_OPTIONS.map((languageOption) => (
                              <SelectItem key={languageOption.value} value={languageOption.value}>
                                {t(languageOption.labelKey)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <ModelSelect
                        models={models}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('modelPlaceholder')}
                        label={t('modelLabel')}
                        showProviderLogo={true}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <ExamplePrompts
              onExampleClick={handleExampleClick}
              isShown={showExamplePrompts}
              prompts={presentationExamplePrompts}
              title={t('examplePromptTitle')}
            />
          </CardContent>
        </Card>

        <Button type="submit" className="mt-4 w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          {t('generateOutline')}
        </Button>
      </form>
    </div>
  );
};

export default OutlineCreationView;
