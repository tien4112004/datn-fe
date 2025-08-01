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

const PresentationCustomizationForm = ({ control, watch, setValue }: PresentationCustomizationFormProps) => {
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { models } = useModels();

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Use one of our popular themes below or view more</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" className="shadow-none">
            <Palette className="h-4 w-4" />
            View more
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          {[
            { name: 'Business', icon: <Briefcase className="h-5 w-5" /> },
            { name: 'Education', icon: <GraduationCap className="h-5 w-5" /> },
            { name: 'Creative', icon: <Sparkles className="h-5 w-5" /> },
            { name: 'Minimal', icon: <Square className="h-5 w-5" /> },
            { name: 'Modern', icon: <Monitor className="h-5 w-5" /> },
            { name: 'Classic', icon: <BookText className="h-5 w-5" /> },
          ].map((theme) => (
            <div
              key={theme.name}
              className={`border-muted flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition hover:scale-105 ${watch('theme') === theme.name ? 'ring-primary ring-2' : ''}`}
              onClick={() => setValue('theme', theme.name)}
            >
              {theme.icon}
              <span className="mt-2 text-sm font-medium">{theme.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>Choose the amount of text you would like</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Short', desc: 'Concise summary', icon: <AlignLeft className="h-5 w-5" /> },
            { label: 'Medium', desc: 'Balanced detail', icon: <AlignCenter className="h-5 w-5" /> },
            { label: 'Long', desc: 'In-depth explanation', icon: <AlignJustify className="h-5 w-5" /> },
          ].map((content) => (
            <div
              key={content.label}
              className={`bg-muted border-muted flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition hover:scale-105 ${watch('contentLength') === content.label ? 'ring-primary ring-2' : ''}`}
              onClick={() => setValue('contentLength', content.label)}
            >
              {content.icon}
              <span className="mt-2 text-sm font-medium">{content.label}</span>
              <span className="text-muted-foreground text-xs">{content.desc}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardContent className="flex flex-row items-center gap-2">
        <CardTitle>Image Models</CardTitle>
        <Controller
          name="imageModel"
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
      </CardContent>
    </Card>
  );
};

export default PresentationCustomizationForm;
