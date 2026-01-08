import type { Question, Answer } from '@aiprimary/core';
import type { ViewMode } from '../types';
import { QUESTION_TYPE, VIEW_MODE } from '../types';
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
  answer?: Answer;
  onChange?: (question: Question) => void;
  onAnswerChange?: (answer: Answer) => void;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
}

export const QuestionRenderer = ({
  question,
  viewMode,
  answer,
  onChange,
  onAnswerChange,
  onGradeChange,
}: QuestionRendererProps) => {
  // Multiple Choice
  if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
    if (viewMode === VIEW_MODE.EDITING) {
      return <MultipleChoiceEditing question={question} onChange={onChange!} />;
    }
    if (viewMode === VIEW_MODE.VIEWING) {
      return <MultipleChoiceViewing question={question} />;
    }
    if (viewMode === VIEW_MODE.DOING) {
      return (
        <MultipleChoiceDoing question={question} answer={answer as any} onAnswerChange={onAnswerChange!} />
      );
    }
    if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
      return <MultipleChoiceAfterAssessment question={question} answer={answer as any} />;
    }
    if (viewMode === VIEW_MODE.GRADING) {
      return (
        <MultipleChoiceGrading question={question} answer={answer as any} onGradeChange={onGradeChange!} />
      );
    }
  }

  // Matching
  if (question.type === QUESTION_TYPE.MATCHING) {
    if (viewMode === VIEW_MODE.EDITING) {
      return <MatchingEditing question={question} onChange={onChange!} />;
    }
    if (viewMode === VIEW_MODE.VIEWING) {
      return <MatchingViewing question={question} />;
    }
    if (viewMode === VIEW_MODE.DOING) {
      return <MatchingDoing question={question} answer={answer as any} onAnswerChange={onAnswerChange!} />;
    }
    if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
      return <MatchingAfterAssessment question={question} answer={answer as any} />;
    }
    if (viewMode === VIEW_MODE.GRADING) {
      return <MatchingGrading question={question} answer={answer as any} onGradeChange={onGradeChange!} />;
    }
  }

  // Open-ended
  if (question.type === QUESTION_TYPE.OPEN_ENDED) {
    if (viewMode === VIEW_MODE.EDITING) {
      return <OpenEndedEditing question={question} onChange={onChange!} />;
    }
    if (viewMode === VIEW_MODE.VIEWING) {
      return <OpenEndedViewing question={question} />;
    }
    if (viewMode === VIEW_MODE.DOING) {
      return <OpenEndedDoing question={question} answer={answer as any} onAnswerChange={onAnswerChange!} />;
    }
    if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
      return <OpenEndedAfterAssessment question={question} answer={answer as any} />;
    }
    if (viewMode === VIEW_MODE.GRADING) {
      return <OpenEndedGrading question={question} answer={answer as any} onGradeChange={onGradeChange!} />;
    }
  }

  // Fill In Blank
  if (question.type === QUESTION_TYPE.FILL_IN_BLANK) {
    if (viewMode === VIEW_MODE.EDITING) {
      return <FillInBlankEditing question={question} onChange={onChange!} />;
    }
    if (viewMode === VIEW_MODE.VIEWING) {
      return <FillInBlankViewing question={question} />;
    }
    if (viewMode === VIEW_MODE.DOING) {
      return <FillInBlankDoing question={question} answer={answer as any} onAnswerChange={onAnswerChange!} />;
    }
    if (viewMode === VIEW_MODE.AFTER_ASSESSMENT) {
      return <FillInBlankAfterAssessment question={question} answer={answer as any} />;
    }
    if (viewMode === VIEW_MODE.GRADING) {
      return <FillInBlankGrading question={question} answer={answer as any} onGradeChange={onGradeChange!} />;
    }
  }

  return (
    <div className="rounded-md border p-8 text-center">
      <p className="text-destructive">Unknown question type</p>
    </div>
  );
};
