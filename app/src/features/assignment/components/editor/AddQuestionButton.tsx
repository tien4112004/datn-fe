import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  QUESTION_TYPE,
  DIFFICULTY,
  type AssignmentQuestionWithTopic,
  type QuestionWithTopic,
} from '../../types';
import { getAllQuestionTypes, type Question } from '@aiprimary/core';
import { generateId } from '@/shared/lib/utils';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';

interface AddQuestionButtonProps {
  className?: string;
}

export const AddQuestionButton = ({ className }: AddQuestionButtonProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const { t: tQuestions } = useTranslation('questions');

  // Get data and actions from stores
  const topics = useAssignmentFormStore((state) => state.topics);
  const addQuestion = useAssignmentFormStore((state) => state.addQuestion);
  const defaultTopicId = topics[0]?.id || '';
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const setCurrentQuestionId = useAssignmentEditorStore((state) => state.setCurrentQuestionId);

  const handleAddQuestion = (questionType: string) => {
    // Create appropriate data structure based on question type with better defaults
    let data: Question['data'] = {};
    switch (questionType) {
      case QUESTION_TYPE.MULTIPLE_CHOICE:
        data = {
          options: [
            { id: generateId(), text: '', isCorrect: false },
            { id: generateId(), text: '', isCorrect: false },
            { id: generateId(), text: '', isCorrect: false },
            { id: generateId(), text: '', isCorrect: false },
          ],
        };
        break;
      case QUESTION_TYPE.MATCHING:
        data = {
          pairs: [
            { id: generateId(), left: '', right: '' },
            { id: generateId(), left: '', right: '' },
            { id: generateId(), left: '', right: '' },
          ],
        };
        break;
      case QUESTION_TYPE.OPEN_ENDED:
        data = { expectedAnswer: '', maxLength: 500 };
        break;
      case QUESTION_TYPE.FILL_IN_BLANK:
        data = {
          segments: [
            { id: generateId(), type: 'text', content: '' },
            { id: generateId(), type: 'blank', content: '' },
            { id: generateId(), type: 'text', content: '' },
          ],
          caseSensitive: false,
        };
        break;
    }

    const newQuestion: AssignmentQuestionWithTopic = {
      question: {
        id: generateId(),
        type: questionType,
        difficulty: DIFFICULTY.KNOWLEDGE,
        title: '',
        topicId: defaultTopicId,
        explanation: '',
        data,
      } as QuestionWithTopic,
      points: 10,
    };

    addQuestion(newQuestion);

    // Switch to questions view and navigate to the new question
    setMainView('questions');
    setCurrentQuestionId(newQuestion.question.id); // Navigate to the newly added question
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" className={className}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addQuestion')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tooltips.addQuestion')}</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {getAllQuestionTypes().map((type) => (
          <Tooltip key={type.value}>
            <TooltipTrigger asChild>
              <DropdownMenuItem onClick={() => handleAddQuestion(type.value)}>{type.label}</DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="max-w-xs">
                {tQuestions((type.i18nKey?.replace('types.', 'typeTooltips.') || type.value) as any)}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
