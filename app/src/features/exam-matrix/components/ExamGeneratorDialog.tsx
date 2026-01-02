import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import useExamMatrixStore from '@/features/exam-matrix/stores/examMatrixStore';
import useExamDraftStore from '@/features/assignment/stores/examDraftStore';
import { useQuestionBankList } from '@/features/assignment/hooks/useQuestionBankApi';
import type { QuestionBankItem, ExamDraft } from '@aiprimary/core';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import { MatrixCellStatusCard } from './MatrixCellStatusCard';
import { MatrixProgressSummary } from './MatrixProgressSummary';
import { Badge } from '@/shared/components/ui/badge';
import { Search, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface ExamGeneratorDialogProps {
  open: boolean;
  matrix: ExamMatrix | null;
  onClose: () => void;
  onComplete: (draft: ExamDraft) => void;
}

export const ExamGeneratorDialog = ({ open, matrix, onClose, onComplete }: ExamGeneratorDialogProps) => {
  const { t } = useTranslation([I18N_NAMESPACES.EXAM_MATRIX, I18N_NAMESPACES.ASSIGNMENT]);
  const {
    questionSelections,
    activeCellId,
    setActiveCell,
    assignQuestionToCell,
    unassignQuestion,
    getQuestionsForCell,
    clearAllSelections,
  } = useExamMatrixStore();

  const { createDraft } = useExamDraftStore();

  const [searchText, setSearchText] = useState('');

  // Get active cell
  const activeCell = matrix?.cells.find((c) => c.id === activeCellId) || null;
  const activeTopic = activeCell ? matrix?.topics.find((t) => t.id === activeCell.topicId) : null;

  // Fetch questions filtered by active cell
  const { data: questionsData, isLoading } = useQuestionBankList({
    searchText,
    subjectCode: matrix?.subjectCode,
    difficulty: activeCell?.difficulty,
    bankType: 'application', // Only show application bank questions
    limit: 100,
  });

  const questions = questionsData?.questions || [];

  // Set first cell as active when dialog opens
  useEffect(() => {
    if (open && matrix && !activeCellId) {
      const firstCell = matrix.cells.find((c) => c.requiredQuestionCount > 0);
      if (firstCell) {
        setActiveCell(firstCell.id);
      }
    }
  }, [open, matrix, activeCellId, setActiveCell]);

  if (!matrix) return null;

  const handleQuestionToggle = (question: QuestionBankItem) => {
    if (!activeCell) {
      toast.warning(t('generator.selectCell'));
      return;
    }

    // Check if question is already assigned
    const currentAssignment = questionSelections[question.id];

    if (currentAssignment === activeCell.id) {
      // Unassign from current cell
      unassignQuestion(question.id);
      toast.success(t('toasts.unassigned', { name: activeTopic?.name }));
    } else if (currentAssignment) {
      // Already assigned to another cell
      const otherCell = matrix.cells.find((c) => c.id === currentAssignment);
      const otherTopic = matrix.topics.find((t) => t.id === otherCell?.topicId);
      toast.warning(
        t('generator.alreadyAssigned', {
          topic: otherTopic?.name || 'Unknown',
          difficulty: otherCell?.difficulty || '',
        })
      );
    } else {
      // Check if cell is already full
      const currentSelections = getQuestionsForCell(activeCell.id);
      if (currentSelections.length >= activeCell.requiredQuestionCount) {
        toast.warning(t('toasts.cellFull', { count: activeCell.requiredQuestionCount }));
        return;
      }

      // Assign to active cell
      assignQuestionToCell(question.id, activeCell.id);
      toast.success(t('toasts.assigned', { name: activeTopic?.name }));
    }
  };

  const isQuestionAssignedToActiveCell = (questionId: string) => {
    return activeCell && questionSelections[questionId] === activeCell.id;
  };

  const isQuestionAssigned = (questionId: string) => {
    return !!questionSelections[questionId];
  };

  const handleGenerateExam = () => {
    // Validate all cells are fulfilled
    const unfulfilledCells = matrix.cells.filter((cell) => {
      if (cell.requiredQuestionCount === 0) return false;
      const selectedCount = getQuestionsForCell(cell.id).length;
      return selectedCount < cell.requiredQuestionCount;
    });

    if (unfulfilledCells.length > 0) {
      toast.error(t('toasts.cellsNotFulfilled', { count: unfulfilledCells.length }));
      return;
    }

    // Get selected question IDs from questionSelections
    const selectedQuestionIds = Object.keys(questionSelections);

    // Get full question details from fetched questions
    const selectedQuestions = questions.filter((q) => selectedQuestionIds.includes(q.id));

    // Create exam draft
    const draft = createDraft(matrix, selectedQuestions, questionSelections);

    // Clear selections from store
    clearAllSelections();

    // Notify parent
    onComplete(draft);

    toast.success(t('generator.success'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] !max-w-7xl flex-col overflow-hidden rounded-3xl border-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{t('generator.title')}</DialogTitle>
          <p className="text-muted-foreground text-sm">{t('generator.subtitle')}</p>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden">
          {/* Left Sidebar - Cell Status Cards */}
          <div className="col-span-4 flex flex-col space-y-4 overflow-hidden">
            <div>
              <h3 className="mb-3 text-sm font-semibold">{t('generator.cellStatus')}</h3>
              <div className="from-primary/10 to-primary/5 border-primary/20 rounded-2xl border bg-gradient-to-br p-4 shadow-md">
                <MatrixProgressSummary
                  cells={matrix.cells}
                  questionSelections={questionSelections}
                  targetPoints={matrix.targetTotalPoints}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {matrix.cells
                  .filter((cell) => cell.requiredQuestionCount > 0)
                  .map((cell) => {
                    const topic = matrix.topics.find((t) => t.id === cell.topicId);
                    if (!topic) return null;

                    const selectedCount = getQuestionsForCell(cell.id).length;

                    return (
                      <MatrixCellStatusCard
                        key={cell.id}
                        cell={cell}
                        topic={topic}
                        selectedQuestionCount={selectedCount}
                        isActive={activeCellId === cell.id}
                        onClick={() => setActiveCell(cell.id)}
                      />
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side - Question Bank */}
          <div className="col-span-8 flex flex-col space-y-4 overflow-hidden">
            <div>
              <h3 className="mb-3 text-sm font-semibold">{t('generator.questionBank')}</h3>
              {activeCell && activeTopic ? (
                <div className="from-primary/8 border-primary/20 animate-in fade-in flex items-center gap-3 rounded-2xl border-2 bg-gradient-to-br to-transparent p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">{t('labels.filteringFor')}</span>
                    <Badge variant="default" className="shadow-sm">
                      {activeTopic.name}
                    </Badge>
                    <Badge variant="outline" className="border-2">
                      {activeCell.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/20 shadow-sm">
                      {getQuestionsForCell(activeCell.id).length} / {activeCell.requiredQuestionCount}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="from-muted/50 rounded-lg border border-dashed bg-gradient-to-b to-transparent p-6 text-center">
                  <p className="text-muted-foreground text-sm">{t('generator.noActiveCell')}</p>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t('search.placeholder')}
                className="pl-9"
              />
            </div>

            {/* Questions List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {isLoading ? (
                  <div className="text-muted-foreground py-8 text-center">
                    {t('loading.loadingQuestions')}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">{t('emptyStates.noQuestions')}</div>
                ) : (
                  questions.map((question) => {
                    const isAssignedToActive = isQuestionAssignedToActiveCell(question.id);
                    const isAssignedToOther = isQuestionAssigned(question.id) && !isAssignedToActive;

                    return (
                      <button
                        key={question.id}
                        onClick={() => handleQuestionToggle(question)}
                        disabled={!activeCell || isAssignedToOther}
                        className={cn(
                          'w-full rounded-2xl border-2 p-5 text-left',
                          'transition-all duration-200',
                          isAssignedToActive && [
                            'border-primary from-primary/10 to-primary/5 bg-gradient-to-br',
                            'shadow-lg',
                            'scale-[1.02]',
                          ],
                          isAssignedToOther && ['border-muted bg-muted/50 cursor-not-allowed opacity-50'],
                          !isAssignedToActive &&
                            !isAssignedToOther && [
                              'border-border bg-card',
                              'shadow-sm',
                              'hover:border-primary/50',
                              'hover:scale-[1.01] hover:shadow-lg',
                              'hover:from-primary/5 hover:bg-gradient-to-br hover:to-transparent',
                              'active:scale-[0.99]',
                            ]
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2',
                              isAssignedToActive ? 'border-primary bg-primary' : 'border-muted-foreground/20'
                            )}
                          >
                            {isAssignedToActive && <Check className="h-3 w-3 text-white" />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 font-medium">
                              {question.title || t('fallbacks.untitledQuestion')}
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {t(`assignment:questionTypes.${question.type}` as any)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.points} pts
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('generator.cancelButton')}
          </Button>
          <Button onClick={handleGenerateExam}>{t('generator.generateButton')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
