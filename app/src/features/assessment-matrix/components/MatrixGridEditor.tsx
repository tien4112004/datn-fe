import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useAssessmentMatrixStore from '@/features/assessment-matrix/stores/assessmentMatrixStore';
import type { MatrixCell, Topic, TopicId } from '@/features/assessment-matrix/types';
import type { Difficulty } from '@/features/assignment/types';
import { getDifficultyName, getAllDifficulties } from '@aiprimary/core';
import { MatrixCellEditor } from './MatrixCellEditor';
import { cn } from '@/shared/lib/utils';

interface MatrixGridEditorProps {
  open: boolean;
  onClose: () => void;
}

export const MatrixGridEditor = ({ open, onClose }: MatrixGridEditorProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);
  const { currentMatrix, updateCell, removeCell, getCellByTopicAndDifficulty } = useAssessmentMatrixStore();

  const [cellEditorOpen, setCellEditorOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<MatrixCell | null>(null);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingDifficulty, setEditingDifficulty] = useState<Difficulty | null>(null);

  const difficultyLevels = getAllDifficulties();

  if (!currentMatrix) return null;

  const handleCellClick = (topic: Topic, difficulty: Difficulty) => {
    const cell = getCellByTopicAndDifficulty(topic.id, difficulty);
    setEditingCell(cell || null);
    setEditingTopic(topic);
    setEditingDifficulty(difficulty);
    setCellEditorOpen(true);
  };

  const handleCellSave = (cell: MatrixCell) => {
    updateCell(cell);
  };

  const handleCellClear = () => {
    if (editingCell) {
      removeCell(editingCell.id);
    }
  };

  const handleCellEditorClose = () => {
    setCellEditorOpen(false);
    setEditingCell(null);
    setEditingTopic(null);
    setEditingDifficulty(null);
  };

  const getCellContent = (topicId: TopicId, difficulty: Difficulty) => {
    const cell = getCellByTopicAndDifficulty(topicId, difficulty);
    if (!cell || cell.requiredQuestionCount === 0) {
      return null;
    }

    return {
      questions: cell.requiredQuestionCount,
      points: cell.pointsPerQuestion,
      total: cell.requiredQuestionCount * cell.pointsPerQuestion,
    };
  };

  // Calculate summary statistics
  const totalCells = currentMatrix.cells.filter((c) => c.requiredQuestionCount > 0).length;
  const totalQuestions = currentMatrix.cells.reduce((sum, c) => sum + c.requiredQuestionCount, 0);
  const totalPoints = currentMatrix.cells.reduce(
    (sum, c) => sum + c.requiredQuestionCount * c.pointsPerQuestion,
    0
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="flex max-h-[90vh] !max-w-6xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{t('builder.grid.title')}</DialogTitle>
            <p className="text-muted-foreground text-sm">{t('builder.grid.subtitle')}</p>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {currentMatrix.topics.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">{t('builder.topics.noTopics')}</p>
                  <p className="text-muted-foreground mt-1 text-sm">{t('emptyStates.addTopicsFirst')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-sm">{t('labels.totalCells')}</div>
                    <div className="text-2xl font-bold">{totalCells}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-sm">{t('labels.totalQuestions')}</div>
                    <div className="text-2xl font-bold">{totalQuestions}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-muted-foreground text-sm">{t('labels.totalPoints')}</div>
                    <div className="text-2xl font-bold">{totalPoints.toFixed(1)}</div>
                  </div>
                </div>

                {/* Grid */}
                <div className="overflow-auto rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="bg-muted/50 sticky left-0 p-3 text-left font-medium">
                          {t('builder.grid.topic')}
                        </th>
                        {difficultyLevels.map((difficulty) => (
                          <th key={difficulty.value} className="min-w-[120px] p-3 text-center font-medium">
                            {getDifficultyName(difficulty.value)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentMatrix.topics.map((topic) => (
                        <tr key={topic.id} className="hover:bg-muted/50 border-b">
                          <td className="bg-background sticky left-0 p-3 font-medium">{topic.name}</td>
                          {difficultyLevels.map((difficulty) => {
                            const cellContent = getCellContent(topic.id, difficulty.value);
                            const isEmpty = !cellContent;

                            return (
                              <td key={difficulty.value} className="p-2">
                                <button
                                  onClick={() => handleCellClick(topic, difficulty.value)}
                                  className={cn(
                                    'hover:border-primary hover:bg-accent min-h-[60px] w-full rounded border-2 border-dashed p-2 transition-all',
                                    isEmpty
                                      ? 'border-muted-foreground/20 bg-muted/20'
                                      : 'border-primary/30 bg-primary/5'
                                  )}
                                >
                                  {isEmpty ? (
                                    <div className="text-muted-foreground text-xs">
                                      {t('builder.grid.empty')}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <div className="text-sm font-medium">
                                        {t('builder.grid.questions', { count: cellContent.questions })}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {cellContent.points} × {cellContent.questions} ={' '}
                                        {t('builder.grid.points', { points: cellContent.total })}
                                      </div>
                                    </div>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button onClick={onClose}>{t('buttons.done')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cell Editor Dialog */}
      <MatrixCellEditor
        open={cellEditorOpen}
        cell={editingCell}
        topic={editingTopic}
        difficulty={editingDifficulty}
        onSave={handleCellSave}
        onClear={handleCellClear}
        onClose={handleCellEditorClose}
      />
    </>
  );
};
