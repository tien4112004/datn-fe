import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { Button } from '@ui/button';
import { getAllGrades, getAllSubjects } from '@aiprimary/core';
import { useChapters } from '@/shared/hooks/useChapters';
import type { UpdateChapterPayload } from '@/features/projects/api';

interface EditChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: { grade?: string; subject?: string; chapter?: string };
  onSave: (values: UpdateChapterPayload) => void;
  isPending: boolean;
}

const EditChapterDialog = ({
  open,
  onOpenChange,
  initialValues,
  onSave,
  isPending,
}: EditChapterDialogProps) => {
  const { t, i18n } = useTranslation('glossary');
  const tCommon = useTranslation('common').t;

  const grades = getAllGrades();
  const subjects = getAllSubjects();

  const [grade, setGrade] = useState(initialValues?.grade ?? '');
  const [subject, setSubject] = useState(initialValues?.subject ?? '');
  const [chapter, setChapter] = useState(initialValues?.chapter ?? '');

  const { chapters, isLoading: chaptersLoading } = useChapters(grade, subject);

  // Sync initial values when dialog opens
  useEffect(() => {
    if (open) {
      setGrade(initialValues?.grade ?? '');
      setSubject(initialValues?.subject ?? '');
      setChapter(initialValues?.chapter ?? '');
    }
  }, [open, initialValues?.grade, initialValues?.subject, initialValues?.chapter]);

  // Reset chapter when grade or subject changes
  useEffect(() => {
    setChapter('');
  }, [grade, subject]);

  const handleSave = () => {
    onSave({ grade: grade || undefined, subject: subject || undefined, chapter: chapter || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t('actions.editChapter')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{tCommon('grade')}</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder={tCommon('grade')} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.code} value={g.code}>
                      {i18n.language === 'vi' ? g.name : g.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{tCommon('subject')}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={tCommon('subject')} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">{tCommon('table.presentation.chapter')}</Label>
            <Select
              value={chapter}
              onValueChange={setChapter}
              disabled={!grade || !subject || chaptersLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !grade || !subject
                      ? tCommon('grade') + ' & ' + tCommon('subject') + ' required'
                      : chaptersLoading
                        ? '...'
                        : chapters.length === 0
                          ? '---'
                          : tCommon('table.presentation.chapter')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.name}>
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t('states.loading') : t('actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChapterDialog;
