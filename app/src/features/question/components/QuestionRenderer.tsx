import { useTranslation } from 'react-i18next';
import type { Question, Answer } from '@aiprimary/core';
import type { ViewMode } from '@/features/assignment/types';
import type { Context } from '@/features/context';
import { QUESTION_TYPE, VIEW_MODE } from '@/features/assignment/types';
import { ContextDisplay, useContext as useContextQuery } from '@/features/context';
import { Label } from '@/shared/components/ui/label';
import { ContextSelector } from './shared/ContextSelector';
import {
  MultipleChoiceEditing,
  MultipleChoiceViewing,
  MultipleChoiceDoing,
  MultipleChoiceAfterAssessment,
  MultipleChoiceGrading,
} from './multiple-choice';
import {
  OpenEndedEditing,
  OpenEndedViewing,
  OpenEndedDoing,
  OpenEndedAfterAssessment,
  OpenEndedGrading,
} from './open-ended';
import {
  FillInBlankEditing,
  FillInBlankViewing,
  FillInBlankDoing,
  FillInBlankAfterAssessment,
  FillInBlankGrading,
} from './fill-in-blank';
import {
  MatchingEditing,
  MatchingViewing,
  MatchingDoing,
  MatchingAfterAssessment,
  MatchingGrading,
} from './matching';

interface QuestionRendererProps {
  question: Question;
  viewMode: ViewMode;
  context?: Context; // Optional context (reading passage) to display above question
  contextId?: string; // Context ID for EDITING mode - used to fetch and display context
  answer?: Answer;
  points?: number; // Points for this question in assignment context (required for grading/after-assessment modes)
  onChange?: (question: Question) => void;
  onAnswerChange?: (answer: Answer) => void;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
  onContextChange?: (contextId: string | undefined) => void; // Callback for context changes in EDITING mode
  validationErrors?: { errors: string[]; warnings: string[] }; // Validation errors for this question (EDITING mode)
  number?: number;
  compact?: boolean;
}

export const QuestionRenderer = ({
  question,
  viewMode,
  context,
  contextId,
  answer,
  points,
  onChange,
  onAnswerChange,
  onGradeChange,
  onContextChange,
  validationErrors,
  number,
  compact,
}: QuestionRendererProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'context' });

  // Fetch context when contextId is provided (for EDITING mode)
  const { data: fetchedContext } = useContextQuery(contextId);
  const displayContext = context || fetchedContext;
  // Render question content based on type and view mode
  const renderQuestionContent = () => {
    const type = question?.type?.toUpperCase();

    // Multiple Choice
    if (type === QUESTION_TYPE.MULTIPLE_CHOICE) {
      const mcQuestion = question as any;
      if (viewMode === VIEW_MODE.EDITING) {
        return (
          <MultipleChoiceEditing
            question={mcQuestion}
            onChange={onChange!}
            validationErrors={validationErrors}
          />
        );
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MultipleChoiceViewing question={mcQuestion} number={number} compact={compact} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MultipleChoiceDoing
            question={mcQuestion}
            answer={answer as any}
            points={points}
            onAnswerChange={onAnswerChange!}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <MultipleChoiceAfterAssessment
            question={mcQuestion}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MultipleChoiceGrading
            question={mcQuestion}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Matching
    if (type === QUESTION_TYPE.MATCHING) {
      const mQuestion = question as any;
      if (viewMode === VIEW_MODE.EDITING) {
        return (
          <MatchingEditing question={mQuestion} onChange={onChange!} validationErrors={validationErrors} />
        );
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MatchingViewing question={mQuestion} number={number} compact={compact} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MatchingDoing
            question={mQuestion}
            answer={answer as any}
            points={points}
            onAnswerChange={onAnswerChange!}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <MatchingAfterAssessment
            question={mQuestion}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MatchingGrading
            question={mQuestion}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Open-ended
    if (type === QUESTION_TYPE.OPEN_ENDED) {
      const oeQuestion = question as any;
      if (viewMode === VIEW_MODE.EDITING) {
        return (
          <OpenEndedEditing question={oeQuestion} onChange={onChange!} validationErrors={validationErrors} />
        );
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <OpenEndedViewing question={oeQuestion} number={number} compact={compact} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <OpenEndedDoing
            question={oeQuestion}
            answer={answer as any}
            points={points}
            onAnswerChange={onAnswerChange!}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <OpenEndedAfterAssessment
            question={oeQuestion}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <OpenEndedGrading
            question={oeQuestion}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Fill In Blank
    if (type === QUESTION_TYPE.FILL_IN_BLANK) {
      const fibQuestion = question as any;
      if (viewMode === VIEW_MODE.EDITING) {
        return (
          <FillInBlankEditing
            question={fibQuestion}
            onChange={onChange!}
            validationErrors={validationErrors}
          />
        );
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <FillInBlankViewing question={fibQuestion} number={number} compact={compact} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <FillInBlankDoing
            question={fibQuestion}
            answer={answer as any}
            points={points}
            onAnswerChange={onAnswerChange!}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <FillInBlankAfterAssessment
            question={fibQuestion}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <FillInBlankGrading
            question={fibQuestion}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-destructive">Unknown question type: {String(question?.type)}</p>
      </div>
    );
  };

  // Render with optional context display
  const questionContent = renderQuestionContent();

  // EDITING mode: show context selector (if enabled) and read-only context display
  if (viewMode === VIEW_MODE.EDITING) {
    // Only show context UI if onContextChange is provided
    if (onContextChange) {
      return (
        <div className="space-y-4">
          {/* Context Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('contextLabel')}</Label>
            <ContextSelector value={contextId} onChange={onContextChange} />
          </div>

          {/* Read-only Context Display (if context is linked) */}
          {displayContext && <ContextDisplay context={displayContext} defaultCollapsed={false} />}

          {/* Question editing content */}
          {questionContent}
        </div>
      );
    }
    return questionContent;
  }

  // Non-EDITING modes: show context if provided
  if (displayContext) {
    return (
      <div className="space-y-4">
        <ContextDisplay context={displayContext} />
        {questionContent}
      </div>
    );
  }

  return questionContent;
};
