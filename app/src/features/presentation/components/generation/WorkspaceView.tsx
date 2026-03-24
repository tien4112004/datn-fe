import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import { CircleAlert, Loader2, Paperclip, RotateCcw } from 'lucide-react';
import { getAllGrades, getAllSubjects } from '@aiprimary/core';
import { Label } from '@ui/label';
import OutlineWorkspace from './OutlineWorkspace';
import { AutosizeTextarea } from '@ui/autosize-textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ui/select';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { LANGUAGE_OPTIONS, SLIDE_COUNT_OPTIONS } from '@/features/presentation/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import { useWorkspace } from '@/features/presentation/hooks/useWorkspace';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import CustomizationSection from './PresentationCustomizationForm';
import LoadingButton from '@/components/common/LoadingButton';
import { useCallback, useEffect, memo, useRef } from 'react';
import useOutlineStore from '../../stores/useOutlineStore';
import { UnsavedChangesDialog } from '../UnsavedChangesDialog';
import { useGeneratingBlocker } from '../../hooks/useGeneratingBlocker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { FileChips } from '@/shared/components/FileAttachmentInput';

interface WorkspaceViewProps {
  onWorkspaceEmpty: () => void;
}

const WorkspaceView = ({ onWorkspaceEmpty }: WorkspaceViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });

  const isEmpty = useOutlineStore((state) => state.isEmpty);

  const {
    stopStream,
    clearContent,
    handleRegenerateOutline,
    handleGeneratePresentation,
    isStreaming,
    isGeneratingPresentation,
    outlineError,
    control,
    setValue,
    getValues,
  } = useWorkspace({});

  const { attachedFiles } = usePresentationForm();

  useEffect(() => {
    if (isEmpty() && getValues().topic.trim() === '' && attachedFiles.length === 0 && !isStreaming) {
      onWorkspaceEmpty();
    }
  }, [isEmpty, isStreaming, onWorkspaceEmpty, attachedFiles.length]);

  const { showDialog, setShowDialog, handleStay, handleProceed } = useGeneratingBlocker(stopStream);

  return (
    <>
      <div className="flex min-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col items-center justify-center self-center p-8">
        <div className="flex flex-col gap-4">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('title')}</h1>
          </div>

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <OutlineFormSection
              isFetching={isStreaming}
              stopStream={stopStream}
              clearContent={clearContent}
              onRegenerateOutline={handleRegenerateOutline}
            />

            <OutlineSection error={outlineError} />

            <CustomizationSection
              control={control}
              setValue={setValue}
              onGeneratePresentation={handleGeneratePresentation}
              isGenerating={isStreaming || isGeneratingPresentation}
            />
          </form>
        </div>
      </div>

      <UnsavedChangesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onStay={handleStay}
        onLeave={handleProceed}
      />
    </>
  );
};

interface OutlineFormSectionProps {
  isFetching: boolean;
  stopStream: () => void;
  clearContent: () => void;
  onRegenerateOutline: () => void;
}

const FILE_ACCEPT = '.pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp';

const OutlineFormSection = memo(({ isFetching, onRegenerateOutline }: OutlineFormSectionProps) => {
  const { t, i18n } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels(MODEL_TYPES.TEXT);
  const { control, setValue, attachedFiles, setAttachedFiles, isUploadingFiles, uploadFiles } =
    usePresentationForm();
  const disabled = useOutlineStore((state) => state.isStreaming);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const grades = getAllGrades();
  const subjects = getAllSubjects();

  return (
    <div className="flex flex-col gap-3">
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('promptSection')}</div>

      <div className="bg-card flex flex-col gap-0 rounded-xl border">
        {/* Textarea */}
        <Controller
          name="topic"
          control={control}
          render={({ field }) => (
            <div className="relative px-4 pt-4">
              <AutosizeTextarea className="pr-12 text-lg" {...field} disabled={disabled} />
              <LoadingButton
                type="button"
                size="sm"
                variant="ghost"
                onClick={onRegenerateOutline}
                disabled={disabled || isFetching}
                loading={isFetching}
                className="absolute bottom-4 right-4"
              >
                <RotateCcw className="h-5 w-5" />
              </LoadingButton>
            </div>
          )}
        />

        {/* File attach button + attached file chips */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
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
                disabled={isUploadingFiles || disabled}
                className="text-muted-foreground hover:bg-accent flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border bg-transparent px-2.5 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploadingFiles ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{t('fileUpload.attachFiles')}</TooltipContent>
          </Tooltip>

          <FileChips
            attachedFiles={attachedFiles}
            onRemove={(url) => setAttachedFiles((prev) => prev.filter((f) => f.url !== url))}
          />
        </div>

        <div className="border-t" />

        {/* Controls grid */}
        <div className="flex flex-col gap-4 p-4">
          {/* Row 1: Slides + Model */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('slideCountLabel')}</Label>
              <Controller
                name="slideCount"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                    disabled={disabled}
                  >
                    <SelectTrigger>
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
            </div>

            <div className="col-span-2 space-y-2">
              <Label>{t('model.label')}</Label>
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
                    disabled={disabled}
                  />
                )}
              />
            </div>
          </div>

          {/* Row 2: Language */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('language.label')}</Label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('language.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t('language.label')}</SelectLabel>
                        {LANGUAGE_OPTIONS.map((languageOption) => (
                          <SelectItem key={languageOption.value} value={languageOption.value}>
                            {t(languageOption.labelKey as never)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('grade.label')}</Label>
              <Controller
                name="grade"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue('subject', '');
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('grade.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g.code} value={g.code}>
                          {i18n.language === 'vi' ? g.name : g.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('subject.label')}</Label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ''} onValueChange={field.onChange} disabled={disabled}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('subject.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {isFetching && (
        <div className="flex items-center">
          <CircleAlert className="mr-1 h-4 w-4 text-orange-600" />
          <span className="text-xs text-orange-600">{t('generatingOutlineWarning')}</span>
        </div>
      )}
    </div>
  );
});

OutlineFormSection.displayName = 'OutlineFormSection';

const OutlineSection = memo(({ error }: { error?: string | null }) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });
  const { control } = usePresentationForm();
  const slideCount = useWatch({ control, name: 'slideCount' });

  const handleDownload = useCallback(async () => {
    const markdown = useOutlineStore.getState().markdownContent();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outline.md';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('outlineSection')}</div>
      <OutlineWorkspace onDownload={handleDownload} totalSlide={slideCount} error={error} />
    </div>
  );
});

OutlineSection.displayName = 'OutlineSection';

export { WorkspaceView, OutlineFormSection, OutlineSection };
