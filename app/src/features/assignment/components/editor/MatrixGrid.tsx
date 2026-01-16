import { useFormContext, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { MatrixCell } from './MatrixCell';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';
import { getAllDifficulties, getDifficultyI18nKey } from '@aiprimary/core';

export const MatrixGrid = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrixEditor' });
  const { t: tDifficulty } = useTranslation('assignment', { keyPrefix: 'difficulty' });
  const { control, setValue } = useFormContext<AssignmentFormData>();

  // Watch for changes
  const questions = useWatch({ control, name: 'questions' });
  const topics = useWatch({ control, name: 'topics' });
  const matrixCells = useWatch({ control, name: 'matrixCells' });

  const syncMatrixCounts = useAssignmentEditorStore((state) => state.syncMatrixCounts);

  // Sync matrix counts whenever questions or topics change
  useEffect(() => {
    if (questions && topics && matrixCells) {
      const updatedCells = syncMatrixCounts(questions, topics, matrixCells);
      setValue('matrixCells', updatedCells);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, topics]);

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
