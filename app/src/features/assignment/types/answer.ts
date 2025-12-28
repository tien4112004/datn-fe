import { QUESTION_TYPE } from './constants';

// Student answer types for each question type
export interface MultipleChoiceAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  selectedOptionId: string;
}

export interface MatchingAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.MATCHING;
  matches: Array<{
    leftId: string;
    rightId: string;
  }>;
}

export interface OpenEndedAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.OPEN_ENDED;
  text: string;
}

export interface FillInBlankAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  blanks: Array<{
    segmentId: string;
    value: string;
  }>;
}

export type Answer = MultipleChoiceAnswer | MatchingAnswer | OpenEndedAnswer | FillInBlankAnswer;

// Grading data for each answer
export interface Grade {
  questionId: string;
  points: number;
  feedback?: string;
}

// Assignment submission
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  answers: Answer[];
  submittedAt: string;
  score?: number;
  maxScore?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  grades?: Grade[]; // Teacher's grades for each question
  gradedAt?: string; // When the grading was completed
  gradedBy?: string; // Teacher who graded
}

// Assignment entity
export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description?: string;
  questions: import('./question').Question[];
  dueDate?: string;
  totalPoints?: number;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}
