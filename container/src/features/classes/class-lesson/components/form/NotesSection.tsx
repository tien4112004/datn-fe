import { useFormContext } from 'react-hook-form';
import { FileText } from 'lucide-react';
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

export const NotesSection = () => {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson.creator' });
  const { register } = useFormContext<LessonFormData>();

  return (
    <ColoredCard colorScheme="amber">
      <ColoredCardHeader>
        <ColoredCardTitle>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-500 p-2 text-white">
              <FileText className="h-5 w-5" />
            </div>
            {t('sections.notes')}
          </div>
        </ColoredCardTitle>
      </ColoredCardHeader>
      <ColoredCardContent>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">{t('sections.notes')}</Label>
          <Textarea
            {...register('notes')}
            placeholder={t('placeholders.notes')}
            rows={4}
            className="border-2 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
      </ColoredCardContent>
    </ColoredCard>
  );
};
