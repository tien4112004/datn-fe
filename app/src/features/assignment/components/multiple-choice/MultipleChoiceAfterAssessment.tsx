import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '../../types';
import { MarkdownPreview, AnswerFeedback, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface MultipleChoiceAfterAssessmentProps {
  question: MultipleChoiceQuestion;
  answer?: MultipleChoiceAnswer;
}

export const MultipleChoiceAfterAssessment = ({ question, answer }: MultipleChoiceAfterAssessmentProps) => {
  const selectedOption = answer
    ? question.data.options.find((o) => o.id === answer.selectedOptionId)
    : undefined;
  const isCorrect = selectedOption?.isCorrect || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Multiple Choice Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Title */}
        <div className="space-y-2">
          <MarkdownPreview content={question.title} />
          {question.titleImageUrl && (
            <img src={question.titleImageUrl} alt="Question" className="mt-2 max-h-64 rounded-md border" />
          )}
        </div>

        {/* Answer Feedback */}
        <AnswerFeedback
          isCorrect={isCorrect}
          score={isCorrect ? question.points : 0}
          totalPoints={question.points}
        />

        {/* Options with feedback */}
        <div className="space-y-2">
          {question.data.options.map((option, index) => {
            const isSelected = answer ? option.id === answer.selectedOptionId : false;
            const isCorrectOption = option.isCorrect;

            return (
              <div
                key={option.id}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3',
                  isCorrectOption && 'border-green-200 bg-green-50 dark:bg-green-900/20',
                  isSelected && !isCorrectOption && 'border-red-200 bg-red-50 dark:bg-red-900/20'
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  {isCorrectOption && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  {isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600" />}
                  {!isSelected && !isCorrectOption && (
                    <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <MarkdownPreview content={option.text} />
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${String.fromCharCode(65 + index)}`}
                      className="mt-2 max-h-32 rounded-md border"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {question.explanation && (
          <div className="bg-muted/50 rounded-md p-4">
            <h4 className="mb-2 font-semibold">Explanation:</h4>
            <MarkdownPreview content={question.explanation} />
          </div>
        )}

        {/* Points */}
        {question.points && (
          <p className="text-muted-foreground text-sm">
            Points: {isCorrect ? question.points : 0}/{question.points}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
