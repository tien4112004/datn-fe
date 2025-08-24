import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Controller, useForm, type Control } from 'react-hook-form';
import { Sparkles, RotateCcw, Square, Trash2 } from 'lucide-react';
import OutlineWorkspace from './OutlineWorkspace';
import PresentationCustomizationForm from './PresentationCustomizationForm';
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
import { ModelSelect } from '@/shared/components/ModelSelect';
import { SLIDE_COUNT_OPTIONS } from '@/features/presentation/types';
import type { OutlineData } from '@/features/presentation/types/outline';
import useFetchStreamingOutline from '@/features/presentation/hooks/useFetchStreaming';
// import { useOutlineContext } from '../../context/OutlineContext';
import useOutlineStore from '@/features/presentation/stores/useOutlineStore';
import { useModels } from '@/features/model';

type OutlineFormData = {
  topic: string;
  slideCount: number;
  language: string;
  model: string;
  targetAge: string;
  learningObjective: string;
};

type CustomizationFormData = {
  theme: string;
  contentLength: string;
  imageModel: string;
};

interface WorkspaceViewProps {
  initialOutlineData: OutlineData;
}

const WorkspaceView = ({ initialOutlineData }: WorkspaceViewProps) => {
  // const { outlineItems, refetch, isFetching } = usePresentationOutlines();
  // const { content, setContent } = useOutlineContext();
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });

  // API
  const {
    processedData: outlineItems,
    isStreaming,
    error,
    stopStream,
    restartStream,
    clearContent,
  } = useFetchStreamingOutline(initialOutlineData);

  if (error) {
    throw new Error(`Error fetching outline: ${error}`);
  }

  //   // STORE
  //   const content = useOutlineStore((state) => state.content);
  const markdownContent = useOutlineStore((state) => state.markdownContent);
  const setContent = useOutlineStore((state) => state.setContent);
  const startStream = useOutlineStore((state) => state.startStreaming);
  const endStream = useOutlineStore((state) => state.endStreaming);

  // OUTLINE FORM
  const { control: outlineControl, handleSubmit: handleRegenerateSubmit } = useForm<OutlineFormData>({
    defaultValues: initialOutlineData,
  });

  // CUSTOMIZATION FORM
  const {
    control: customizationControl,
    setValue,
    watch,
    handleSubmit: handleCustomizationSubmit,
  } = useForm<CustomizationFormData>({
    defaultValues: {
      theme: '',
      contentLength: '',
      imageModel: '',
    },
  });

  useEffect(() => {
    if (isStreaming) {
      startStream();
      setContent([...outlineItems]);
    } else {
      endStream();
    }
  }, [isStreaming, outlineItems]);

  const onRegenerateOutline = (data: OutlineFormData) => {
    console.log('Regenerating outline with data:', data);

    //
    // refetch();
    // startStream(data);
    restartStream(data);
  };

  const onSubmitPresentation = (_data: CustomizationFormData) => {
    // const fullData = {
    //   ...data,
    //   content,
    // };
    // const fullData = mapOutlineItemsToMarkdown(content);
    const fullData = markdownContent();
    console.log('Form data:', fullData);
  };

  return (
    <div className="flex min-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col items-center justify-center self-center p-8">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-bold leading-10 text-neutral-900">{t('title')}</h1>
        </div>

        <OutlineFormSection
          control={outlineControl}
          isFetching={isStreaming}
          stopStream={stopStream}
          clearContent={clearContent}
          onSubmit={handleRegenerateSubmit(onRegenerateOutline)}
        />

        <OutlineSection />

        <CustomizationSection
          control={customizationControl}
          watch={watch}
          setValue={setValue}
          onSubmit={handleCustomizationSubmit(onSubmitPresentation)}
        />
      </div>
    </div>
  );
};

interface OutlineFormSectionProps {
  control: Control<OutlineFormData>;
  isFetching: boolean;
  stopStream: () => void;
  clearContent: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const OutlineFormSection = ({
  control,
  isFetching,
  stopStream,
  clearContent,
  onSubmit,
}: OutlineFormSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
          {/* <Controller
            name="style"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-card w-fit">
                  <SelectValue placeholder={t('stylePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('styleLabel')}</SelectLabel>
                    {PRESENTATION_STYLES.map((styleOption) => (
                      <SelectItem key={styleOption.value} value={styleOption.value}>
                        {t(styleOption.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          /> */}
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
              />
            )}
            // render={({ field }) => (
            //   <Select value={field.value} onValueChange={field.onChange}>
            //     <SelectTrigger className="bg-card w-fit">
            //       <SelectValue placeholder={t('modelPlaceholder')} />
            //     </SelectTrigger>
            //     <SelectContent>
            //       <SelectGroup>
            //         <SelectLabel>{t('modelLabel')}</SelectLabel>
            //         {models?.map((modelOption) => (
            //           <SelectItem
            //             key={modelOption.id}
            //             value={modelOption.name}
            //             disabled={!modelOption.enabled}
            //             className={!modelOption.enabled ? 'opacity-50' : ''}
            //           >
            //             {modelOption.displayName}
            //           </SelectItem>
            //         ))}
            //       </SelectGroup>
            //     </SelectContent>
            //   </Select>
            // )}
          />
        </div>
      </div>
      <Controller
        name="topic"
        control={control}
        render={({ field }) => <AutosizeTextarea className="text-lg" {...field} />}
      />
      <div className="flex flex-row gap-2">
        {isFetching && (
          <Button size="sm" type="button" onClick={stopStream} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            <span>{t('stop')}</span>
          </Button>
        )}

        <Button type="submit" size="sm" disabled={isFetching} hidden={isFetching}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>{t('regenerate')}</span>
        </Button>

        <Button type="button" size="sm" onClick={clearContent} disabled={isFetching}>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Clear</span>
        </Button>
      </div>
    </form>
  );
};

// interface OutlineSectionProps {
//   isFetching: boolean;
// }

const OutlineSection = () => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });

  return (
    <>
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('outlineSection')}</div>
      <OutlineWorkspace
        onDownload={async () => {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }}
      />
    </>
  );
};

interface CustomizationSectionProps {
  control: Control<CustomizationFormData>;
  watch: any;
  setValue: any;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const CustomizationSection = ({ control, watch, setValue, onSubmit }: CustomizationSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('customizeSection')}</div>
      <PresentationCustomizationForm control={control} watch={watch} setValue={setValue} />
      <Button className="mt-5" type="submit">
        <Sparkles />
        {t('generatePresentation')}
      </Button>
    </form>
  );
};

export default WorkspaceView;
export { OutlineFormSection, OutlineSection, CustomizationSection };
