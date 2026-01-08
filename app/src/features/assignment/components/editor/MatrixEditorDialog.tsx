import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { TopicManager } from './TopicManager';
import { MatrixGrid } from './MatrixGrid';

export const MatrixEditorDialog = () => {
  const isMatrixEditorOpen = useAssignmentEditorStore((state) => state.isMatrixEditorOpen);
  const setMatrixEditorOpen = useAssignmentEditorStore((state) => state.setMatrixEditorOpen);

  const handleClose = () => {
    setMatrixEditorOpen(false);
  };

  return (
    <Dialog open={isMatrixEditorOpen} onOpenChange={setMatrixEditorOpen}>
      <DialogContent className="max-h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle>Edit Assessment Matrix</DialogTitle>
          <DialogDescription>
            Configure topics and required question counts for each difficulty level. Changes are saved
            automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto py-4">
          {/* Topic Management */}
          <TopicManager />

          {/* Matrix Grid */}
          <MatrixGrid />
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
