import { AutosizeTextarea } from '@ui/autosize-textarea';
import { Card, CardContent, CardTitle } from '@ui/card';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';
import { Sparkles } from 'lucide-react';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import AdvancedOptions from '@/features/mindmap/components/generate/AdvancedOptions';
import EducationModeSection from '@/shared/components/education/EducationModeSection';
import type { CreateMindmapFormData } from '@/features/mindmap/types';
import { useGenerateMindmapFlow } from '../hooks/useGenerateMindmapFlow';
import useFormPersist from 'react-hook-form-persist';
import { getLocalStorageData } from '@/shared/lib/utils';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { EXAMPLE_PROMPT_TYPE } from '@/features/projects/types/examplePrompt';
import { AiDisclaimer } from '@/shared/components/common/AiDisclaimer';
import { FileChips, FileAttachButton } from '@/shared/components/FileAttachmentInput';
import { useFileUpload } from '@/shared/hooks/useFileUpload';

const MINDMAP_FORM_PERSIST = 'create-mindmap-form';

const CreateMindmapPage = () => {
  const { t } = useTranslation('mindmap');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { generateMindmap, isGenerating: isFlowGenerating } = useGenerateMindmapFlow();
  const { models } = useModels(MODEL_TYPES.TEXT);
  const [error, setError] = useState<string | null>(null);
  const { attachedFiles, setAttachedFiles, isUploadingFiles, uploadFiles } = useFileUpload({
    totalSizeTooLargeMessage: t('generate.fileUpload.totalSizeTooLarge'),
    uploadErrorMessage: t('generate.fileUpload.uploadError'),
  });
  const persistedData = useMemo(() => getLocalStorageData(MINDMAP_FORM_PERSIST), []);

  const form = useForm<CreateMindmapFormData>({
    defaultValues: {
      topic: '',
      model: {
        name: '',
        provider: '',
      },
      language: 'vi',
      maxDepth: 3,
      maxBranchesPerNode: 5,
      educationMode: false,
      grade: '',
      subject: '',
      chapter: '',
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

  const showExamplePrompts = watch('topic').trim() === '' && attachedFiles.length === 0 && !isAdvancedOpen;

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
      topic: formData.topic || undefined,
      fileUrls: attachedFiles.length > 0 ? attachedFiles.map((f) => f.url) : undefined,
      model: formData.model.name,
      provider: formData.model.provider,
      language: formData.language,
      maxDepth: formData.maxDepth,
      maxBranchesPerNode: formData.maxBranchesPerNode,
      grade: formData.grade || undefined,
      subject: formData.subject || undefined,
      chapter: formData.chapter || undefined,
    };
  };

  const onSubmit = async (data: CreateMindmapFormData) => {
    const hasTopic = data.topic.trim().length > 0;
    const hasFiles = attachedFiles.length > 0;
    if (!hasTopic && !hasFiles) return;

    setError(null);

    // Education Mode validation
    if (data.educationMode) {
      if (!data.grade) {
        setError(t('create.educationMode.gradeRequired'));
        return;
      }
      if (!data.subject) {
        setError(t('create.educationMode.subjectRequired'));
        return;
      }
      if (!data.chapter) {
        setError(t('create.educationMode.chapterRequired'));
        return;
      }
    }

    try {
      const apiRequest = transformToApiRequest(data);

      const mindmap = await generateMindmap(apiRequest, {
        layoutType: 'horizontal-balanced',
        basePosition: { x: 0, y: 0 },
      });

      // Navigate to the mindmap details page
      navigate(`/mindmap/${mindmap.id}`);
      setValue('topic', '');
      setAttachedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
      console.error('Mindmap generation failed:', err);
    }
  };

  return (
    <div className="lg:w-4xl flex min-h-[calc(100vh-1rem)] flex-col items-center justify-center gap-4 self-center py-12 sm:w-full">
      <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('create.title')}</h1>
      <ResourceTypeSwitcher />
      <h2 className="text-xl font-bold leading-10 text-sky-500/80">{t('create.subtitle')}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <Card className="w-full">
          <CardContent>
            <div className="flex flex-col gap-4">
              <CardTitle className="text-medium">{t('create.promptTitle')}</CardTitle>
              <div className="border-primary rounded border-2 px-2 pt-2">
                {/* File chips — above the textarea */}
                <FileChips
                  attachedFiles={attachedFiles}
                  onRemove={(url) => setAttachedFiles((prev) => prev.filter((f) => f.url !== url))}
                />

                <Controller
                  name="topic"
                  control={control}
                  rules={{ maxLength: 500 }}
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

                {/* Bottom toolbar: file button + model */}
                <div className="my-2 flex flex-row gap-1">
                  <FileAttachButton
                    onFilesSelected={uploadFiles}
                    isUploading={isUploadingFiles}
                    buttonLabel={t('generate.fileUpload.attachFiles')}
                    uploadingLabel={t('generate.fileUpload.uploading')}
                  />
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
            <ExamplePrompts
              onExampleClick={handleExampleClick}
              isShown={showExamplePrompts}
              type={EXAMPLE_PROMPT_TYPE.MINDMAP}
              fallbackPrompts={mindmapExamplePrompts}
              title={t('create.examples.title')}
            />

            <EducationModeSection control={control} setValue={setValue} ns="mindmap" keyPrefix="create" />
            <AdvancedOptions control={control} isOpen={isAdvancedOpen} onToggle={toggleAdvancedOptions} />
          </CardContent>
        </Card>

        {error && <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="mt-4">
          <AiDisclaimer />
        </div>

        <Button
          type="submit"
          className="mt-4 w-full"
          disabled={
            (!watch('topic').trim() && attachedFiles.length === 0) || isFlowGenerating || isUploadingFiles
          }
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isFlowGenerating ? t('create.generating') : t('create.generateMindmap')}
        </Button>
      </form>
    </div>
  );
};

export default CreateMindmapPage;
