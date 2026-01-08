import { useFormContext, useFieldArray } from 'react-hook-form';
import { ClipboardList } from 'lucide-react';
import { QuestionsToolbar } from './QuestionsToolbar';
import { QuestionsList } from './QuestionsList';
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500 p-2 text-white">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Questions</h2>
          </div>
          <QuestionsToolbar />
        </div>

        {/* Content */}
        <QuestionsList />
      </div>

      {/* Question Bank Dialog */}
      <QuestionBankDialog
        open={isQuestionBankOpen}
        onOpenChange={setQuestionBankOpen}
        onAddQuestions={handleAddQuestionsFromBank}
      />
    </>
  );
};
