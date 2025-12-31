import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';
import { useCreateMatrix, useUpdateMatrix } from '@/features/exam-matrix/hooks/useExamMatrixApi';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import { toast } from 'sonner';
import { generateId } from '@/shared/lib/utils';
import { MatrixConfigForm } from './MatrixConfigForm';
import { TopicManagementDialog } from './TopicManagementDialog';
import { MatrixGridEditor } from './MatrixGridEditor';
import { MatrixPreviewTable } from './MatrixPreviewTable';

interface MatrixBuilderDialogProps {
  open: boolean;
  matrix: ExamMatrix | null; // null for create mode
  onClose: () => void;
}

export const MatrixBuilderDialog = ({ open, matrix, onClose }: MatrixBuilderDialogProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, setCurrentMatrix } = useExamMatrixStore();
  const [activeTab, setActiveTab] = useState<'configuration' | 'preview'>('configuration');
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [gridEditorOpen, setGridEditorOpen] = useState(false);

  const createMutation = useCreateMatrix();
  const updateMutation = useUpdateMatrix();

  // Initialize current matrix when dialog opens
  useEffect(() => {
    if (open) {
      if (matrix) {
        // Edit mode
        setCurrentMatrix(matrix);
      } else {
        // Create mode - initialize empty matrix
        setCurrentMatrix({
          id: generateId(),
          name: '',
          description: '',
          subjectCode: 'T',
          targetTotalPoints: 100,
          topics: [],
          cells: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setActiveTab('configuration');
    }
  }, [open, matrix, setCurrentMatrix]);

  const handleSave = async () => {
    if (!currentMatrix) return;

    // Basic validation
    if (!currentMatrix.name.trim()) {
      toast.error(t('validation.nameRequired'));
      return;
    }

    if (currentMatrix.targetTotalPoints <= 0) {
      toast.error(t('validation.targetPointsPositive'));
      return;
    }

    if (currentMatrix.topics.length === 0) {
      toast.error(t('validation.noTopics'));
      return;
    }

    if (currentMatrix.cells.length === 0) {
      toast.error(t('validation.noCells'));
      return;
    }

    try {
      if (matrix) {
        // Update existing matrix
        await updateMutation.mutateAsync({
          id: currentMatrix.id,
          data: { matrix: currentMatrix },
        });
        toast.success(t('messages.updated'));
      } else {
        // Create new matrix
        const { id, createdAt, updatedAt, ...matrixData } = currentMatrix;
        await createMutation.mutateAsync({ matrix: matrixData });
        toast.success(t('messages.created'));
      }
      onClose();
    } catch (error) {
      console.error('Error saving matrix:', error);
      toast.error(t('messages.error'));
    }
  };

  const handleCancel = () => {
    setCurrentMatrix(null);
    onClose();
  };

  if (!currentMatrix) return null;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="flex max-h-[90vh] !max-w-6xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{matrix ? t('builder.editTitle') : t('builder.createTitle')}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configuration">{t('builder.tabs.configuration')}</TabsTrigger>
            <TabsTrigger value="preview">{t('builder.tabs.preview')}</TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="mt-4 flex-1 space-y-6 overflow-auto">
            <MatrixConfigForm
              onOpenTopicManager={() => setTopicManagerOpen(true)}
              onOpenGridEditor={() => setGridEditorOpen(true)}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4 flex-1 overflow-auto">
            <MatrixPreviewTable />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            {t('builder.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : t('builder.actions.save')}
          </Button>
        </div>
      </DialogContent>

      {/* Topic Management Dialog */}
      <TopicManagementDialog open={topicManagerOpen} onClose={() => setTopicManagerOpen(false)} />

      {/* Grid Editor Dialog */}
      <MatrixGridEditor open={gridEditorOpen} onClose={() => setGridEditorOpen(false)} />
    </Dialog>
  );
};
