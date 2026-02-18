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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

export const MetadataEditDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadataDialog' });

  // Get data and actions from stores
  const title = useAssignmentFormStore((state) => state.title);
  const description = useAssignmentFormStore((state) => state.description);
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const setTitle = useAssignmentFormStore((state) => state.setTitle);
  const setDescription = useAssignmentFormStore((state) => state.setDescription);
  const setSubject = useAssignmentFormStore((state) => state.setSubject);
  const setGrade = useAssignmentFormStore((state) => state.setGrade);
  const isMetadataDialogOpen = useAssignmentEditorStore((state) => state.isMetadataDialogOpen);
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('placeholders.title')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              {t('fields.subject')} <span className="text-red-500">*</span>
            </Label>
            <Select value={subject} onValueChange={setSubject}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">{t('fields.grade')}</Label>
            <Select value={grade} onValueChange={setGrade}>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('placeholders.description')}
              rows={3}
            />
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
