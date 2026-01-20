import { useTranslation } from 'react-i18next';
import type { SubQuestion } from '@aiprimary/core';
import type { ViewMode } from '@/features/assignment/types';
import { VIEW_MODE } from '@/features/assignment/types';
import {
  MultipleChoiceEditing,
  MultipleChoiceViewing,
  MultipleChoiceDoing,
  MultipleChoiceAfterAssessment,
  MultipleChoiceGrading,
} from '../multiple-choice';
import {
  MatchingEditing,
  MatchingViewing,
  MatchingDoing,
  MatchingAfterAssessment,
  MatchingGrading,
} from '../matching';
import {
  OpenEndedEditing,
  OpenEndedViewing,
  OpenEndedDoing,
  OpenEndedAfterAssessment,
  OpenEndedGrading,
} from '../open-ended';
import {
  FillInBlankEditing,
  FillInBlankViewing,
  FillInBlankDoing,
  FillInBlankAfterAssessment,
  FillInBlankGrading,
} from '../fill-in-blank';
import { QuestionNumber, indexToLetter } from '../shared';

interface SubQuestionWrapperProps {
  question: SubQuestion;
  viewMode: ViewMode;
  answer?: any;
  points?: number;
  onChange?: (updated: SubQuestion) => void;
  onAnswerChange?: (answer: any) => void;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
  index?: number;
  showNumber?: boolean;
}

/**
 * SubQuestionWrapper Component
 *
 * Renders a single sub-question by delegating to the appropriate question type component
 * based on the question type and view mode. This eliminates code duplication by reusing
 * all existing question components.
 */
export function SubQuestionWrapper({
  question,
  viewMode,
  answer,
  points,
  onChange,
  onAnswerChange,
  onGradeChange,
  index,
  showNumber = true,
}: SubQuestionWrapperProps) {
  const { t } = useTranslation('questions');

  // Convert SubQuestion to Question format for type compatibility
  const convertedQuestion: any = {
    id: question.id,
    type: question.type.toLowerCase(),
    title: question.title,
    titleImageUrl: question.titleImageUrl,
    explanation: question.explanation,
    data: question.data,
    difficulty: 'nhan_biet', // Default difficulty for sub-questions
  };

  // Convert answer format if needed
  const convertedAnswer: any = answer
    ? {
        questionId: question.id,
        type: question.type.toLowerCase(),
        ...answer,
      }
    : undefined;

  // Handler to convert onChange callbacks back to SubQuestion format
  const handleChange = (updatedQuestion: any) => {
    if (onChange) {
      const updatedSubQuestion: SubQuestion = {
        ...question,
        title: updatedQuestion.title,
        titleImageUrl: updatedQuestion.titleImageUrl,
        explanation: updatedQuestion.explanation,
        data: updatedQuestion.data,
      };
      onChange(updatedSubQuestion);
    }
  };

  // Render the appropriate component based on question type and view mode
  const renderQuestionComponent = () => {
    const questionType = question.type.toUpperCase();

    // Multiple Choice
    if (questionType === 'MULTIPLE_CHOICE') {
      if (viewMode === VIEW_MODE.EDITING) {
        return <MultipleChoiceEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MultipleChoiceViewing question={convertedQuestion} points={points} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MultipleChoiceDoing
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onAnswerChange={onAnswerChange!}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <MultipleChoiceAfterAssessment
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MultipleChoiceGrading
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onGradeChange={onGradeChange!}
          />
        );
      }
    }

    // Matching
    if (questionType === 'MATCHING') {
      if (viewMode === VIEW_MODE.EDITING) {
        return <MatchingEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MatchingViewing question={convertedQuestion} points={points} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MatchingDoing
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onAnswerChange={onAnswerChange!}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <MatchingAfterAssessment question={convertedQuestion} answer={convertedAnswer} points={points} />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MatchingGrading
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onGradeChange={onGradeChange!}
          />
        );
      }
    }

    // Open Ended
    if (questionType === 'OPEN_ENDED') {
      if (viewMode === VIEW_MODE.EDITING) {
        return <OpenEndedEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <OpenEndedViewing question={convertedQuestion} points={points} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <OpenEndedDoing
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onAnswerChange={onAnswerChange!}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <OpenEndedAfterAssessment question={convertedQuestion} answer={convertedAnswer} points={points} />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <OpenEndedGrading
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onGradeChange={onGradeChange!}
          />
        );
      }
    }

    // Fill In Blank
    if (questionType === 'FILL_IN_BLANK') {
      if (viewMode === VIEW_MODE.EDITING) {
        return <FillInBlankEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <FillInBlankViewing question={convertedQuestion} points={points} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <FillInBlankDoing
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onAnswerChange={onAnswerChange!}
          />
        );
      }
      if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
        return (
          <FillInBlankAfterAssessment question={convertedQuestion} answer={convertedAnswer} points={points} />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <FillInBlankGrading
            question={convertedQuestion}
            answer={convertedAnswer}
            points={points}
            onGradeChange={onGradeChange!}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {/* Question Header with Number and Points */}
      {(showNumber || points !== undefined) && (
        <div className="flex items-center gap-3">
          {showNumber && index !== undefined && <QuestionNumber number={indexToLetter(index)} />}
          {points !== undefined && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {points} {t('common.pointsAbbreviation', { count: points })}
            </span>
          )}
        </div>
      )}

      {/* Question Component */}
      <div className={showNumber && index !== undefined ? 'ml-11' : ''}>{renderQuestionComponent()}</div>
    </div>
  );
}
