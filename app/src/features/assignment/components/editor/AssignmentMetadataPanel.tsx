import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import type { AssignmentFormData } from '../../types';

export const AssignmentMetadataPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadata' });
  const { register, watch, setValue } = useFormContext<AssignmentFormData>();

  const shuffleQuestions = watch('shuffleQuestions');
  const subject = watch('subject');
  const grade = watch('grade');

  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('panelTitle')}</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-xs text-gray-600 dark:text-gray-400">
            {t('fields.title')}
          </Label>
          <Input
            id="title"
            {...register('title')}
            className="mt-1.5 h-9 text-sm"
            placeholder={t('fields.titlePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subject" className="text-xs text-gray-600 dark:text-gray-400">
              {t('fields.subject')}
            </Label>
            <Select value={subject} onValueChange={(value) => setValue('subject', value)}>
              <SelectTrigger id="subject" className="mt-1.5 h-9 text-sm">
                <SelectValue placeholder={t('fields.subjectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.code} value={subj.code}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="grade" className="text-xs text-gray-600 dark:text-gray-400">
              {t('fields.grade')}
            </Label>
            <Select value={grade} onValueChange={(value) => setValue('grade', value)}>
              <SelectTrigger id="grade" className="mt-1.5 h-9 text-sm">
                <SelectValue placeholder={t('fields.gradePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g.code} value={g.code}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-xs text-gray-600 dark:text-gray-400">
            {t('fields.description')}
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            className="mt-1.5 text-sm"
            rows={4}
            placeholder={t('fields.descriptionPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Switch
            id="shuffle"
            checked={shuffleQuestions}
            onCheckedChange={(checked) => setValue('shuffleQuestions', checked)}
          />
          <Label htmlFor="shuffle" className="text-sm text-gray-700 dark:text-gray-300">
            {t('fields.shuffleQuestions')}
          </Label>
        </div>
      </div>
    </div>
  );
};
