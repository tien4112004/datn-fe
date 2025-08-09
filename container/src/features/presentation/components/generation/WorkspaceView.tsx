import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Controller, useForm, type Control } from 'react-hook-form';
import { Sparkles, RotateCcw } from 'lucide-react';
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
import { useModels } from '@/features/model';
import { PRESENTATION_STYLES, SLIDE_COUNT_OPTIONS } from '@/features/presentation/constants';
import type { OutlineData, OutlineItem } from '@/features/presentation/types/outline';
// import { usePresentationOutlines } from '@/features/presentation/hooks/useApi';
import useFetchStreaming from '@/features/presentation/hooks/useFetchStreaming';
import GhostOutlineWorkspace from '@/features/presentation/components/GhostOutlineWorkspace';

type OutlineFormData = {
  slideCount: string;
  style: string;
  model: string;
  prompt: string;
};

type CustomizationFormData = {
  theme: string;
  contentLength: string;
  imageModel: string;
};

interface WorkspaceViewProps {
  initialOutlineData: OutlineData | null;
}

const WorkspaceView = ({ initialOutlineData }: WorkspaceViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });
  // const { outlineItems, refetch, isFetching } = usePresentationOutlines();
  const { outlineItems, isStreaming, startStream } = useFetchStreaming();
  const [items, setItems] = useState<OutlineItem[]>([]);
  const { control: outlineControl, handleSubmit: handleRegenerateSubmit } = useForm<OutlineFormData>({
    defaultValues: {
      slideCount: initialOutlineData?.slideCount || '',
      style: initialOutlineData?.style || '',
      model: initialOutlineData?.model || '',
      prompt: initialOutlineData?.prompt || '',
    },
  });

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
    setItems([...outlineItems]);
    console.log('Outline items updated:', outlineItems);
  }, [isStreaming, outlineItems]);

  const onRegenerateOutline = (data: OutlineFormData) => {
    console.log('Regenerating outline with data:', data);
    // TODO: Implement outline regeneration

    //
    // refetch();
    startStream(data);
  };

  const onSubmitPresentation = (data: CustomizationFormData) => {
    const fullData = {
      ...data,
      items,
    };
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
          onSubmit={handleRegenerateSubmit(onRegenerateOutline)}
        />

        <OutlineSection items={items} setItems={setItems} isFetching={isStreaming} />

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
  onSubmit: (data: OutlineFormData) => void;
}

const OutlineFormSection = ({ control, isFetching, onSubmit }: OutlineFormSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();
  const { handleSubmit } = useForm<OutlineFormData>();

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-row items-center gap-4">
        <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('promptSection')}</div>
        <div className="my-2 flex flex-1 flex-row gap-2">
          <Controller
            name="slideCount"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
          />
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-card w-fit">
                  <SelectValue placeholder={t('modelPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('modelLabel')}</SelectLabel>
                    {models?.map((modelOption) => (
                      <SelectItem key={modelOption.id} value={modelOption.name}>
                        {modelOption.displayName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Button className="ml-auto" type="submit" size="sm" disabled={isFetching}>
          {isFetching ? (
            <>
              <span className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              {t('loading')}
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>{t('regenerate')}</span>
            </>
          )}
        </Button>
      </div>
      <Controller
        name="prompt"
        control={control}
        render={({ field }) => <AutosizeTextarea className="text-lg" {...field} />}
      />
    </form>
  );
};

interface OutlineSectionProps {
  items: OutlineItem[];
  setItems: (items: OutlineItem[]) => void;
  isFetching: boolean;
}

const OutlineSection = ({ items, setItems, isFetching }: OutlineSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });

  return (
    <>
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('outlineSection')}</div>
      {isFetching ? (
        <GhostOutlineWorkspace items={items} />
      ) : (
        <OutlineWorkspace
          items={items}
          setItems={setItems}
          onDownload={async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }}
        />
      )}
    </>
  );
};

interface CustomizationSectionProps {
  control: Control<CustomizationFormData>;
  watch: any;
  setValue: any;
  onSubmit: (data: CustomizationFormData) => void;
}

const CustomizationSection = ({ control, watch, setValue, onSubmit }: CustomizationSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });
  const { handleSubmit } = useForm<CustomizationFormData>();

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
