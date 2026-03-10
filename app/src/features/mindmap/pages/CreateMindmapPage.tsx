import { AutosizeTextarea } from '@ui/autosize-textarea';
import { Card, CardContent, CardTitle } from '@ui/card';
import { Label } from '@ui/label';
import ExamplePrompts from '@/features/projects/components/ExamplePrompts';
import ResourceTypeSwitcher from '@/features/projects/components/ResourceTypeSwitcher';
import { Sparkles } from 'lucide-react';
import { Button } from '@ui/button';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
import { LANGUAGE_OPTIONS, MAX_DEPTH_OPTIONS, MAX_BRANCHES_OPTIONS } from '@/features/mindmap/types/form';

const MINDMAP_FORM_PERSIST = 'create-mindmap-form';

const CreateMindmapPage = () => {
  const { t } = useTranslation('mindmap');
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

  const showExamplePrompts = watch('topic').trim() === '' && attachedFiles.length === 0;

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

                {/* Bottom toolbar: file button + language + model */}
                <div className="my-2 flex flex-row gap-1">
                  <FileAttachButton
                    onFilesSelected={uploadFiles}
                    isUploading={isUploadingFiles}
                    buttonLabel={t('generate.fileUpload.attachFiles')}
                    uploadingLabel={t('generate.fileUpload.uploading')}
                  />
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="ml-auto w-fit">
                          <SelectValue placeholder={t('create.language.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(`create.language.${opt.labelKey}` as never)}
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

            {/* Advanced Options - Max Depth and Max Branches */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('create.maxDepth.label')}</Label>
                <Controller
                  name="maxDepth"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_DEPTH_OPTIONS.map((depth) => (
                          <SelectItem key={depth} value={String(depth)}>
                            {depth}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-muted-foreground text-xs">{t('create.maxDepth.description')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('create.maxBranches.label')}</Label>
                <Controller
                  name="maxBranchesPerNode"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MAX_BRANCHES_OPTIONS.map((branches) => (
                          <SelectItem key={branches} value={String(branches)}>
                            {branches}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-muted-foreground text-xs">{t('create.maxBranches.description')}</p>
              </div>
            </div>

            <EducationModeSection control={control} setValue={setValue} ns="mindmap" keyPrefix="create" />
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
