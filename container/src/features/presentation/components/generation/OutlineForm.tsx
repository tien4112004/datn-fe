import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardTitle } from '@/shared/components/ui/card';
import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import { useTranslation } from 'react-i18next';
import ExamplePrompts from './ExamplePrompts';
import { PRESENTATION_STYLES, SLIDE_COUNT_OPTIONS } from '@/features/presentation/types';
import { useModels } from '@/features/model';

export interface OutlineFormProps {
  promptInput: string;
  setPromptInput: (val: string) => void;
  slideCount: string | undefined;
  setSlideCount: (val: string) => void;
  style: string | undefined;
  setStyle: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
}

const OutlineForm = ({
  promptInput,
  setPromptInput,
  slideCount,
  setSlideCount,
  style,
  setStyle,
  model,
  setModel,
}: OutlineFormProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();

  function handleExampleClick(example: string) {
    setPromptInput(example);
  }

  return (
    <Card className="w-full">
      <CardContent>
        <div className="flex flex-col gap-4">
          <CardTitle className="text-medium">{t('promptTitle')}</CardTitle>
          <div className="border-primary rounded border-2 px-2 pt-2">
            <AutosizeTextarea
              className="w-full"
              placeholder={t('promptPlaceholder')}
              minHeight={36}
              maxHeight={200}
              variant="ghost"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
            />
            <div className="my-2 flex flex-row gap-1">
              <Select value={slideCount} onValueChange={setSlideCount}>
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
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-fit">
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
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-fit">
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
            </div>
          </div>
        </div>
        <ExamplePrompts onExampleClick={handleExampleClick} promptInput={promptInput} />
      </CardContent>
    </Card>
  );
};

export default OutlineForm;
