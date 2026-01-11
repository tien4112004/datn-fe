import { useFormContext, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { generateId } from '@/shared/lib/utils';
import { QuestionCountIndicator } from './QuestionCountIndicator';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { VIEW_MODE } from '@aiprimary/core';

export const QuestionsToolbar = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questions.toolbar' });
  const { t: tTypes } = useTranslation('assignment', { keyPrefix: 'questionTypes' });
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
      questions?.forEach((aq) => {
        setQuestionViewMode(aq.question.id || '', VIEW_MODE.EDITING);
      });
    } else {
      // Otherwise switch all to previewing
      questions?.forEach((aq) => {
        setQuestionViewMode(aq.question.id || '', VIEW_MODE.VIEWING);
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
      question: {
        id: generateId(),
        type: type as any,
        difficulty: DIFFICULTY.EASY,
        title: '',
        topicId: defaultTopicId,
        explanation: '',
        data,
      },
      points: 10,
    } as any);
  };

  const isAllPreviewing =
    questions?.length > 0 &&
    questions.every((aq) => questionViewModes.get(aq.question.id || '') === VIEW_MODE.VIEWING);

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
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleToggleAllMode}
                  className="gap-1 border-r border-gray-300 pr-3 dark:border-gray-600"
                >
                  {isAllPreviewing ? (
                    <>
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('previewMode')}</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('editMode')}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllPreviewing ? t('tooltips.switchToEdit') : t('tooltips.switchToPreview')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" size="sm" variant="outline" disabled>
                <Wand2 className="mr-2 h-4 w-4" />
                {t('generate')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('tooltips.generate')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm" variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addQuestion')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.MULTIPLE_CHOICE)}>
                    {tTypes('multipleChoice')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.MATCHING)}>
                    {tTypes('matching')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.OPEN_ENDED)}>
                    {tTypes('openEnded')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddQuestion(QUESTION_TYPE.FILL_IN_BLANK)}>
                    {tTypes('fillInBlank')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>{t('tooltips.addQuestion')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" size="sm" variant="outline" onClick={() => setQuestionBankOpen(true)}>
                <Database className="mr-2 h-4 w-4" />
                {t('fromBank')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('tooltips.fromBank')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
