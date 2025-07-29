import OutlineWorkspace from '@/features/presentation/components/OutlineWorkspace';
import { usePresentationOutlines } from '../hooks/useApi';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
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
import { AutosizeTextarea } from '@/shared/components/ui/autosize-textarea';
import { useForm, Controller } from 'react-hook-form';
import type { OutlineItem } from '../types/outline';

const OutlineWorkspacePage = () => {
  const { outlineItems } = usePresentationOutlines();
  const { t } = useTranslation('presentation', { keyPrefix: 'createOutline' });
  const { control, handleSubmit, setValue, watch } = useForm<{
    slideCount: string;
    style: string;
    model: string;
    prompt: string;
    theme: string;
    contentLength: string;
    imageModel: string;
    items: OutlineItem[];
  }>({
    defaultValues: {
      slideCount: '',
      style: '',
      model: '',
      prompt: '',
      theme: '',
      contentLength: '',
      imageModel: '',
      items: outlineItems, 
    },
  });
  const items = watch('items');
  const setItems = (newItems: OutlineItem[]) => setValue('items', newItems);
  const onSubmit = (data: {
    slideCount: string;
    style: string;
    model: string;
    prompt: string;
    theme: string;
    contentLength: string;
    imageModel: string;
    items: OutlineItem[];
  }) => {
    console.log('Form data:', data);
  };
  return (
    <>
      <SidebarTrigger className="absolute left-4 top-4 z-50" />
      <div className="flex min-h-[calc(100vh-1rem)] w-full max-w-3xl flex-col items-center justify-center self-center p-8">
        <div className="flex flex-col gap-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex w-full flex-row items-center gap-4">
              <div className="scroll-m-20 text-xl font-semibold tracking-tight">Prompt</div>
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
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-card w-fit">
                        <SelectValue placeholder={t('stylePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>{t('styleLabel')}</SelectLabel>
                          <SelectItem value="business">{t('styleBusiness')}</SelectItem>
                          <SelectItem value="education">{t('styleEducation')}</SelectItem>
                          <SelectItem value="creative">{t('styleCreative')}</SelectItem>
                          <SelectItem value="minimal">{t('styleMinimal')}</SelectItem>
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
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <Controller
              name="prompt"
              control={control}
              render={({ field }) => <AutosizeTextarea {...field} />}
            />
            <div className="scroll-m-20 text-xl font-semibold tracking-tight">Outline</div>
            <OutlineWorkspace
              items={items}
              setItems={setItems}
              onDownload={async () => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }}
            />
            <div className="scroll-m-20 text-xl font-semibold tracking-tight">Customize your presentation</div>
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
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </CardContent>
            </Card>
            <Button type="submit">Generate Presentation</Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default OutlineWorkspacePage;
