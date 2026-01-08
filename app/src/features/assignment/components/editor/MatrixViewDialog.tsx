import { useFormContext } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { DIFFICULTY } from '@aiprimary/core';
import { DIFFICULTY_LABELS } from '../../types';
import type { AssignmentFormData, MatrixCell } from '../../types';

const getCellStatus = (cell: MatrixCell): 'valid' | 'warning' | 'empty' => {
  if (cell.requiredCount === 0) return 'empty';
  if (cell.currentCount >= cell.requiredCount) return 'valid';
  return 'warning';
};

export const MatrixViewDialog = () => {
  const { watch } = useFormContext<AssignmentFormData>();
  const isMatrixViewOpen = useAssignmentEditorStore((state) => state.isMatrixViewOpen);
  const setMatrixViewOpen = useAssignmentEditorStore((state) => state.setMatrixViewOpen);

  const topics = watch('topics');
  const matrixCells = watch('matrixCells');
  const questions = watch('questions');

  const difficulties = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.SUPER_HARD];

  const totalRequired = matrixCells.reduce((sum, cell) => sum + cell.requiredCount, 0);
  const totalCurrent = questions.length;

  const handleClose = () => {
    setMatrixViewOpen(false);
  };

  return (
    <Dialog open={isMatrixViewOpen} onOpenChange={setMatrixViewOpen}>
      <DialogContent className="max-h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle>Assessment Matrix</DialogTitle>
          <DialogDescription>
            View the complete assessment matrix showing required vs current question counts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Summary Stats */}
          <div className="mb-4 flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {topics.length} Topics
            </Badge>
            <Badge variant="outline" className="text-sm">
              {totalCurrent} / {totalRequired} Questions
            </Badge>
            <div className="ml-auto flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>Valid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-orange-500" />
                <span>Warning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-gray-300" />
                <span>Empty</span>
              </div>
            </div>
          </div>

          {/* Full Matrix Table */}
          <div className="overflow-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="border-r p-3 text-left font-semibold">Topic</th>
                  {difficulties.map((diff) => (
                    <th key={diff} className="p-3 text-center font-semibold">
                      {DIFFICULTY_LABELS[diff]}
                    </th>
                  ))}
                  <th className="p-3 text-center font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, topicIdx) => {
                  const topicCells = difficulties.map(
                    (diff) =>
                      matrixCells.find((c) => c.topicId === topic.id && c.difficulty === diff) || {
                        id: '',
                        topicId: topic.id,
                        difficulty: diff,
                        requiredCount: 0,
                        currentCount: 0,
                      }
                  );
                  const topicTotal = topicCells.reduce((sum, c) => sum + c.requiredCount, 0);
                  const topicCurrent = topicCells.reduce((sum, c) => sum + c.currentCount, 0);

                  return (
                    <tr
                      key={topic.id}
                      className={
                        topicIdx % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'
                      }
                    >
                      <td className="border-r p-3 font-medium">{topic.name}</td>
                      {topicCells.map((cell) => {
                        const status = getCellStatus(cell as MatrixCell);
                        const bgColorMap = {
                          valid: 'bg-green-100 dark:bg-green-900',
                          warning: 'bg-orange-100 dark:bg-orange-900',
                          empty: 'bg-gray-100 dark:bg-gray-800',
                        };
                        return (
                          <td key={cell.difficulty} className="p-3 text-center">
                            <div className={`inline-block rounded px-3 py-1 ${bgColorMap[status]}`}>
                              {cell.requiredCount > 0 ? `${cell.currentCount} / ${cell.requiredCount}` : '-'}
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-medium">
                        {topicTotal > 0 ? `${topicCurrent} / ${topicTotal}` : '-'}
                      </td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="border-t-2 bg-gray-100 font-semibold dark:bg-gray-800">
                  <td className="border-r p-3">Total</td>
                  {difficulties.map((diff) => {
                    const diffCells = matrixCells.filter((c) => c.difficulty === diff);
                    const diffRequired = diffCells.reduce((sum, c) => sum + c.requiredCount, 0);
                    const diffCurrent = diffCells.reduce((sum, c) => sum + c.currentCount, 0);
                    return (
                      <td key={diff} className="p-3 text-center">
                        {diffRequired > 0 ? `${diffCurrent} / ${diffRequired}` : '-'}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center">
                    {totalCurrent} / {totalRequired}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
