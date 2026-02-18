import { useTranslation } from 'react-i18next';
import type { OpenEndedQuestion, OpenEndedAnswer } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core';
import { MarkdownPreview, QuestionTitle, GradeFeedback } from '../shared';

import { Badge } from '@ui/badge';

interface OpenEndedAfterAssessmentProps {
  question: OpenEndedQuestion;
  answer?: OpenEndedAnswer;
  points?: number; // Points allocated for this question in the assignment
  grade?: Grade; // Grade for this question
}

export const OpenEndedAfterAssessment = ({
  question,
  answer,
  points = 0,
  grade,
}: OpenEndedAfterAssessmentProps) => {
  const { t } = useTranslation('questions');

  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="space-y-2">
        <QuestionTitle content={question.title} />
        {question.titleImageUrl && (
          <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
        )}
      </div>

      {/* Grade Display or Pending Note */}
      {grade ? (
        <GradeFeedback grade={grade} maxPoints={points} />
      ) : (
        <>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              {t('openEnded.afterAssessment.manualGradingNote')}
            </p>
          </div>
          {points > 0 && (
            <p className="text-muted-foreground text-sm">
              {t('openEnded.afterAssessment.pendingGrading', { maxPoints: points })}
            </p>
          )}
        </>
      )}

      {/* Student Answer */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{t('common.yourAnswer')}:</h4>
          <Badge variant="outline">{t('common.submitted')}</Badge>
        </div>
        <div className="bg-muted/50 rounded-md px-4 py-2">
          {answer?.text ? (
            <p className="whitespace-pre-wrap">{answer.text}</p>
          ) : (
            <p className="text-muted-foreground italic">{t('common.noAnswer')}</p>
          )}
        </div>
      </div>

      {/* Expected Answer (if provided) */}
      {question.data.expectedAnswer && (
        <div className="space-y-2">
          <h4 className="font-semibold">{t('common.expectedAnswer')}:</h4>
          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
            <MarkdownPreview content={question.data.expectedAnswer} />
          </div>
        </div>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="bg-muted/50 rounded-md px-4 py-2">
          <h4 className="mb-2 font-semibold">{t('common.explanation')}:</h4>
          <MarkdownPreview content={question.explanation} />
        </div>
      )}
    </div>
  );
};
