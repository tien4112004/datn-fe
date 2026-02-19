import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { GenerateMatrixPanel } from './GenerateMatrixPanel';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@ui/alert-dialog';
import { Button } from '@ui/button';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { createMatrixCellsForTopic } from '../../utils/matrixHelpers';
import { mergeApiMatrixIntoCells } from '../../utils/matrixConversion';
import { createTopicId, getAllDifficulties, getAllQuestionTypes } from '@aiprimary/core';
import type { GenerateMatrixResponse } from '../../types/assignment';
import type { AssignmentTopic, MatrixCell, ApiMatrix } from '../../types';

/**
 * Transform ExamMatrixDtoResponse to AssignmentTopic[] + MatrixCell[]
 * Topics are now flat (no subtopic hierarchy flattening)
 */
function transformGeneratedMatrix(response: GenerateMatrixResponse): {
  topics: AssignmentTopic[];
  cells: MatrixCell[];
} {
  const difficulties = getAllDifficulties();
  const questionTypes = getAllQuestionTypes();

  // Map topics directly (subtopics from API response become chapters)
  const topics: AssignmentTopic[] = response.dimensions.topics.map((topic) => ({
    id: topic.id || createTopicId(),
    name: topic.name,
    chapters: topic.subtopics?.map((s) => s.name) || [],
  }));

  // Create full matrix cells grid for all topics
  const fullMatrixCells = topics.flatMap((topic) =>
    createMatrixCellsForTopic(topic.id, topic.name, difficulties, questionTypes)
  );

  // Build ApiMatrix-compatible object for mergeApiMatrixIntoCells
  const apiMatrix: ApiMatrix = {
    grade: response.metadata.grade as any,
    subject: response.metadata.subject as any,
    dimensions: {
      topics: response.dimensions.topics.map((t) => ({
        id: t.id,
        name: t.name,
        chapters: t.subtopics?.map((s) => s.name) || [],
      })),
      difficulties: response.dimensions.difficulties as any[],
      questionTypes: response.dimensions.questionTypes as any[],
    },
    matrix: response.matrix,
    totalQuestions: response.totalQuestions,
    totalPoints: response.totalPoints,
  };

  // Merge API required counts into full cell grid
  const mergedCells = mergeApiMatrixIntoCells(apiMatrix, fullMatrixCells);

  // Filter out zero-count cells
  const nonZeroCells = mergedCells.filter((cell) => cell.requiredCount > 0);

  return { topics, cells: nonZeroCells };
}

/**
 * Self-contained component that manages the GenerateMatrixPanel
 * within the assignment editor context.
 *
 * Handles:
 * - Rendering the generation panel inline in the main content area
 * - Pre-populating grade/subject/name from the form store
 * - Showing Replace vs Merge confirmation after generation
 * - Applying the generated matrix to the form store
 */
export const GenerateMatrixManager: React.FC = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  const setMainView = useAssignmentEditorStore((state) => state.setMainView);

  const grade = useAssignmentFormStore((state) => state.grade);
  const subject = useAssignmentFormStore((state) => state.subject);
  const title = useAssignmentFormStore((state) => state.title);

  const [pendingResult, setPendingResult] = React.useState<GenerateMatrixResponse | null>(null);

  const handleGenerated = React.useCallback(
    (response: GenerateMatrixResponse) => {
      // Validate that the response has topics
      if (!response.dimensions?.topics?.length) {
        toast.error(t('generateMatrixDialog.toast.error'));
        return;
      }
      setPendingResult(response);
    },
    [t]
  );

  const handleReplace = React.useCallback(() => {
    if (!pendingResult) return;

    const { topics: newTopics, cells: newCells } = transformGeneratedMatrix(pendingResult);
    const formStore = useAssignmentFormStore.getState();

    // Remove all existing topics (this also removes their matrix cells and questions)
    const existingTopics = [...formStore.topics];
    existingTopics.forEach((topic) => {
      formStore.removeTopic(topic.id);
    });

    // Add new topics
    newTopics.forEach((topic) => {
      formStore.addTopic(topic);
    });

    // Add new matrix cells
    newCells.forEach((cell) => {
      formStore.createMatrixCell({
        topicId: cell.topicId,
        topicName: cell.topicName,
        difficulty: cell.difficulty,
        questionType: cell.questionType,
        requiredCount: cell.requiredCount,
      });
    });

    toast.success(t('generateMatrixDialog.toast.success'));
    setPendingResult(null);
    setMainView('matrix');
  }, [pendingResult, t, setMainView]);

  const handleMerge = React.useCallback(() => {
    if (!pendingResult) return;

    const { topics: newTopics, cells: newCells } = transformGeneratedMatrix(pendingResult);
    const formStore = useAssignmentFormStore.getState();
    const existingTopicIds = new Set(formStore.topics.map((t) => t.id));

    // Add only new topics (skip existing)
    newTopics.forEach((topic) => {
      if (!existingTopicIds.has(topic.id)) {
        formStore.addTopic(topic);
      }
    });

    // Add or update matrix cells
    const existingCellMap = new Map(formStore.matrix.map((c) => [c.id, c]));

    newCells.forEach((cell) => {
      const existingCell = existingCellMap.get(cell.id);
      if (existingCell) {
        // Cell exists: add requiredCounts together
        formStore.updateMatrixCell(cell.id, {
          requiredCount: existingCell.requiredCount + cell.requiredCount,
        });
      } else {
        // New cell: create it
        formStore.createMatrixCell({
          topicId: cell.topicId,
          topicName: cell.topicName,
          difficulty: cell.difficulty,
          questionType: cell.questionType,
          requiredCount: cell.requiredCount,
        });
      }
    });

    toast.success(t('generateMatrixDialog.toast.success'));
    setPendingResult(null);
    setMainView('matrix');
  }, [pendingResult, t, setMainView]);

  const handleCancelConfirmation = React.useCallback(() => {
    setPendingResult(null);
  }, []);

  const handleClose = React.useCallback(() => {
    setMainView('matrix');
  }, [setMainView]);

  // Count existing questions that would be affected by replace
  const existingQuestionCount = useAssignmentFormStore((state) => state.questions.length);

  // Compute summary of pending result for the confirmation dialog
  const pendingSummary = React.useMemo(() => {
    if (!pendingResult) return null;
    const topicCount = pendingResult.dimensions.topics.reduce(
      (sum, t) => sum + (t.subtopics?.length || 0),
      0
    );
    return {
      topicCount,
      totalQuestions: pendingResult.totalQuestions,
      totalPoints: pendingResult.totalPoints,
    };
  }, [pendingResult]);

  return (
    <>
      <GenerateMatrixPanel
        onClose={handleClose}
        onGenerated={handleGenerated}
        initialGrade={grade}
        initialSubject={subject}
        initialName={title}
      />

      {/* Replace vs Merge Confirmation Dialog */}
      <AlertDialog open={!!pendingResult} onOpenChange={(open) => !open && handleCancelConfirmation()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('generateMatrixDialog.confirmation.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('generateMatrixDialog.confirmation.description')}
            </AlertDialogDescription>
            {pendingSummary && (
              <p className="text-sm font-medium">
                {t('generateMatrixDialog.confirmation.summary', {
                  topicCount: pendingSummary.topicCount,
                  totalQuestions: pendingSummary.totalQuestions,
                  totalPoints: pendingSummary.totalPoints,
                })}
              </p>
            )}
            {existingQuestionCount > 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('generateMatrixDialog.confirmation.replaceWarning', {
                  count: existingQuestionCount,
                })}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>
              {t('generateMatrixDialog.confirmation.cancel')}
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleMerge}>
              {t('generateMatrixDialog.confirmation.merge')}
            </Button>
            <AlertDialogAction onClick={handleReplace}>
              {t('generateMatrixDialog.confirmation.replace')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
