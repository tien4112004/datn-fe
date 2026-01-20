import type { Question, GroupQuestion } from '@aiprimary/core';
import { QUESTION_TYPE } from '@/types/questionBank';
import { MultipleChoiceEditing, MultipleChoiceViewing } from './multiple-choice';
import { MatchingEditing, MatchingViewing } from './matching';
import { OpenEndedEditing, OpenEndedViewing } from './open-ended';
import { FillInBlankEditing, FillInBlankViewing } from './fill-in-blank';
import { GroupEditing, GroupViewing } from './group';

type ViewMode = 'editing' | 'viewing';

interface QuestionRendererProps {
  question: Question;
  viewMode: ViewMode;
  points?: number;
  onChange?: (question: Question) => void;
  number?: number;
}

/**
 * QuestionRenderer Component (Admin - Simplified)
 *
 * Renders questions in EDITING or VIEWING mode only.
 * Used for creating/editing questions in the admin question bank.
 */
export const QuestionRenderer = ({ question, viewMode, points, onChange, number }: QuestionRendererProps) => {
  // Multiple Choice
  if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
    if (viewMode === 'editing') {
      return <MultipleChoiceEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      return <MultipleChoiceViewing question={question as any} points={points} number={number} />;
    }
  }

  // Matching
  if (question.type === QUESTION_TYPE.MATCHING) {
    if (viewMode === 'editing') {
      return <MatchingEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      return <MatchingViewing question={question as any} points={points} number={number} />;
    }
  }

  // Open-ended
  if (question.type === QUESTION_TYPE.OPEN_ENDED) {
    if (viewMode === 'editing') {
      return <OpenEndedEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      return <OpenEndedViewing question={question as any} points={points} number={number} />;
    }
  }

  // Fill In Blank
  if (question.type === QUESTION_TYPE.FILL_IN_BLANK) {
    if (viewMode === 'editing') {
      return <FillInBlankEditing question={question as any} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      return <FillInBlankViewing question={question as any} points={points} number={number} />;
    }
  }

  // Group Question
  if (question.type === QUESTION_TYPE.GROUP) {
    if (viewMode === 'editing') {
      return <GroupEditing question={question as GroupQuestion} onChange={onChange!} />;
    }
    if (viewMode === 'viewing') {
      return <GroupViewing question={question as GroupQuestion} points={points} number={number} />;
    }
  }

  return (
    <div className="rounded-md border p-8 text-center">
      <p className="text-destructive">Unknown question type: {question.type}</p>
    </div>
  );
};
