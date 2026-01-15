import { useFormContext, useFieldArray } from 'react-hook-form';
import { CurrentQuestionView } from './CurrentQuestionView';
import { QuestionBankDialog } from '../question-bank/QuestionBankDialog';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';
import type { Question } from '@aiprimary/core';

export const QuestionsEditorPanel = () => {
  const { control, watch } = useFormContext<AssignmentFormData>();
  const { append } = useFieldArray({
    control,
    name: 'questions',
  });

  const topics = watch('topics');
  const defaultTopicId = topics[0]?.id || '';

  const isQuestionBankOpen = useAssignmentEditorStore((state) => state.isQuestionBankOpen);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);

  const handleAddQuestionsFromBank = (questions: Question[]) => {
    // Add questions from bank with default topic
    questions.forEach((question) => {
      append({
        ...question,
        topicId: defaultTopicId, // Set default topic for imported questions
      } as any);
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
