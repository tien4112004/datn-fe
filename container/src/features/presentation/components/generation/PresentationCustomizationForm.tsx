import { Controller } from 'react-hook-form';
import type { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  Palette,
  Briefcase,
  GraduationCap,
  Sparkles,
  Square,
  Monitor,
  BookText,
  AlignLeft,
  AlignCenter,
  AlignJustify,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModelSelect } from '@/components/common/ModelSelect';
import { useModels } from '@/features/model';
import type { UnifiedFormData } from '../../contexts/PresentationFormContext';
import { useCallback } from 'react';
import useOutlineStore from '../../stores/useOutlineStore';

type CustomizationFormData = {
  theme: string;
  contentLength: string;
  imageModel: string;
};

interface PresentationCustomizationFormProps {
  control: Control<CustomizationFormData>;
  watch: UseFormWatch<CustomizationFormData>;
  setValue: UseFormSetValue<CustomizationFormData>;
}

interface ThemeSectionProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
  disabled?: boolean;
}

interface ContentSectionProps {
  selectedContentLength: string;
  onContentLengthSelect: (length: string) => void;
  disabled?: boolean;
}

interface ImageModelSectionProps {
  control: Control<CustomizationFormData>;
}

const ThemeSection = ({ selectedTheme, onThemeSelect, disabled = false }: ThemeSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });

  const themes = [
    { name: 'business', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'education', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'creative', icon: <Sparkles className="h-5 w-5" /> },
    { name: 'minimal', icon: <Square className="h-5 w-5" /> },
    { name: 'modern', icon: <Monitor className="h-5 w-5" /> },
    { name: 'classic', icon: <BookText className="h-5 w-5" /> },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>{t('themeTitle')}</CardTitle>
        <CardDescription>{t('themeDescription')}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" className="shadow-none" type="button" disabled={disabled}>
            <Palette className="h-4 w-4" />
            {t('viewMore')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.name}
              className={`border-muted flex flex-col items-center justify-center rounded-lg border p-4 transition ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'} ${selectedTheme === theme.name ? 'ring-primary ring-2' : ''}`}
              onClick={() => !disabled && onThemeSelect(theme.name)}
            >
              {theme.icon}
              <span className="mt-2 text-sm font-medium">{t(`themes.${theme.name}`)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
};

const ContentSection = ({
  selectedContentLength,
  onContentLengthSelect,
  disabled = false,
}: ContentSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });

  const contentOptions = [
    {
      key: 'short',
      label: t('contentLength.short'),
      desc: t('contentLength.shortDesc'),
      icon: <AlignLeft className="h-5 w-5" />,
    },
    {
      key: 'medium',
      label: t('contentLength.medium'),
      desc: t('contentLength.mediumDesc'),
      icon: <AlignCenter className="h-5 w-5" />,
    },
    {
      key: 'long',
      label: t('contentLength.long'),
      desc: t('contentLength.longDesc'),
      icon: <AlignJustify className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>{t('contentTitle')}</CardTitle>
        <CardDescription>{t('contentDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-4">
          {contentOptions.map((content) => (
            <div
              key={content.key}
              className={`bg-muted border-muted flex flex-col items-center justify-center rounded-lg border p-4 transition ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'} ${selectedContentLength === content.key ? 'ring-primary ring-2' : ''}`}
              onClick={() => !disabled && onContentLengthSelect(content.key)}
            >
              {content.icon}
              <span className="mt-2 text-sm font-medium">{t(`contentLength.${content.key}`)}</span>
              <span className="text-muted-foreground text-xs">{content.desc}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
};

const ImageModelSection = ({ control }: ImageModelSectionProps) => {
  const { t: tCustomization } = useTranslation('presentation', { keyPrefix: 'customization' });
  const { t: tOutline } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();

  return (
    <CardContent className="flex flex-row items-center gap-2">
      <CardTitle>{tCustomization('imageModelsTitle')}</CardTitle>
      <Controller
        name="imageModel"
        control={control}
        render={({ field }) => (
          <ModelSelect
            models={models}
            value={field.value}
            onValueChange={field.onChange}
            placeholder={tOutline('modelPlaceholder')}
            label={tOutline('modelLabel')}
            showProviderLogo={true}
          />
        )}
      />
    </CardContent>
  );
};

/**
 * @deprecated Use `CustomizationSection` instead
 */
const PresentationCustomizationForm = ({ control, watch, setValue }: PresentationCustomizationFormProps) => {
  return (
    <Card className="w-full max-w-3xl">
      <ThemeSection selectedTheme={watch('theme')} onThemeSelect={(theme) => setValue('theme', theme)} />
      <ContentSection
        selectedContentLength={watch('contentLength')}
        onContentLengthSelect={(length) => setValue('contentLength', length)}
      />
      <ImageModelSection control={control} />
    </Card>
  );
};

interface CustomizationSectionProps {
  control: Control<UnifiedFormData>;
  watch: any;
  setValue: any;
  onGeneratePresentation: () => void;
  isGenerating: boolean;
}

const CustomizationSection = ({
  control,
  watch,
  setValue,
  onGeneratePresentation,
  isGenerating,
}: CustomizationSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'workspace' });
  const { t: tCustomization } = useTranslation('presentation', { keyPrefix: 'customization' });
  const { t: tOutline } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const disabled = useOutlineStore((state) => state.isStreaming);
  const { models } = useModels();

  const onThemeSelect = useCallback(
    (theme: string) => {
      setValue('theme', theme);
    },
    [setValue]
  );

  const onContentLengthSelect = useCallback(
    (length: string) => {
      setValue('contentLength', length);
    },
    [setValue]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">{t('customizeSection')}</div>
      <Card className="w-full max-w-3xl">
        <ThemeSection selectedTheme={watch('theme')} onThemeSelect={onThemeSelect} disabled={disabled} />
        <ContentSection
          selectedContentLength={watch('contentLength')}
          onContentLengthSelect={onContentLengthSelect}
          disabled={disabled}
        />
        <CardContent className="flex flex-row items-center gap-2">
          <CardTitle>{tCustomization('imageModelsTitle')}</CardTitle>
          <Controller
            name="imageModel"
            control={control}
            render={({ field }) => (
              <ModelSelect
                models={models}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={tOutline('modelPlaceholder')}
                label={tOutline('modelLabel')}
                showProviderLogo={true}
                disabled={disabled}
              />
            )}
          />
        </CardContent>
      </Card>
      <Button
        className="mt-5"
        type="button"
        onClick={onGeneratePresentation}
        disabled={disabled || isGenerating}
      >
        <Sparkles />
        {isGenerating ? 'Generating...' : t('generatePresentation')}
      </Button>
    </div>
  );
};

export default PresentationCustomizationForm;
export { ImageModelSection, ContentSection, ThemeSection, CustomizationSection };
