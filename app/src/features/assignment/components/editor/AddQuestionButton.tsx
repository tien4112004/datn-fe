import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { AssignmentFormData } from '../../types';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import { getAllQuestionTypes } from '@aiprimary/core';
import { generateId } from '@/shared/lib/utils';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';

interface AddQuestionButtonProps {
  className?: string;
}

export const AddQuestionButton = ({ className }: AddQuestionButtonProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const { control, watch } = useFormContext<AssignmentFormData>();
  const { append } = useFieldArray({
    control,
    name: 'questions',
  });

  const topics = watch('topics');
  const defaultTopicId = topics[0]?.id || '';
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);
  const questions = watch('questions');

  const handleAddQuestion = (type: string) => {
    // Create appropriate data structure based on question type
    let data: any;
    switch (type) {
      case QUESTION_TYPE.MULTIPLE_CHOICE:
        data = { options: [] };
        break;
      case QUESTION_TYPE.MATCHING:
        data = { pairs: [] };
        break;
      case QUESTION_TYPE.OPEN_ENDED:
        data = { expectedAnswer: '', maxLength: 500 };
        break;
      case QUESTION_TYPE.FILL_IN_BLANK:
        data = { segments: [], caseSensitive: false };
        break;
      default:
        data = {};
    }

    append({
      question: {
        id: generateId(),
        type: type as any,
        difficulty: DIFFICULTY.KNOWLEDGE,
        title: '',
        topicId: defaultTopicId,
        explanation: '',
        data,
      },
      points: 10,
    } as any);

    // Switch to questions view and navigate to the new question
    setMainView('questions');
    setCurrentQuestionIndex(questions.length); // New question will be at the end
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" className={className}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addQuestion')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {getAllQuestionTypes({ includeGroup: false }).map((type) => (
          <DropdownMenuItem key={type.value} onClick={() => handleAddQuestion(type.value)}>
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
