import React, { useMemo } from 'react';
import { List, FileText, Grid3x3, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CollapsibleSection } from '../editor/CollapsibleSection';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import { groupQuestionsByContext } from '../../utils/questionGrouping';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentContext } from '../../types';

interface QuestionViewNavigatorProps {
  assignment: Assignment;
}

export const QuestionViewNavigator = ({ assignment }: QuestionViewNavigatorProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.navigator' });
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });

  const mainView = useAssignmentViewerStore((state) => state.mainView);
  const currentQuestionId = useAssignmentViewerStore((state) => state.currentQuestionId);
  const currentContextId = useAssignmentViewerStore((state) => state.currentContextId);
  const setMainView = useAssignmentViewerStore((state) => state.setMainView);
  const setCurrentQuestionId = useAssignmentViewerStore((state) => state.setCurrentQuestionId);
  const setCurrentContextId = useAssignmentViewerStore((state) => state.setCurrentContextId);

  const questions = (assignment.questions || []) as AssignmentQuestionWithTopic[];
  const assignmentContexts = ((assignment as any).contexts || []) as AssignmentContext[];

  // Build contexts map from assignment's cloned contexts
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    assignmentContexts.forEach((ctx) => map.set(ctx.id, ctx));
    return map;
  }, [assignmentContexts]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  const handleQuestionClick = (questionId: string) => {
    setMainView('questions');
    setCurrentQuestionId(questionId);
  };

  const handleContextClick = (contextId: string) => {
    setMainView('questions');
    setCurrentContextId(contextId);
  };

  // Track question numbers across groups
  let questionNumber = 0;

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="grid grid-cols-5 gap-1.5 overflow-hidden">
        {/* Assignment Info Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setMainView('info')}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
                mainView === 'info'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              <FileText className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('assignmentInfo')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Matrix Viewer Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setMainView('matrix')}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
                mainView === 'matrix'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              <Grid3x3 className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('matrixBuilder')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Contexts Panel Icon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setMainView('contexts')}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
                mainView === 'contexts'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              <BookOpen className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('contexts')}</p>
          </TooltipContent>
        </Tooltip>

        {/* Groups: Context groups and standalone questions */}
        {groups.map((group) => {
          if (group.type === 'context') {
            // Context group - show BookOpen icon THEN individual questions
            const isContextActive = mainView === 'questions' && currentContextId === group.contextId;

            return (
              <React.Fragment key={group.id}>
                {/* Context group icon - click to view all questions together */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => handleContextClick(group.contextId!)}
                      className={cn(
                        'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
                        isContextActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                      )}
                    >
                      <BookOpen className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {group.context?.title || tContext('readingPassage')} (
                      {tContext('questionsCount', { count: group.questions.length })})
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Individual questions in the context group */}
                {group.questions.map((aq) => {
                  const question = aq?.question;
                  if (!question) return null;
                  questionNumber++;
                  const isQuestionActive = mainView === 'questions' && currentQuestionId === question.id;
                  const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                  return (
                    <Tooltip key={question.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleQuestionClick(question.id)}
                          className={cn(
                            'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
                            isQuestionActive
                              ? 'bg-primary text-primary-foreground'
                              : hasTitle
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
                                : 'bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900'
                          )}
                        >
                          {questionNumber}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{question.title || 'Untitled'}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </React.Fragment>
            );
          } else {
            // Standalone question (no context)
            const question = group.questions[0]?.question;
            if (!question) return null;
            questionNumber++;
            const isActive = mainView === 'questions' && currentQuestionId === question.id;
            const hasTitle = Boolean(question.title) && question.title.trim() !== '';

            return (
              <Tooltip key={group.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleQuestionClick(question.id)}
                    className={cn(
                      'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : hasTitle
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    )}
                  >
                    {questionNumber}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{question.title || 'Untitled'}</p>
                </TooltipContent>
              </Tooltip>
            );
          }
        })}
      </div>
    </CollapsibleSection>
  );
};
