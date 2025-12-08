import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { CircleAlert, RotateCcw, Square, Trash2 } from 'lucide-react';
import OutlineWorkspace from './OutlineWorkspace';
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
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { LANGUAGE_OPTIONS, SLIDE_COUNT_OPTIONS } from '@/features/presentation/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import { useWorkspace } from '@/features/presentation/hooks/useWorkspace';
import { usePresentationForm } from '@/features/presentation/contexts/PresentationFormContext';
import CustomizationSection from './PresentationCustomizationForm';
import LoadingButton from '@/components/common/LoadingButton';
import { useCallback, useEffect, memo } from 'react';
import useOutlineStore from '../../stores/useOutlineStore';
import { UnsavedChangesDialog } from '../UnsavedChangesDialog';
import { useGeneratingBlocker } from '../../hooks/useGeneratingBlocker';

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
    watch,
    setValue,
    getValues,
  } = useWorkspace({});

  useEffect(() => {
    if (isEmpty() && getValues().topic.trim() === '' && !isStreaming) {
      onWorkspaceEmpty();
    }
  }, [isEmpty, isStreaming, onWorkspaceEmpty]);

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
              watch={watch}
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

const OutlineFormSection = memo(
  ({ isFetching, stopStream, clearContent, onRegenerateOutline }: OutlineFormSectionProps) => {
    const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
    const { models } = useModels(MODEL_TYPES.TEXT);
    const { control } = usePresentationForm();
    const disabled = useOutlineStore((state) => state.isStreaming);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-row items-center gap-4">
          <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('promptSection')}</div>
          <div className="my-2 flex flex-1 flex-row gap-2">
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
          </div>
        </div>
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
          <div className="flex flex-row gap-2">
            {isFetching && (
              <Button size="sm" type="button" onClick={() => stopStream()} variant="destructive">
                <Square className="mr-2 h-4 w-4" />
                <span>{t('stop')} (Dev)</span>
              </Button>
            )}

            <Button type="button" size="sm" onClick={clearContent} disabled={isFetching}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear (Dev)</span>
            </Button>
          </div>

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
  }
);

OutlineFormSection.displayName = 'OutlineFormSection';

const OutlineSection = memo(() => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });
  const { watch } = usePresentationForm();
  const slideCount = watch('slideCount', 10);

  const handleDownload = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('outlineSection')}</div>
      <OutlineWorkspace onDownload={handleDownload} totalSlide={slideCount} />
    </div>
  );
});

OutlineSection.displayName = 'OutlineSection';

export default WorkspaceView;
export { OutlineFormSection, OutlineSection };
