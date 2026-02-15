import type { Question } from '@aiprimary/core';
import { QUESTION_TYPE } from '@/types/questionBank';
import { cn } from '@/lib/utils';
import { QuestionNumber } from './shared/QuestionNumber';
import { MultipleChoiceEditing, MultipleChoiceViewing } from './multiple-choice';
import { MatchingEditing, MatchingViewing } from './matching';
import { OpenEndedEditing, OpenEndedViewing } from './open-ended';
import { FillInBlankEditing, FillInBlankViewing } from './fill-in-blank';

type ViewMode = 'editing' | 'viewing';

interface QuestionRendererProps {
  question: Question;
  viewMode: ViewMode;
  points?: number;
  onChange?: (question: Question) => void;
  number?: number;
  compact?: boolean;
}

/**
 * QuestionRenderer Component (Admin - Simplified)
 *
 * Renders questions in EDITING or VIEWING mode only.
 * Used for creating/editing questions in the admin question bank.
 */
export const QuestionRenderer = ({
  question,
  viewMode,
  points,
  onChange,
  number,
  compact,
}: QuestionRendererProps) => {
  // Multiple Choice
  if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
    if (viewMode === 'editing') {
      return <MultipleChoiceEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      const componentContent = <MultipleChoiceViewing question={question as any} compact={compact} />;
      return (
        <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
          {number !== undefined && (
            <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
              <QuestionNumber number={number} className={compact ? 'h-6 w-6 text-xs' : undefined} />
            </div>
          )}
          {componentContent}
          {points !== undefined && (
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Points: {points}</p>
          )}
        </div>
      );
    }
  }

  // Matching
  if (question.type === QUESTION_TYPE.MATCHING) {
    if (viewMode === 'editing') {
      return <MatchingEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      const componentContent = <MatchingViewing question={question as any} compact={compact} />;
      return (
        <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
          {number !== undefined && (
            <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
              <QuestionNumber number={number} className={compact ? 'h-6 w-6 text-xs' : undefined} />
            </div>
          )}
          {componentContent}
          {points !== undefined && (
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Points: {points}</p>
          )}
        </div>
      );
    }
  }

  // Open-ended
  if (question.type === QUESTION_TYPE.OPEN_ENDED) {
    if (viewMode === 'editing') {
      return <OpenEndedEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      const componentContent = <OpenEndedViewing question={question as any} compact={compact} />;
      return (
        <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
          {number !== undefined && (
            <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
              <QuestionNumber number={number} className={compact ? 'h-6 w-6 text-xs' : undefined} />
            </div>
          )}
          {componentContent}
          {points !== undefined && (
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Points: {points}</p>
          )}
        </div>
      );
    }
  }

  // Fill In Blank
  if (question.type === QUESTION_TYPE.FILL_IN_BLANK) {
    if (viewMode === 'editing') {
      return <FillInBlankEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      const componentContent = <FillInBlankViewing question={question as any} compact={compact} />;
      return (
        <div className={cn(compact ? 'space-y-2' : 'space-y-4')}>
          {number !== undefined && (
            <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
              <QuestionNumber number={number} className={compact ? 'h-6 w-6 text-xs' : undefined} />
            </div>
          )}
          {componentContent}
          {points !== undefined && (
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>Points: {points}</p>
          )}
        </div>
      );
    }
  }

  return (
    <div className="rounded-md border p-8 text-center">
      <p className="text-destructive">Unknown question type: {question.type}</p>
    </div>
  );
};
