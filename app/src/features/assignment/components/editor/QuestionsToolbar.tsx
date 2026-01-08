import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Database, Wand2, Eye, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { AssignmentFormData } from '../../types';
import { QUESTION_TYPE, DIFFICULTY } from '../../types';
import { generateId } from '../../utils';
import { QuestionCountIndicator } from './QuestionCountIndicator';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { VIEW_MODE } from '@aiprimary/core';

export const QuestionsToolbar = () => {
  const { control, watch } = useFormContext<AssignmentFormData>();
  const { append } = useFieldArray({
    control,
    name: 'questions',
  });

  const topics = watch('topics');
  const questions = watch('questions');
  const defaultTopicId = topics[0]?.id || '';

  const currentQuestionIndex = useAssignmentEditorStore((state) => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);
  const setQuestionBankOpen = useAssignmentEditorStore((state) => state.setQuestionBankOpen);
  const questionViewModes = useAssignmentEditorStore((state) => state.questionViewModes);
  const setQuestionViewMode = useAssignmentEditorStore((state) => state.setQuestionViewMode);

  const handleToggleAllMode = () => {
    if (isAllPreviewing) {
      // If all are previewing, switch all to editing
      questions?.forEach((question) => {
        setQuestionViewMode(question.id || '', VIEW_MODE.EDITING);
      });
    } else {
      // Otherwise switch all to previewing
      questions?.forEach((question) => {
        setQuestionViewMode(question.id || '', VIEW_MODE.VIEWING);
      });
    }
  };

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

  const isAllPreviewing =
    questions?.length > 0 && questions.every((q) => questionViewModes.get(q.id || '') === VIEW_MODE.VIEWING);
  const isAllEditing =
    questions?.length === 0 ||
    questions.every((q) => (questionViewModes.get(q.id || '') || VIEW_MODE.EDITING) === VIEW_MODE.EDITING);

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left: Question Navigation */}
      <QuestionCountIndicator
        currentIndex={currentQuestionIndex}
        totalQuestions={questions?.length || 0}
        onNavigate={setCurrentQuestionIndex}
      />

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Toggle All Mode */}
        {questions?.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleAllMode}
                  className="gap-1 border-r border-gray-300 pr-3 dark:border-gray-600"
                >
                  {isAllPreviewing ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Preview Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Mode</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllPreviewing ? 'Switch all to edit mode' : 'Switch all to preview mode'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" disabled>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </TooltipTrigger>
            <TooltipContent>AI generation coming soon</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Create a new question</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => setQuestionBankOpen(true)}>
                <Database className="mr-2 h-4 w-4" />
                From Bank
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import questions from question bank</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
