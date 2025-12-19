import { Controller, type Control } from 'react-hook-form';
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
import type { ArtStyle } from '@/features/image/types';
import { useCallback, useState, useEffect } from 'react';
import useOutlineStore from '../../stores/useOutlineStore';
import { useSlideThemes } from '../../hooks';
import { ThemePreviewCard } from './ThemePreviewCard';
import ThemeGalleryDialog from './ThemeGalleryDialog';
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
  const { themes, isLoading } = useSlideThemes();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [displayedThemes, setDisplayedThemes] = useState<SlideTheme[]>([]);

  useEffect(() => {
    if (themes.length > 0) {
      setDisplayedThemes(themes.slice(0, 6));
    }
  }, [themes]);

  const handleThemeSelectFromGallery = useCallback(
    (theme: SlideTheme) => {
      setDisplayedThemes((prev) => [theme, ...prev.filter((t) => t.id !== theme.id)].slice(0, 6));
      onThemeSelect(theme);
    },
    [onThemeSelect]
  );

  return (
    <>
      <CardHeader>
        <CardTitle>{t('theme.title')}</CardTitle>
        <CardDescription>{t('theme.description')}</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            className="shadow-none"
            type="button"
            disabled={disabled || isLoading}
            onClick={() => setGalleryOpen(true)}
          >
            <Palette className="h-4 w-4" />
            {t('theme.viewMore')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-muted h-24 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {displayedThemes.map((theme) => (
              <div
                key={theme.id}
                className={cn(
                  'transition-all',
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105',
                  selectedTheme.id === theme.id && 'rounded-lg ring-2 ring-blue-500'
                )}
                onClick={() => !disabled && onThemeSelect(theme)}
              >
                <ThemePreviewCard
                  theme={theme}
                  title={theme.name}
                  isSelected={selectedTheme.id === theme.id}
                />
              </div>
            ))}
          </div>
        )}

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

      <ThemeGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        themes={themes}
        isLoading={isLoading}
        selectedThemeId={selectedTheme.id}
        onThemeSelect={handleThemeSelectFromGallery}
      />
    </>
  );
};

interface ArtSectionProps {
  selectedStyle: ArtStyle;
  onStyleSelect: (style: ArtStyle) => void;
  disabled?: boolean;
}

const ArtSection = ({ selectedStyle, onStyleSelect, disabled = false }: ArtSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });

  const artStyleOptions: Array<{ key: ArtStyle; label: string; preview: string }> = [
    {
      key: '',
      label: t('artStyle.none'),
      preview: 'https://placehold.co/600x400/FFFFFF/31343C?text=None',
    },
    {
      key: 'photorealistic',
      label: t('artStyle.photorealistic'),
      preview: 'https://placehold.co/600x400/667eea/ffffff?text=Photorealistic',
    },
    {
      key: 'digital-art',
      label: t('artStyle.digitalArt'),
      preview: 'https://placehold.co/600x400/f093fb/ffffff?text=Digital+Art',
    },
    {
      key: 'oil-painting',
      label: t('artStyle.oilPainting'),
      preview: 'https://placehold.co/600x400/4facfe/ffffff?text=Oil+Painting',
    },
    {
      key: 'watercolor',
      label: t('artStyle.watercolor'),
      preview: 'https://placehold.co/600x400/43e97b/ffffff?text=Watercolor',
    },
    {
      key: 'anime',
      label: t('artStyle.anime'),
      preview: 'https://placehold.co/600x400/fa709a/ffffff?text=Anime',
    },
    {
      key: 'cartoon',
      label: t('artStyle.cartoon'),
      preview: 'https://placehold.co/600x400/30cfd0/ffffff?text=Cartoon',
    },
    {
      key: 'sketch',
      label: t('artStyle.sketch'),
      preview: 'https://placehold.co/600x400/a8edea/ffffff?text=Sketch',
    },
    {
      key: 'abstract',
      label: t('artStyle.abstract'),
      preview: 'https://placehold.co/600x400/ff9a9e/ffffff?text=Abstract',
    },
    {
      key: 'surreal',
      label: t('artStyle.surreal'),
      preview: 'https://placehold.co/600x400/ffecd2/ffffff?text=Surreal',
    },
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>{t('artStyle.title')}</CardTitle>
        <CardDescription>{t('artStyle.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {artStyleOptions.map((style) => (
            <div
              key={style.key}
              className={cn(
                'group relative overflow-hidden rounded-lg border-2 transition-all',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105',
                selectedStyle === style.key ? 'border-primary shadow-md' : 'border-border'
              )}
              onClick={() => !disabled && onStyleSelect(style.key)}
            >
              {/* Preview gradient/image */}
              <div
                className="h-24 w-full bg-cover bg-center"
                style={{
                  background:
                    style.preview && String(style.preview).startsWith('http')
                      ? `url(${style.preview}) center/cover no-repeat`
                      : (style.preview as string),
                }}
              />

              {/* icon removed */}

              {/* Label section */}
              <div className="bg-card flex items-center justify-center p-2">
                <span className="text-xs font-medium">{style.label}</span>
              </div>
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

  const onArtStyleSelect = useCallback(
    (style: string) => {
      setValue('artStyle', style, { shouldValidate: true, shouldDirty: true });
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
        <ArtSection selectedStyle={watch('artStyle')} onStyleSelect={onArtStyleSelect} disabled={disabled} />
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
export { ContentSection, ThemeSection, ArtSection };
