import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useAssessmentMatrixStore from '@/features/assessment-matrix/stores/assessmentMatrixStore';
import type { Difficulty } from '@/features/assignment/types';
import { DIFFICULTY } from '@/features/assignment/types';
import { Badge } from '@/shared/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';

const difficultyLevels: Difficulty[] = [
  DIFFICULTY.EASY,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.HARD,
  DIFFICULTY.SUPER_HARD,
];

export const MatrixPreviewTable = () => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, getCellByTopicAndDifficulty } = useAssessmentMatrixStore();

  if (!currentMatrix) return null;

  const getDifficultyLabel = (difficulty: Difficulty) => {
    const labels: Record<Difficulty, string> = {
      nhan_biet: t('difficulty.easy'),
      thong_hieu: t('difficulty.medium'),
      van_dung: t('difficulty.hard'),
      van_dung_cao: t('difficulty.van_dung_cao'),
    };
    return labels[difficulty];
  };

  // Calculate summary statistics
  const totalQuestions = currentMatrix.cells.reduce((sum, c) => sum + c.requiredQuestionCount, 0);
  const totalPoints = currentMatrix.cells.reduce(
    (sum, c) => sum + c.requiredQuestionCount * c.pointsPerQuestion,
    0
  );
  const pointsDifference = totalPoints - currentMatrix.targetTotalPoints;
  const isPointsMatch = Math.abs(pointsDifference) < 0.01; // Allow small floating point differences
  const isWithinTolerance = Math.abs(pointsDifference) <= currentMatrix.targetTotalPoints * 0.05; // 5% tolerance

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">{t('builder.preview.summary')}</h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-muted-foreground text-sm">{t('builder.preview.totalTopics')}</div>
            <div className="text-2xl font-bold">{currentMatrix.topics.length}</div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">{t('builder.preview.totalCells')}</div>
            <div className="text-2xl font-bold">
              {currentMatrix.cells.filter((c) => c.requiredQuestionCount > 0).length}
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">{t('builder.preview.totalQuestions')}</div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </div>

          <div>
            <div className="text-muted-foreground text-sm">{t('builder.preview.totalPoints')}</div>
            <div className="text-2xl font-bold">{totalPoints.toFixed(1)}</div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-sm">{t('builder.preview.targetPoints')}</div>
              <div className="text-xl font-semibold">{currentMatrix.targetTotalPoints}</div>
            </div>

            <div className="flex items-center gap-2">
              {isPointsMatch ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{t('status.perfectMatch')}</span>
                </>
              ) : isWithinTolerance ? (
                <>
                  <CheckCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">
                    {t('status.withinTolerance')} ({pointsDifference > 0 ? '+' : ''}
                    {pointsDifference.toFixed(1)})
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-600">
                    {t('status.offBy')} {Math.abs(pointsDifference).toFixed(1)} pts
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-auto rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="bg-muted/50 sticky left-0 p-3 text-left font-medium">
                {t('builder.grid.topic')}
              </th>
              {difficultyLevels.map((difficulty) => (
                <th key={difficulty} className="min-w-[100px] p-3 text-center font-medium">
                  {getDifficultyLabel(difficulty)}
                </th>
              ))}
              <th className="min-w-[100px] p-3 text-center font-medium">{t('table.total')}</th>
            </tr>
          </thead>
          <tbody>
            {currentMatrix.topics.map((topic) => {
              const topicCells = difficultyLevels.map((d) => getCellByTopicAndDifficulty(topic.id, d));
              const topicQuestions = topicCells.reduce((sum, c) => sum + (c?.requiredQuestionCount || 0), 0);
              const topicPoints = topicCells.reduce(
                (sum, c) => sum + (c?.requiredQuestionCount || 0) * (c?.pointsPerQuestion || 0),
                0
              );

              return (
                <tr key={topic.id} className="hover:bg-muted/20 border-b">
                  <td className="bg-background sticky left-0 p-3 font-medium">
                    <div>{topic.name}</div>
                    {topic.description && (
                      <div className="text-muted-foreground mt-1 text-xs">{topic.description}</div>
                    )}
                  </td>

                  {difficultyLevels.map((difficulty) => {
                    const cell = getCellByTopicAndDifficulty(topic.id, difficulty);

                    return (
                      <td key={difficulty} className="p-2 text-center">
                        {cell && cell.requiredQuestionCount > 0 ? (
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {cell.requiredQuestionCount} Q
                            </Badge>
                            <div className="text-muted-foreground text-xs">
                              {(cell.requiredQuestionCount * cell.pointsPerQuestion).toFixed(1)} pts
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="bg-muted/20 p-3 text-center">
                    <div className="font-semibold">{topicQuestions} Q</div>
                    <div className="text-muted-foreground text-xs">{topicPoints.toFixed(1)} pts</div>
                  </td>
                </tr>
              );
            })}

            {/* Totals Row */}
            <tr className="bg-muted font-semibold">
              <td className="bg-muted sticky left-0 p-3">{t('table.total')}</td>
              {difficultyLevels.map((difficulty) => {
                const difficultyCells = currentMatrix.cells.filter((c) => c.difficulty === difficulty);
                const difficultyQuestions = difficultyCells.reduce(
                  (sum, c) => sum + c.requiredQuestionCount,
                  0
                );
                const difficultyPoints = difficultyCells.reduce(
                  (sum, c) => sum + c.requiredQuestionCount * c.pointsPerQuestion,
                  0
                );

                return (
                  <td key={difficulty} className="p-3 text-center">
                    <div>{difficultyQuestions} Q</div>
                    <div className="text-xs">{difficultyPoints.toFixed(1)} pts</div>
                  </td>
                );
              })}
              <td className="bg-muted p-3 text-center">
                <div>{totalQuestions} Q</div>
                <div className="text-xs">{totalPoints.toFixed(1)} pts</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
