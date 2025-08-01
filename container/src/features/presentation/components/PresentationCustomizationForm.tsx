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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useModels } from '@/features/model';

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
}

interface ContentSectionProps {
  selectedContentLength: string;
  onContentLengthSelect: (length: string) => void;
}

interface ImageModelSectionProps {
  control: Control<CustomizationFormData>;
}

const ThemeSection = ({ selectedTheme, onThemeSelect }: ThemeSectionProps) => {
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
          <Button variant="ghost" size="sm" className="shadow-none">
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
              className={`border-muted flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition hover:scale-105 ${selectedTheme === theme.name ? 'ring-primary ring-2' : ''}`}
              onClick={() => onThemeSelect(theme.name)}
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

const ContentSection = ({ selectedContentLength, onContentLengthSelect }: ContentSectionProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'customization' });

  const contentOptions = [
    { label: 'short', desc: 'shortDesc', icon: <AlignLeft className="h-5 w-5" /> },
    { label: 'medium', desc: 'mediumDesc', icon: <AlignCenter className="h-5 w-5" /> },
    { label: 'long', desc: 'longDesc', icon: <AlignJustify className="h-5 w-5" /> },
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
              key={content.label}
              className={`bg-muted border-muted flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition hover:scale-105 ${selectedContentLength === content.label ? 'ring-primary ring-2' : ''}`}
              onClick={() => onContentLengthSelect(content.label)}
            >
              {content.icon}
              <span className="mt-2 text-sm font-medium">{t(`contentLength.${content.label}`)}</span>
              <span className="text-muted-foreground text-xs">{t(`contentLength.${content.desc}`)}</span>
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
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="bg-card w-fit">
              <SelectValue placeholder={tOutline('modelPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{tOutline('modelLabel')}</SelectLabel>
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
    </CardContent>
  );
};

const PresentationCustomizationForm = ({ control, watch, setValue }: PresentationCustomizationFormProps) => {
  return (
    <Card className="w-full max-w-3xl">
      <ThemeSection 
        selectedTheme={watch('theme')} 
        onThemeSelect={(theme) => setValue('theme', theme)} 
      />
      <ContentSection 
        selectedContentLength={watch('contentLength')} 
        onContentLengthSelect={(length) => setValue('contentLength', length)} 
      />
      <ImageModelSection control={control} />
    </Card>
  );
};

export default PresentationCustomizationForm;
