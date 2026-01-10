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
import { Badge } from '@/shared/components/ui/badge';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { DIFFICULTY } from '@aiprimary/core';
import type { AssignmentFormData, MatrixCell } from '../../types';

const getCellStatus = (cell: MatrixCell): 'valid' | 'warning' | 'empty' => {
  if (cell.requiredCount === 0) return 'empty';
  if (cell.currentCount >= cell.requiredCount) return 'valid';
  return 'warning';
};

export const MatrixViewDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixView' });
  const { t: tDifficulty } = useTranslation('assignment', { keyPrefix: 'difficulty' });
  const { watch } = useFormContext<AssignmentFormData>();
  const isMatrixViewOpen = useAssignmentEditorStore((state) => state.isMatrixViewOpen);
  const setMatrixViewOpen = useAssignmentEditorStore((state) => state.setMatrixViewOpen);

  const topics = watch('topics');
  const matrixCells = watch('matrixCells');
  const questions = watch('questions');

  const difficulties = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.SUPER_HARD];

  const getDifficultyLabel = (difficulty: string) => {
    const diffMap: Record<string, 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao'> = {
      [DIFFICULTY.EASY]: 'nhanBiet',
      [DIFFICULTY.MEDIUM]: 'thongHieu',
      [DIFFICULTY.HARD]: 'vanDung',
      [DIFFICULTY.SUPER_HARD]: 'vanDungCao',
    };
    const key = diffMap[difficulty] || 'nhanBiet';
    return tDifficulty(key as 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao');
  };

  const totalRequired = matrixCells.reduce((sum, cell) => sum + cell.requiredCount, 0);
  const totalCurrent = questions.length;

  const handleClose = () => {
    setMatrixViewOpen(false);
  };

  return (
    <Dialog open={isMatrixViewOpen} onOpenChange={setMatrixViewOpen}>
      <DialogContent className="!max-h-[90vh] !max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          {/* Summary Stats */}
          <div className="mb-4 flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {t('summary.topics', { count: topics.length })}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {t('summary.questions', { count: totalCurrent })} / {totalRequired}
            </Badge>
            <div className="ml-auto flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-green-500" />
                <span>{t('legend.valid')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-orange-500" />
                <span>{t('legend.warning')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-gray-300" />
                <span>{t('legend.empty')}</span>
              </div>
            </div>
          </div>

          {/* Full Matrix Table */}
          <div className="overflow-auto rounded-lg border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="border-r p-3 text-left font-semibold">{t('tableHeaders.topic')}</th>
                  {difficulties.map((diff) => (
                    <th key={diff} className="p-3 text-center font-semibold">
                      {getDifficultyLabel(diff)}
                    </th>
                  ))}
                  <th className="p-3 text-center font-semibold">{t('tableHeaders.total')}</th>
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
                  <td className="border-r p-3">{t('tableHeaders.total')}</td>
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
          <Button type="button" onClick={handleClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
