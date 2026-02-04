import type { Question, Answer } from '@aiprimary/core';
import type { ViewMode } from '@/features/assignment/types';
import type { Context } from '@/features/assignment/types/context';
import { QUESTION_TYPE, VIEW_MODE } from '@/features/assignment/types';
import { ContextDisplay } from '@/features/assignment/components/context/ContextDisplay';
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
  answer?: Answer;
  points?: number; // Points for this question in assignment context (required for grading/after-assessment modes)
  onChange?: (question: Question) => void;
  onAnswerChange?: (answer: Answer) => void;
  onGradeChange?: (grade: { points: number; feedback?: string }) => void;
  number?: number;
}

export const QuestionRenderer = ({
  question,
  viewMode,
  context,
  answer,
  points,
  onChange,
  onAnswerChange,
  onGradeChange,
  number,
}: QuestionRendererProps) => {
  // Render question content based on type and view mode
  const renderQuestionContent = () => {
    // Multiple Choice
    if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
      if (viewMode === VIEW_MODE.EDITING) {
        return <MultipleChoiceEditing question={question} onChange={onChange!} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MultipleChoiceViewing question={question} points={points} number={number} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MultipleChoiceDoing
            question={question}
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
            question={question}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MultipleChoiceGrading
            question={question}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Matching
    if (question.type === QUESTION_TYPE.MATCHING) {
      if (viewMode === VIEW_MODE.EDITING) {
        return <MatchingEditing question={question} onChange={onChange!} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <MatchingViewing question={question} points={points} number={number} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <MatchingDoing
            question={question}
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
            question={question}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <MatchingGrading
            question={question}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Open-ended
    if (question.type === QUESTION_TYPE.OPEN_ENDED) {
      if (viewMode === VIEW_MODE.EDITING) {
        return <OpenEndedEditing question={question} onChange={onChange!} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <OpenEndedViewing question={question} points={points} number={number} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <OpenEndedDoing
            question={question}
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
            question={question}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <OpenEndedGrading
            question={question}
            answer={answer as any}
            points={points}
            onGradeChange={onGradeChange!}
            number={number}
          />
        );
      }
    }

    // Fill In Blank
    if (question.type === QUESTION_TYPE.FILL_IN_BLANK) {
      if (viewMode === VIEW_MODE.EDITING) {
        return <FillInBlankEditing question={question} onChange={onChange!} />;
      }
      if (viewMode === VIEW_MODE.VIEWING) {
        return <FillInBlankViewing question={question} points={points} number={number} />;
      }
      if (viewMode === VIEW_MODE.DOING) {
        return (
          <FillInBlankDoing
            question={question}
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
            question={question}
            answer={answer as any}
            points={points}
            number={number}
          />
        );
      }
      if (viewMode === VIEW_MODE.GRADING) {
        return (
          <FillInBlankGrading
            question={question}
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
        <p className="text-destructive">Unknown question type</p>
      </div>
    );
  };

  // Render with optional context display
  const questionContent = renderQuestionContent();

  if (context) {
    return (
      <div className="space-y-4">
        <ContextDisplay context={context} />
        {questionContent}
      </div>
    );
  }

  return questionContent;
};
