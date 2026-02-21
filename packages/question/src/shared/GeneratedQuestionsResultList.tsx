import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@ui/badge';
import { Card, CardContent } from '@ui/card';
import { cn } from '@ui/lib/utils';
import type { QuestionBankItem } from '@aiprimary/core';
import {
  getQuestionTypeName,
  getQuestionTypeBadgeClass,
  getSubjectBadgeClass,
  getSubjectName,
  getGradeName,
} from '@aiprimary/core';
import { QuestionNumber } from './QuestionNumber';
import { DifficultyBadge } from './DifficultyBadge';

interface CardHeaderSlots {
  left?: ReactNode;
  right?: ReactNode;
}

interface GeneratedQuestionsResultListProps {
  questions: QuestionBankItem[];
  renderQuestion?: (question: QuestionBankItem, index: number) => ReactNode;
  renderCardHeader?: (question: QuestionBankItem, index: number) => CardHeaderSlots;
  showMetadata?: boolean;
  className?: string;
}

export function GeneratedQuestionsResultList({
  questions,
  renderQuestion,
  renderCardHeader,
  showMetadata = false,
  className,
}: GeneratedQuestionsResultListProps) {
  const { t } = useTranslation('questions');

  if (questions.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center text-sm">
        {t('generatedResults.noQuestions')}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {questions.map((question, index) => {
        const headerSlots = renderCardHeader?.(question, index);

        return (
          <Card key={question.id || index} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header: optional left slot, question number, badges, optional right slot */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {headerSlots?.left}
                  <QuestionNumber number={index + 1} className="h-6 w-6 text-xs" />
                  <Badge variant="outline" className={cn('text-xs', getQuestionTypeBadgeClass(question.type))}>
                    {getQuestionTypeName(question.type)}
                  </Badge>
                  <DifficultyBadge difficulty={question.difficulty} className="text-xs" />
                  {showMetadata && question.subject && (
                    <Badge variant="outline" className={cn('text-xs', getSubjectBadgeClass(question.subject))}>
                      {getSubjectName(question.subject)}
                    </Badge>
                  )}
                  {showMetadata && question.grade && (
                    <Badge variant="outline" className="text-xs">
                      {getGradeName(question.grade)}
                    </Badge>
                  )}
                </div>
                {headerSlots?.right}
              </div>

              {/* Question content via render prop or fallback to title */}
              <div className="mt-2">
                {renderQuestion ? (
                  renderQuestion(question, index)
                ) : (
                  <p className="text-sm font-medium leading-relaxed">{question.title}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
