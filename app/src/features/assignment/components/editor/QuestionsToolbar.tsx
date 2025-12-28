import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Database } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { AssignmentFormData } from '../../types';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import { generateId } from '../../utils';

export const QuestionsToolbar = () => {
  const { control, watch } = useFormContext<AssignmentFormData>();
  const { append } = useFieldArray({
    control,
    name: 'questions',
  });

  const topics = watch('topics');
  const defaultTopicId = topics[0]?.id || '';

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
      id: generateId(),
      type: type as any,
      difficulty: DIFFICULTY.EASY,
      title: '',
      topicId: defaultTopicId,
      explanation: '',
      points: 10,
      data,
    } as any);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="default">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.MULTIPLE_CHOICE)}>
            Multiple Choice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.MATCHING)}>
            Matching
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.OPEN_ENDED)}>
            Open Ended
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.FILL_IN_BLANK)}>
            Fill in the Blank
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="outline">
        <Database className="mr-2 h-4 w-4" />
        From Bank
      </Button>
    </div>
  );
};
