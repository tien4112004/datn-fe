import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { MatrixCell } from './MatrixCell';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { getAllDifficulties, getDifficultyI18nKey } from '@aiprimary/core';

export const MatrixGrid = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });
  const { t: tDifficulty } = useTranslation('questions');

  // Get data from store (matrix counts are auto-synced)
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrixCells = useAssignmentFormStore((state) => state.matrixCells);

  if (!topics || topics.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500">{t('emptyMessage')}</p>
      </div>
    );
  }

  const difficulties = getAllDifficulties();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32 bg-gray-50 font-semibold dark:bg-gray-900">
              {t('tableHeaders.topic')}
            </TableHead>
            {difficulties.map((difficulty) => (
              <TableHead key={difficulty.value} className="bg-gray-50 text-center text-xs dark:bg-gray-900">
                {tDifficulty(getDifficultyI18nKey(difficulty.value) as any)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell className="font-medium">{topic.name || t('tableHeaders.topic')}</TableCell>
              {difficulties.map((difficulty) => {
                const cell = matrixCells?.find(
                  (c) => c.topicId === topic.id && c.difficulty === difficulty.value
                );
                return (
                  <TableCell key={`${topic.id}-${difficulty.value}`} className="p-2">
                    {cell && <MatrixCell cell={cell} />}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
