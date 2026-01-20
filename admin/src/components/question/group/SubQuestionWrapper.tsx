import type { SubQuestion } from '@aiprimary/core';
import { MultipleChoiceEditing, MultipleChoiceViewing } from '../multiple-choice';
import { MatchingEditing, MatchingViewing } from '../matching';
import { OpenEndedEditing, OpenEndedViewing } from '../open-ended';
import { FillInBlankEditing, FillInBlankViewing } from '../fill-in-blank';
import { QuestionNumber, indexToLetter } from '../shared';

type ViewMode = 'editing' | 'viewing';

interface SubQuestionWrapperProps {
  question: SubQuestion;
  viewMode: ViewMode;
  points?: number;
  onChange?: (updated: SubQuestion) => void;
  index?: number;
  showNumber?: boolean;
}

/**
 * SubQuestionWrapper Component (Admin - Simplified)
 *
 * Renders a single sub-question by delegating to the appropriate question type component
 * based on the question type and view mode. Only supports EDITING and VIEWING modes.
 */
export function SubQuestionWrapper({
  question,
  viewMode,
  points,
  onChange,
  index,
  showNumber = true,
}: SubQuestionWrapperProps) {
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
      if (viewMode === 'editing') {
        return <MultipleChoiceEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === 'viewing') {
        return <MultipleChoiceViewing question={convertedQuestion} points={points} />;
      }
    }

    // Matching
    if (questionType === 'MATCHING') {
      if (viewMode === 'editing') {
        return <MatchingEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === 'viewing') {
        return <MatchingViewing question={convertedQuestion} points={points} />;
      }
    }

    // Open Ended
    if (questionType === 'OPEN_ENDED') {
      if (viewMode === 'editing') {
        return <OpenEndedEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === 'viewing') {
        return <OpenEndedViewing question={convertedQuestion} points={points} />;
      }
    }

    // Fill In Blank
    if (questionType === 'FILL_IN_BLANK') {
      if (viewMode === 'editing') {
        return <FillInBlankEditing question={convertedQuestion} onChange={handleChange} />;
      }
      if (viewMode === 'viewing') {
        return <FillInBlankViewing question={convertedQuestion} points={points} />;
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
              {points} pts
            </span>
          )}
        </div>
      )}

      {/* Question Component */}
      <div className={showNumber && index !== undefined ? 'ml-11' : ''}>{renderQuestionComponent()}</div>
    </div>
  );
}
