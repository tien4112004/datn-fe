import { useTranslation } from 'react-i18next';
import { FileQuestion } from 'lucide-react';
import { VIEW_MODE, getQuestionTypeName, getDifficultyName } from '@aiprimary/core';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { Badge } from '@/shared/components/ui/badge';
import type { Assignment } from '../../types';
import { useAssignmentViewerStore } from '../../stores/useAssignmentViewerStore';
import { LabelValuePair } from './LabelValuePair';

interface QuestionsViewPanelProps {
  assignment: Assignment;
}

export const QuestionsViewPanel = ({ assignment }: QuestionsViewPanelProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'viewer.questions' });
  const currentQuestionId = useAssignmentViewerStore((state) => state.currentQuestionId);

  const questions = assignment.questions || [];

  // Helper to extract question from mixed types
  const getQuestion = (item: any) => ('question' in item ? item.question : item);
  const getPoints = (item: any) => ('points' in item ? item.points : undefined);

  const questionIndex = questions.findIndex((q) => {
    const question = getQuestion(q);
    return question.id === currentQuestionId;
  });
  const assignmentQuestion = questions[questionIndex];

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

  const question = getQuestion(assignmentQuestion);
  const points = getPoints(assignmentQuestion);

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <FileQuestion className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('panelTitle', { number: questionIndex + 1 })}
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

      {/* Question Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <QuestionRenderer
          question={question}
          viewMode={VIEW_MODE.VIEWING}
          points={points}
          number={questionIndex + 1}
        />
      </div>
    </div>
  );
};
