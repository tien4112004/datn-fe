import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Loader2, Paperclip, Sparkles } from 'lucide-react';
import { FileChips } from '@/shared/components/FileAttachmentInput';
import { Card, CardContent, CardTitle } from '@ui/card';
import { AutosizeTextarea } from '@ui/autosize-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useSearchParams } from 'react-router-dom';
import { useRef } from 'react';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';
import AdvancedOptions from './AdvancedOptions';
import { SLIDE_COUNT_OPTIONS } from '@/features/presentation/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { EXAMPLE_PROMPT_TYPE } from '@/features/projects/types/examplePrompt';
import { AiDisclaimer } from '@/shared/components/common/AiDisclaimer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';

const FILE_ACCEPT = '.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp';

interface OutlineCreationViewProps {
  onCreateOutline: () => void;
}

const OutlineCreationView = ({ onCreateOutline }: OutlineCreationViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });

  const {
    control,
    setValue,
    watch,
    trigger,
    attachedFiles,
    setAttachedFiles,
    isUploadingFiles,
    uploadFiles,
  } = usePresentationForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { models } = useModels(MODEL_TYPES.TEXT);

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

  const showExamplePrompts = watch('topic') === '' && attachedFiles.length === 0 && !isAdvancedOpen;

  // Presentation-specific example prompts
  const presentationExamplePrompts = [
    t('examples.prompt1'),
    t('examples.prompt2'),
    t('examples.prompt3'),
    t('examples.prompt4'),
    t('examples.prompt5'),
    t('examples.prompt6'),
  ];

  const handleExampleClick = (example: string) => {
    setValue('topic', example);
  };

  const handleSubmit = async () => {
    const hasTopic = watch('topic').trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    if (!hasTopic && !hasFiles) return;
    const isValid = await trigger(['slideCount', 'language', 'model']);
    if (isValid) {
      onCreateOutline();
    }
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center py-12 sm:w-full">
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
                {/* File chips — above the textarea */}
                <FileChips
                  attachedFiles={attachedFiles}
                  onRemove={(url) => setAttachedFiles((prev) => prev.filter((f) => f.url !== url))}
                />

                {/* Prompt textarea */}
                <Controller
                  name="topic"
                  control={control}
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

                {/* Bottom toolbar: file button + slide count + model */}
                <div className="my-2 flex flex-row gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={FILE_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        uploadFiles(e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingFiles}
                        className="shadow-xs text-muted-foreground hover:bg-accent flex h-9 items-center gap-2 whitespace-nowrap rounded-md border bg-transparent px-3 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isUploadingFiles ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Paperclip className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t('fileUpload.attachFiles')}</TooltipContent>
                  </Tooltip>
                  <Controller
                    name="slideCount"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="ml-auto w-fit">
                          <SelectValue placeholder={t('slideCountPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SLIDE_COUNT_OPTIONS.map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {t('slideCountUnit')}
                            </SelectItem>
                          ))}
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
                        placeholder={t('model.placeholder')}
                        label={t('model.label')}
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
              type={EXAMPLE_PROMPT_TYPE.PRESENTATION}
              fallbackPrompts={presentationExamplePrompts}
              title={t('examples.title')}
            />

            <AdvancedOptions control={control} isOpen={isAdvancedOpen} onToggle={toggleAdvancedOptions} />
          </CardContent>
        </Card>

        <div className="mt-4 space-y-2">
          <AiDisclaimer />
          <Button
            type="submit"
            className="w-full"
            disabled={!watch('topic').trim() && attachedFiles.length === 0}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t('generateOutline')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutlineCreationView;
