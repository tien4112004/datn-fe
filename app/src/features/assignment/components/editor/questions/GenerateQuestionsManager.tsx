import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QuestionGeneratePanel } from './QuestionGeneratePanel';
import { useAssignmentEditorStore } from '../../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import { generateId } from '@/shared/lib/utils';
import type { QuestionBankItem } from '@/features/question-bank/types';
import type { AssignmentQuestionWithTopic, QuestionWithTopic } from '../../../types/assignment';

/**
 * Self-contained component that manages the QuestionGeneratePanel
 * within the assignment editor context.
 *
 * Handles:
 * - Rendering the generation panel inline in the main content area
 * - Pre-populating grade/subject from the form store
 * - Transforming generated QuestionBankItem[] to AssignmentQuestionWithTopic[]
 * - Adding transformed questions to the form store
 */
export const GenerateQuestionsManager: React.FC = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  const setMainView = useAssignmentEditorStore((state) => state.setMainView);

  const grade = useAssignmentFormStore((state) => state.grade);
  const subject = useAssignmentFormStore((state) => state.subject);

  const handleApply = React.useCallback(
    (questions: QuestionBankItem[]) => {
      const { addQuestion, topics } = useAssignmentFormStore.getState();

      const defaultTopic = topics[0];
      if (!defaultTopic) {
        toast.error(t('toasts.noTopicError'));
        return;
      }

      questions.forEach((bankItem) => {
        const questionWithTopic = {
          id: generateId(),
          type: bankItem.type,
          difficulty: bankItem.difficulty,
          title: bankItem.title,
          titleImageUrl: bankItem.titleImageUrl,
          explanation: bankItem.explanation,
          data: bankItem.data,
          topicId: defaultTopic.id,
          contextId: bankItem.contextId,
        } as QuestionWithTopic;

        const assignmentQuestion: AssignmentQuestionWithTopic = {
          question: questionWithTopic,
          points: 10,
        };

        addQuestion(assignmentQuestion);
      });

      toast.success(t('toasts.questionsAdded', { count: questions.length }));
      setMainView('questions');
    },
    [t, setMainView]
  );

  const handleClose = React.useCallback(() => {
    setMainView('questions');
  }, [setMainView]);

  return (
    <QuestionGeneratePanel
      onClose={handleClose}
      onApply={handleApply}
      initialGrade={grade}
      initialSubject={subject}
    />
  );
};
