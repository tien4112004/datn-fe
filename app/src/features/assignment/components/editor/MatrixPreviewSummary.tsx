import { useTranslation } from 'react-i18next';
import { DIFFICULTY } from '@aiprimary/core';
import type { AssignmentTopic, MatrixCell, QuestionWithTopic } from '../../types';
import { Badge } from '@/shared/components/ui/badge';

interface MatrixPreviewSummaryProps {
  topics: AssignmentTopic[];
  matrixCells: MatrixCell[];
  questions: QuestionWithTopic[];
}

const getCellStatus = (cell: MatrixCell): 'valid' | 'warning' | 'info' => {
  if (cell.requiredCount === 0) return 'info';
  if (cell.currentCount >= cell.requiredCount) return 'valid';
  return 'warning';
};

export const MatrixPreviewSummary = ({ topics, matrixCells, questions }: MatrixPreviewSummaryProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.matrix.preview' });
  const { t: tDifficulty } = useTranslation('assignment', { keyPrefix: 'difficulty' });
  const { t: tMatrix } = useTranslation('assignment', {
    keyPrefix: 'assignmentEditor.matrixEditor.tableHeaders',
  });

  const difficulties = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.SUPER_HARD];

  const getDifficultyLabel = (difficulty: string) => {
    const diffMap: Record<string, 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao'> = {
      [DIFFICULTY.EASY]: 'nhanBiet',
      [DIFFICULTY.MEDIUM]: 'thongHieu',
      [DIFFICULTY.HARD]: 'vanDung',
      [DIFFICULTY.SUPER_HARD]: 'vanDungCao',
    };
    const key = diffMap[difficulty] || 'nhanBiet';
    return tDifficulty(key as 'nhanBiet' | 'thongHieu' | 'vanDung' | 'vanDungCao').charAt(0);
  };

  const totalRequired = matrixCells.reduce((sum, cell) => sum + cell.requiredCount, 0);
  const totalCurrent = questions.length;

  const statusColorMap = {
    valid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <div className="space-y-3">
      {/* Summary Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t('topics', { count: topics.length })}</Badge>
          <Badge variant="outline">{t('questions', { count: totalCurrent })}</Badge>
        </div>
        <div className="text-muted-foreground">{t('required', { count: totalRequired })}</div>
      </div>

      {/* Compact Matrix Grid */}
      <div className="max-h-[300px] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b">
              <th className="border-r p-1 text-left font-medium">{tMatrix('topic')}</th>
              {difficulties.map((diff) => (
                <th key={diff} className="p-1 text-center font-medium">
                  {getDifficultyLabel(diff)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr key={topic.id} className="border-b">
                <td className="border-r p-1 font-medium">{topic.name}</td>
                {difficulties.map((diff) => {
                  const cell = matrixCells.find((c) => c.topicId === topic.id && c.difficulty === diff);
                  const status = cell ? getCellStatus(cell) : 'info';
                  return (
                    <td key={diff} className="p-1 text-center">
                      <span className={`inline-block rounded px-1 ${statusColorMap[status]}`}>
                        {cell ? `${cell.currentCount}/${cell.requiredCount}` : '-'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
