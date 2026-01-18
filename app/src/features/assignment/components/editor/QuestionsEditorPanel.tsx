import { CurrentQuestionView } from './CurrentQuestionView';
import { QuestionBankDialog } from '../question-bank/QuestionBankDialog';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import type { Question } from '@aiprimary/core';

export const QuestionsEditorPanel = () => {
  // Get data and actions from stores
  const topics = useAssignmentFormStore((state) => state.topics);
  const addQuestion = useAssignmentFormStore((state) => state.addQuestion);
  const defaultTopicId = topics[0]?.id || '';

  const isQuestionBankOpen = useAssignmentEditorStore((state) => state.isQuestionBankOpen);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);

  const handleAddQuestionsFromBank = (questions: Question[]) => {
    // Add questions from bank with default topic
    questions.forEach((question) => {
      addQuestion({
        question: {
          ...question,
          topicId: defaultTopicId, // Set default topic for imported questions
        } as any,
        points: 10, // Default points
      });
    });
  };

  return (
    <>
      <CurrentQuestionView />

      {/* Question Bank Dialog */}
      <QuestionBankDialog
        open={isQuestionBankOpen}
        onOpenChange={setQuestionBankOpen}
        onAddQuestions={handleAddQuestionsFromBank}
      />
    </>
  );
};
