import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import { CircleAlert, File, Loader2, Paperclip, RotateCcw, X } from 'lucide-react';
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
import { getAllGrades, getAllSubjects } from '@aiprimary/core';
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
import { formatFileSize } from '@/shared/components/FileAttachmentInput';

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

            <OutlineSection />

            <CustomizationSection
              control={control}
              setValue={setValue}
              onGeneratePresentation={handleGeneratePresentation}
              isGenerating={isStreaming}
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
  const { control, attachedFiles, setAttachedFiles, isUploadingFiles, uploadFiles } = usePresentationForm();
  const disabled = useOutlineStore((state) => state.isStreaming);
  const grades = getAllGrades();
  const subjects = getAllSubjects();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full flex-row items-center gap-4">
        <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('promptSection')}</div>
        <div className="my-2 flex flex-1 flex-row gap-2">
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
                disabled={disabled}
              >
                <SelectTrigger className="bg-card w-fit">
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
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <SelectTrigger className="w-fit">
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
          <Controller
            name="grade"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                disabled={disabled}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder={t('grade.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('grade.label')}</SelectLabel>
                    <SelectItem value="none">{t('grade.none')}</SelectItem>
                    {grades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {i18n.language === 'vi' ? g.name : g.nameEn}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || 'none'}
                onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}
                disabled={disabled}
              >
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder={t('subject.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('subject.label')}</SelectLabel>
                    <SelectItem value="none">{t('subject.none')}</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachedFiles.map((file) => (
            <div key={file.url} className="bg-background flex items-center gap-2 rounded-lg border px-3 py-2">
              <File className="text-muted-foreground h-4 w-4 shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="max-w-[200px] truncate text-sm">{file.name}</span>
                </TooltipTrigger>
                <TooltipContent>{file.name}</TooltipContent>
              </Tooltip>
              <span className="text-muted-foreground shrink-0 text-xs">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => setAttachedFiles((prev) => prev.filter((f) => f.url !== file.url))}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground ml-0.5 inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Controller
        name="topic"
        control={control}
        render={({ field }) => (
          <div className="relative">
            <AutosizeTextarea className="pr-12 text-lg" {...field} disabled={disabled} />
            <LoadingButton
              type="button"
              size="sm"
              variant={'ghost'}
              onClick={onRegenerateOutline}
              disabled={disabled || isFetching}
              loading={isFetching}
              className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </LoadingButton>
          </div>
        )}
      />
      <div className="flex w-full justify-between">
        {/* // Warning user to not navigate while generating */}
        {isFetching && (
          <div className="flex items-center">
            <CircleAlert className="mr-1 h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-600">{t('generatingOutlineWarning')}</span>
          </div>
        )}
      </div>
    </div>
  );
});

OutlineFormSection.displayName = 'OutlineFormSection';

const OutlineSection = memo(() => {
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
      <OutlineWorkspace onDownload={handleDownload} totalSlide={slideCount} />
    </div>
  );
});

OutlineSection.displayName = 'OutlineSection';

export { WorkspaceView, OutlineFormSection, OutlineSection };
