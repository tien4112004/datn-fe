import { useFormContext } from 'react-hook-form';
import { FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import {
  ColoredCard,
  ColoredCardHeader,
  ColoredCardTitle,
  ColoredCardContent,
} from '@/components/common/ColoredCard';
import type { LessonFormData } from './LessonCreator';

interface BasicInfoSectionProps {
  isPeriodProvided?: boolean;
  isUpdate?: boolean;
}

export const BasicInfoSection = ({ isPeriodProvided, isUpdate }: BasicInfoSectionProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.creator' });
  const {
    register,
    formState: { errors },
  } = useFormContext<LessonFormData>();

  return (
    <ColoredCard colorScheme="blue">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-500 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            {t('sections.basicInfo')}
          </div>
        </ColoredCardTitle>
      </ColoredCardHeader>
      <ColoredCardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
              {t('fields.title')}
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('placeholders.title')}
              className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.title && (
              <p className="animate-in fade-in slide-in-from-top-1 text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-semibold">
              {t('fields.subject')}
            </Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., TOAN, TIENG_VIET"
              disabled={isPeriodProvided || isUpdate}
              className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
            />
            {errors.subject && (
              <p className="animate-in fade-in slide-in-from-top-1 text-sm text-red-500">
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold">
            {t('fields.description')}
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('placeholders.description')}
            rows={3}
            className="border-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </ColoredCardContent>
    </ColoredCard>
  );
};
