import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { useAssignmentEditorStore } from '../../../stores/useAssignmentEditorStore';
import { TopicManager } from './TopicManager';
import { MatrixGrid } from './MatrixGrid';

export const MatrixEditorDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });
  const isMatrixEditorOpen = useAssignmentEditorStore((state) => state.isMatrixEditorOpen);
  const setMatrixEditorOpen = useAssignmentEditorStore((state) => state.setMatrixEditorOpen);

  const handleClose = () => {
    setMatrixEditorOpen(false);
  };

  return (
    <Dialog open={isMatrixEditorOpen} onOpenChange={setMatrixEditorOpen}>
      <DialogContent className="!max-h-[90vh] !max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto py-4">
          {/* Topic Management */}
          <TopicManager />

          {/* Matrix Grid */}
          <MatrixGrid />
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
