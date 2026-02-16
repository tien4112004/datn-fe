import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useCreateMatrixTemplate } from '../../hooks/useMatrixTemplateApi';
import { cellsToApiMatrix } from '../../utils/matrixConversion';
import type { MatrixCell, AssignmentTopic } from '../../types';
import type { Grade } from '@aiprimary/core/assessment/grades.js';
import type { SubjectCode } from '@aiprimary/core';

interface MatrixTemplateSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matrix: MatrixCell[];
  topics: AssignmentTopic[];
  subject: SubjectCode | '';
  grade: Grade | '';
}

export const MatrixTemplateSaveDialog = ({
  open,
  onOpenChange,
  matrix,
  topics,
  subject,
  grade,
}: MatrixTemplateSaveDialogProps) => {
  const { t } = useTranslation('assignment');

  const [templateName, setTemplateName] = useState('');
  const createMutation = useCreateMatrixTemplate();

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error(t('matrixTemplateSave.nameRequired', 'Template name is required'));
      return;
    }

    if (!subject || !grade) {
      toast.error(t('matrixTemplateSave.metadataRequired', 'Subject and grade are required'));
      return;
    }

    if (!matrix || !topics || matrix.length === 0 || topics.length === 0) {
      toast.error(t('matrixTemplateSave.matrixEmpty', 'Matrix must have at least one topic and cell'));
      return;
    }

    try {
      // Convert matrix cells to API format
      const apiMatrix = cellsToApiMatrix(matrix, { grade, subject }, topics);

      // Create template
      await createMutation.mutateAsync({
        name: templateName.trim(),
        subject,
        grade,
        matrixData: JSON.stringify(apiMatrix),
      });

      toast.success(t('matrixTemplateSave.saveSuccess', 'Template saved successfully'));
      setTemplateName('');
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('matrixTemplateSave.saveFailed', 'Failed to save template');
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setTemplateName('');
    onOpenChange(false);
  };

  const totalQuestions = matrix?.reduce((sum, cell) => sum + cell.requiredCount, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('matrixTemplateSave.title', 'Save Matrix as Template')}</DialogTitle>
          <DialogDescription>
            {t(
              'matrixTemplateSave.description',
              'Save the current matrix configuration as a reusable template for future assignments.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template name input */}
          <div className="space-y-2">
            <Label htmlFor="template-name">{t('matrixTemplateSave.nameLabel', 'Template Name')}</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t('matrixTemplateSave.namePlaceholder', 'e.g., Grade 1 Math Standard Matrix')}
              maxLength={255}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              {templateName.length}/255 {t('common.characters', 'characters')}
            </p>
          </div>

          {/* Current metadata (read-only) */}
          <div className="space-y-2 rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('matrixTemplateSave.summary', 'Matrix Summary')}
            </h4>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>{t('common.subject', 'Subject')}:</span>
                <span className="font-medium">{subject || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('common.grade', 'Grade')}:</span>
                <span className="font-medium">{String(grade) || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('common.topics', 'Topics')}:</span>
                <span className="font-medium">{topics?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('matrixTemplateSave.totalQuestions', 'Total Questions')}:</span>
                <span className="font-medium">{totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={createMutation.isPending || !templateName.trim()}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('matrixTemplateSave.saving', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('matrixTemplateSave.save', 'Save Template')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
