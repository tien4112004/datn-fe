import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileQuestion, BookOpen } from 'lucide-react';
import { VIEW_MODE, getQuestionTypeName, getDifficultyName } from '@aiprimary/core';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { Badge } from '@/shared/components/ui/badge';
import type { Assignment, AssignmentQuestionWithTopic, AssignmentContext } from '../../types';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import { LabelValuePair } from './LabelValuePair';
import { ContextDisplay } from '@/features/context';
import { ContextGroupView } from '../context/ContextGroupView';
import { useQuestionContexts } from '../../hooks/useQuestionContexts';
import {
  groupQuestionsByContext,
  getQuestionDisplayNumber,
  type GroupingContext,
} from '../../utils/questionGrouping';

interface QuestionsViewPanelProps {
  assignment: Assignment;
}

export const QuestionsViewPanel = ({ assignment }: QuestionsViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.questions' });
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });

  const currentQuestionId = useAssignmentViewerStore((state) => state.currentQuestionId);
  const currentContextId = useAssignmentViewerStore((state) => state.currentContextId);

  const questions = (assignment.questions || []) as AssignmentQuestionWithTopic[];
  const assignmentContexts = (assignment as any).contexts as AssignmentContext[] | undefined;

  // Use assignment's cloned contexts if available, otherwise fetch from API
  const { contextsMap: apiContextsMap } = useQuestionContexts(
    // Only fetch from API if assignment doesn't have cloned contexts
    assignmentContexts?.length ? [] : questions
  );

  // Build contexts map from assignment's cloned contexts or API
  const contextsMap = useMemo(() => {
    if (assignmentContexts?.length) {
      const map = new Map<string, GroupingContext>();
      assignmentContexts.forEach((ctx) => map.set(ctx.id, ctx));
      return map;
    }
    return apiContextsMap;
  }, [assignmentContexts, apiContextsMap]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  // Helper to extract question from mixed types
  const getQuestion = (item: any) => ('question' in item ? item.question : item);
  const getPoints = (item: any) => ('points' in item ? item.points : undefined);

  // Find selected context group
  const selectedContextGroup = useMemo(() => {
    if (!currentContextId) return null;
    return groups.find((g) => g.type === 'context' && g.contextId === currentContextId);
  }, [groups, currentContextId]);

  // Find selected question
  const questionIndex = questions.findIndex((q) => {
    const question = getQuestion(q);
    return question.id === currentQuestionId;
  });
  const assignmentQuestion = questions[questionIndex];

  // Get display number for individual question
  const questionDisplayNumber = useMemo(() => {
    if (!currentQuestionId) return 0;
    return getQuestionDisplayNumber(groups, currentQuestionId);
  }, [groups, currentQuestionId]);

  // Get start number for context group
  const contextStartNumber = useMemo(() => {
    if (!selectedContextGroup) return 1;
    // Find the first question in the context group and get its display number
    const firstQuestion = selectedContextGroup.questions[0];
    if (!firstQuestion) return 1;
    return getQuestionDisplayNumber(groups, firstQuestion.question.id);
  }, [groups, selectedContextGroup]);

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('noQuestions')}</h2>
        </div>
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('noQuestionsDescription')}</p>
        </div>
      </div>
    );
  }

  // Context group selected - show ContextGroupView
  if (selectedContextGroup && selectedContextGroup.context) {
    return (
      <div className="space-y-6">
        {/* Panel Header */}
        <div className="flex items-center gap-3 border-b pb-4">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedContextGroup.context.title || tContext('readingPassage')}
          </h2>
          <Badge variant="secondary">
            {tContext('questionsCount', { count: selectedContextGroup.questions.length })}
          </Badge>
        </div>

        {/* Context Group View */}
        <ContextGroupView
          context={selectedContextGroup.context}
          questions={selectedContextGroup.questions}
          viewMode={VIEW_MODE.VIEWING}
          startNumber={contextStartNumber}
        />
      </div>
    );
  }

  // No selection state
  if (!assignmentQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('noQuestionSelected')}</h2>
        </div>
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('selectQuestion')}</p>
        </div>
      </div>
    );
  }

  // Individual question selected
  const question = getQuestion(assignmentQuestion);
  const points = getPoints(assignmentQuestion);
  const contextId = (question as any).contextId;

  // Fetch context if question has a contextId
  const context = contextId ? contextsMap.get(contextId) : undefined;

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('panelTitle', { number: questionDisplayNumber })}
        </h2>
        <Badge variant="secondary">{getQuestionTypeName(question.type)}</Badge>
      </div>

      {/* Question Metadata */}
      <div className="grid grid-cols-3 gap-4">
        <LabelValuePair
          label={t('topic')}
          value={(assignment.topics || []).find((topic) => topic.id === (question as any).topicId)?.name}
        />
        <LabelValuePair label={t('difficulty')} value={getDifficultyName(question.difficulty)} />
        <LabelValuePair label={t('points')} value={points} />
      </div>

      {/* Context (Reading Passage) */}
      {context && <ContextDisplay context={context as any} />}

      {/* Question Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <QuestionRenderer
          question={question}
          viewMode={VIEW_MODE.VIEWING}
          points={points}
          number={questionDisplayNumber}
        />
      </div>
    </div>
  );
};
