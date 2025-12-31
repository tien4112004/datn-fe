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
import type { QuestionBankItem } from '@/features/assignment/types/questionBank';
import type { ExamMatrix } from '@/features/exam-matrix/types';
import type { ExamDraft } from '@/features/assignment/types/examDraft';
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
      toast.success(`Unassigned from ${activeTopic?.name}`);
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
        toast.warning(`Cell is full (${activeCell.requiredQuestionCount} questions required)`);
        return;
      }

      // Assign to active cell
      assignQuestionToCell(question.id, activeCell.id);
      toast.success(`Assigned to ${activeTopic?.name}`);
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
      toast.error(`${unfulfilledCells.length} cells are not fully fulfilled`);
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
      <DialogContent className="flex max-h-[90vh] !max-w-7xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('generator.title')}</DialogTitle>
          <p className="text-muted-foreground text-sm">{t('generator.subtitle')}</p>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden">
          {/* Left Sidebar - Cell Status Cards */}
          <div className="col-span-4 flex flex-col space-y-4 overflow-hidden">
            <div>
              <h3 className="mb-2 text-sm font-semibold">{t('generator.cellStatus')}</h3>
              <MatrixProgressSummary
                cells={matrix.cells}
                questionSelections={questionSelections}
                targetPoints={matrix.targetTotalPoints}
              />
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
              <h3 className="mb-2 text-sm font-semibold">{t('generator.questionBank')}</h3>
              {activeCell && activeTopic ? (
                <div className="bg-primary/10 border-primary/20 flex items-center gap-2 rounded-lg border p-3">
                  <span className="text-sm">Filtering for:</span>
                  <Badge>{activeTopic.name}</Badge>
                  <Badge variant="outline">{activeCell.difficulty}</Badge>
                  <Badge variant="secondary">
                    {getQuestionsForCell(activeCell.id).length} / {activeCell.requiredQuestionCount} selected
                  </Badge>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center">
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
                placeholder="Search questions..."
                className="pl-9"
              />
            </div>

            {/* Questions List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {isLoading ? (
                  <div className="text-muted-foreground py-8 text-center">Loading questions...</div>
                ) : questions.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center">No questions found</div>
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
                          'w-full rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
                          isAssignedToActive
                            ? 'border-primary bg-primary/10'
                            : isAssignedToOther
                              ? 'border-muted bg-muted/50 cursor-not-allowed opacity-50'
                              : 'border-muted-foreground/20 hover:border-primary/50'
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
                              {question.title || 'Untitled Question'}
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
