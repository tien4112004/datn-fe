import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import type { AssignmentFormData } from '../../types';

// Subject options - you can move these to a constants file
const SUBJECTS = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'computer', label: 'Computer Science' },
  { value: 'other', label: 'Other' },
];

// Grade options
const GRADES = [
  { value: '1', label: 'Grade 1' },
  { value: '2', label: 'Grade 2' },
  { value: '3', label: 'Grade 3' },
  { value: '4', label: 'Grade 4' },
  { value: '5', label: 'Grade 5' },
  { value: '6', label: 'Grade 6' },
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
];

export const AssignmentMetadataPanel = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadata' });
  const { register, watch, setValue } = useFormContext<AssignmentFormData>();

  const shuffleQuestions = watch('shuffleQuestions');
  const subject = watch('subject');
  const grade = watch('grade');

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
            placeholder={t('fields.titlePlaceholder', { defaultValue: 'Assignment title' })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subject" className="text-xs text-gray-600 dark:text-gray-400">
              {t('fields.subject')}
            </Label>
            <Select value={subject} onValueChange={(value) => setValue('subject', value)}>
              <SelectTrigger id="subject" className="mt-1.5 h-9 text-sm">
                <SelectValue
                  placeholder={t('fields.subjectPlaceholder', { defaultValue: 'Select subject' })}
                />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj.value} value={subj.value}>
                    {subj.label}
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
                <SelectValue placeholder={t('fields.gradePlaceholder', { defaultValue: 'Select grade' })} />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
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
            placeholder={t('fields.descriptionPlaceholder', { defaultValue: 'Assignment description' })}
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
