import React, { useMemo } from 'react';
import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection } from '../editor/CollapsibleSection';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import { groupQuestionsByContext } from '../../utils/questionGrouping';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentContext } from '../../types';
import {
  NavigatorToolbar,
  NavigatorContextGroupButton,
  NavigatorBaseQuestionButton,
} from '../shared/NavigatorShared';

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
      <div className="space-y-2">
        <NavigatorToolbar
          activeView={mainView}
          onInfoClick={() => setMainView('info')}
          onMatrixClick={() => setMainView('matrix')}
          onContextsClick={() => setMainView('contexts')}
          onQuestionsListClick={() => setMainView('questionsList')}
          tooltipInfo={t('assignmentInfo')}
          tooltipMatrix={t('matrixBuilder')}
          tooltipContexts={t('contexts')}
          tooltipQuestionsList={t('listView')}
        />

        {questions.length > 0 && <hr className="border-border" />}

        {questions.length > 0 && (
          <div className="grid grid-cols-5 gap-1.5 overflow-hidden">
            {groups.map((group) => {
              if (group.type === 'context') {
                const isContextActive = mainView === 'questions' && currentContextId === group.contextId;

                return (
                  <React.Fragment key={group.id}>
                    <NavigatorContextGroupButton
                      tooltipText={`${group.context?.title || tContext('readingPassage')} (${tContext('questionsCount', { count: group.questions.length })})`}
                      isActive={isContextActive}
                      onClick={() => handleContextClick(group.contextId!)}
                    />

                    {group.questions.map((aq) => {
                      const question = aq?.question;
                      if (!question) return null;
                      questionNumber++;
                      const isQuestionActive = mainView === 'questions' && currentQuestionId === question.id;
                      const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                      return (
                        <NavigatorBaseQuestionButton
                          key={question.id}
                          questionNumber={questionNumber}
                          isActive={isQuestionActive}
                          onClick={() => handleQuestionClick(question.id)}
                          hasTitle={hasTitle}
                          isInContext={true}
                          tooltipTitle={question.title || 'Untitled'}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              } else {
                const question = group.questions[0]?.question;
                if (!question) return null;
                questionNumber++;
                const isActive = mainView === 'questions' && currentQuestionId === question.id;
                const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                return (
                  <NavigatorBaseQuestionButton
                    key={group.id}
                    questionNumber={questionNumber}
                    isActive={isActive}
                    onClick={() => handleQuestionClick(question.id)}
                    hasTitle={hasTitle}
                    isInContext={false}
                    tooltipTitle={question.title || 'Untitled'}
                  />
                );
              }
            })}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
