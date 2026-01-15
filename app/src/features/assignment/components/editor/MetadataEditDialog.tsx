import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

export const MetadataEditDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadataDialog' });
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<AssignmentFormData>();
  const isMetadataDialogOpen = useAssignmentEditorStore((state) => state.isMetadataDialogOpen);
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

  const shuffleQuestions = watch('shuffleQuestions') ?? false;
  const subject = watch('subject');
  const grade = watch('grade');
  const subjects = getAllSubjects();
  const grades = getElementaryGrades();

  const handleClose = () => {
    setMetadataDialogOpen(false);
  };

  return (
    <Dialog open={isMetadataDialogOpen} onOpenChange={setMetadataDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t('fields.title')} <span className="text-red-500">*</span>
            </Label>
            <Input id="title" {...register('title')} placeholder={t('placeholders.title')} />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              {t('fields.subject')} <span className="text-red-500">*</span>
            </Label>
            <Select value={subject} onValueChange={(value) => setValue('subject', value)}>
              <SelectTrigger id="subject">
                <SelectValue placeholder={t('placeholders.subject')} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subjectOption) => (
                  <SelectItem key={subjectOption.code} value={subjectOption.name}>
                    {subjectOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">{t('fields.grade')}</Label>
            <Select value={grade} onValueChange={(value) => setValue('grade', value)}>
              <SelectTrigger id="grade">
                <SelectValue placeholder={t('placeholders.grade')} />
              </SelectTrigger>
              <SelectContent>
                {grades.map((gradeOption) => (
                  <SelectItem key={gradeOption.code} value={gradeOption.code}>
                    {gradeOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('fields.description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('placeholders.description')}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shuffleQuestions"
              checked={shuffleQuestions}
              onCheckedChange={(checked) => setValue('shuffleQuestions', checked as boolean)}
            />
            <Label
              htmlFor="shuffleQuestions"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('fields.shuffleQuestions')}
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleClose}>
            {t('done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
