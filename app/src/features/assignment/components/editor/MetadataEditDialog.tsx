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
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

export const MetadataEditDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.metadataDialog' });
  const {
    register,
    formState: { errors },
  } = useFormContext<AssignmentFormData>();
  const isMetadataDialogOpen = useAssignmentEditorStore((state) => state.isMetadataDialogOpen);
  const setMetadataDialogOpen = useAssignmentEditorStore((state) => state.setMetadataDialogOpen);

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
            <Input id="subject" {...register('subject')} placeholder={t('placeholders.subject')} />
            {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">{t('fields.grade')}</Label>
            <Input id="grade" {...register('grade')} placeholder={t('placeholders.grade')} />
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
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>{t('done')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
