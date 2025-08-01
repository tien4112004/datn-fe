import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
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
import { PRESENTATION_STYLES } from '@/features/presentation/constants/styles';
import type { OutlineData, OutlineItem } from '@/features/presentation/types/outline';
import { usePresentationOutlines } from '@/features/presentation/hooks/useApi';

interface WorkspaceViewProps {
  initialOutlineData: OutlineData | null;
}

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

const WorkspaceView = ({
  initialOutlineData,
}: WorkspaceViewProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();
  const { 
    outlineItems, 
    // refetch,
    isFetching,
  } = usePresentationOutlines();
  const [items, setItems] = useState<OutlineItem[]>([]);
  const { control: outlineControl, handleSubmit: handleOutlineSubmit } = useForm<OutlineFormData>({
    defaultValues: {
      slideCount: initialOutlineData?.slideCount || '',
      style: initialOutlineData?.style || '',
      model: initialOutlineData?.model || '',
      prompt: initialOutlineData?.prompt || '',
    },
  });

  const { control: customizationControl, handleSubmit: handleCustomizationSubmit, setValue, watch } = useForm<CustomizationFormData>({
    defaultValues: {
      theme: '',
      contentLength: '',
      imageModel: '',
    },
  });

  useEffect(() => {
    setItems([...outlineItems]); 
  }, [isFetching]);

  const onRegenerateOutline = (data: OutlineFormData) => {
    console.log('Regenerating outline with data:', data);
    // TODO: Implement outline regeneration

    // 
    // refetch()
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
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold leading-10 text-neutral-900">Customize Your Presentation</h1>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleOutlineSubmit(onRegenerateOutline)}>
          <div className="flex w-full flex-row items-center gap-4">
            <div className="scroll-m-20 text-xl font-semibold tracking-tight">Prompt</div>
            <div className="my-2 flex flex-1 flex-row gap-2">
              <Controller
                name="slideCount"
                control={outlineControl}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-card w-fit">
                      <SelectValue placeholder={t('slideCountPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{t('slideCountLabel')}</SelectLabel>
                        {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 36].map((num) => (
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
                control={outlineControl}
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
                control={outlineControl}
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
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading...
              </>
              ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Regenerate</span>
              </>
              )}
            </Button>
          </div>
          <Controller
            name="prompt"
            control={outlineControl}
            render={({ field }) => <AutosizeTextarea className="text-lg" {...field} />}
          />
        </form>

        <div className="scroll-m-20 text-xl font-semibold tracking-tight">Outline</div>
        {isFetching ? (
          <div className="flex w-full items-center justify-center py-12">
            <span className="animate-spin mr-2 h-6 w-6 border-4 border-primary border-t-transparent rounded-full inline-block" />
            <span className="text-lg font-medium">Loading outline...</span>
          </div>
        ) : (
          <OutlineWorkspace
            items={items}
            setItems={setItems}
            onDownload={async () => {
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }}
          />
        )}

        <form className="flex flex-col gap-4" onSubmit={handleCustomizationSubmit(onSubmitPresentation)}>
          <div className="scroll-m-20 text-xl font-semibold tracking-tight">Customize your presentation</div>
          <PresentationCustomizationForm
            control={customizationControl}
            watch={watch}
            setValue={setValue}
          />
          <Button className="mt-5" type="submit">
            <Sparkles />
            Generate Presentation
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceView;
