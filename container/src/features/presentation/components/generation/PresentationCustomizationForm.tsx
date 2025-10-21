import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Palette, Sparkles, AlignLeft, AlignCenter, AlignJustify } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ModelSelect } from '@/components/common/ModelSelect';
import { MODEL_TYPES, useModels } from '@/features/model';
import type { UnifiedFormData } from '../../contexts/PresentationFormContext';
import { useCallback } from 'react';
import useOutlineStore from '../../stores/useOutlineStore';
import { getPresentationThemes } from '../../utils';
import { ThemePreviewCard } from './ThemePreviewCard';
import type { SlideTheme } from '../../types/slide';
import { cn } from '@/shared/lib/utils';

interface ThemeSectionProps {
  selectedTheme: SlideTheme;
  onThemeSelect: (theme: SlideTheme) => void;
  disabled?: boolean;
}

interface ContentSectionProps {
  selectedContentLength: string;
  onContentLengthSelect: (length: string) => void;
  disabled?: boolean;
}

const ThemeSection = ({ selectedTheme, onThemeSelect, disabled = false }: ThemeSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });
  const mockThemes = getPresentationThemes();

  // Old theme selection with icons - commented out for preservation
  /*
  const themes = [
    { name: 'business', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'education', icon: <GraduationCap className="h-5 w-5" /> },
    { name: 'creative', icon: <Sparkles className="h-5 w-5" /> },
    { name: 'minimal', icon: <Square className="h-5 w-5" /> },
    { name: 'modern', icon: <Monitor className="h-5 w-5" /> },
    { name: 'classic', icon: <BookText className="h-5 w-5" /> },
  ];
  */

  return (
    <>
      <CardHeader>
        <CardTitle>{t('theme.title')}</CardTitle>
        <CardDescription>{t('theme.description')}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" className="shadow-none" type="button" disabled={disabled}>
            <Palette className="h-4 w-4" />
            {t('theme.viewMore')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {mockThemes.map((theme) => (
            <div
              key={theme.id}
              className={cn(
                'transition-all',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105',
                selectedTheme.id === theme.id && 'rounded-lg ring-2 ring-blue-500'
              )}
              onClick={() => !disabled && onThemeSelect(theme)}
            >
              <ThemePreviewCard theme={theme} title={theme.name} isSelected={selectedTheme.id === theme.id} />
            </div>
          ))}
        </div>

        {/*
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
        */}
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
      label: t('content.short'),
      desc: t('content.shortDesc'),
      icon: <AlignLeft className="h-5 w-5" />,
    },
    {
      key: 'medium',
      label: t('content.medium'),
      desc: t('content.mediumDesc'),
      icon: <AlignCenter className="h-5 w-5" />,
    },
    {
      key: 'long',
      label: t('content.long'),
      desc: t('content.longDesc'),
      icon: <AlignJustify className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>{t('content.title')}</CardTitle>
        <CardDescription>{t('content.description')}</CardDescription>
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
              <span className="mt-2 text-sm font-medium">{t(`content.${content.key}` as never)}</span>
              <span className="text-muted-foreground text-xs">{content.desc}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </>
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
  const { t } = useTranslation('presentation');
  const disabled = useOutlineStore((state) => state.isStreaming);
  const { models } = useModels(MODEL_TYPES.IMAGE);

  const onThemeSelect = useCallback(
    (theme: SlideTheme) => {
      setValue('theme', theme, { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  //   const onContentLengthSelect = useCallback(
  //     (length: string) => {
  //       setValue('contentLength', length);
  //     },
  //     [setValue]
  //   );

  return (
    <div className="flex flex-col gap-4">
      <div className="scroll-m-20 text-xl font-semibold tracking-tight">
        {t('workspace.customizeSection')}
      </div>
      <Card className="w-full max-w-3xl">
        <ThemeSection selectedTheme={watch('theme')} onThemeSelect={onThemeSelect} disabled={disabled} />
        {/* <ContentSection
          selectedContentLength={watch('contentLength')}
          onContentLengthSelect={onContentLengthSelect}
          disabled={disabled}
        /> */}
        <CardContent className="flex flex-row items-center gap-2">
          <CardTitle>{t('customization.imageModels.title')}</CardTitle>
          <Controller
            name="imageModel"
            control={control}
            render={({ field }) => (
              <ModelSelect
                models={models}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('createOutline.model.placeholder')}
                label={t('createOutline.model.label')}
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
        {isGenerating ? t('workspace.generatingPresentation') : t('workspace.generatePresentation')}
      </Button>
    </div>
  );
};

export default CustomizationSection;
export { ContentSection, ThemeSection };
