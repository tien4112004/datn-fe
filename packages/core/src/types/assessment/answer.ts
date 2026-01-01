import { QUESTION_TYPE } from './constants';
import type { Question } from './question';

/**
 * Student answer types for each question type
 * These represent the student's response to a question
 */

/**
 * Answer for Multiple Choice Question
 * Student selects one option by ID
 */
export interface MultipleChoiceAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  /** ID of the selected option */
  selectedOptionId: string;
}

/**
 * Answer for Matching Question
 * Student creates pairs by matching left items to right items
 */
export interface MatchingAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.MATCHING;
  /** Array of matched pairs (leftId → rightId) */
  matches: Array<{
    leftId: string;
    rightId: string;
  }>;
}

/**
 * Answer for Open-ended Question
 * Student provides free-form text response
 */
export interface OpenEndedAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.OPEN_ENDED;
  /** Student's text response */
  text: string;
}

/**
 * Answer for Fill In Blank Question
 * Student provides text for each blank segment
 */
export interface FillInBlankAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  /** Array of blank answers (segmentId → value) */
  blanks: Array<{
    segmentId: string;
    value: string;
  }>;
}

/**
 * Union type for all answer types
 */
export type Answer = MultipleChoiceAnswer | MatchingAnswer | OpenEndedAnswer | FillInBlankAnswer;

/**
 * Grading data for each answer
 * Provided by the teacher during grading
 */
export interface Grade {
  /** ID of the question being graded */
  questionId: string;
  /** Points awarded (0 to question's max points) */
  points: number;
  /** Optional feedback from teacher */
  feedback?: string;
}

/**
 * Assignment submission
 * Represents a student's complete submission for an assignment
 */
export interface Submission {
  /** Unique identifier for this submission */
  id: string;
  /** Reference to the assignment */
  assignmentId: string;
  /** Reference to the student */
  studentId: string;
  /** Student's answers to all questions */
  answers: Answer[];
  /** ISO timestamp when submitted */
  submittedAt: string;
  /** Total score (sum of all question grades) */
  score?: number;
  /** Maximum possible score */
  maxScore?: number;
  /** Current status of the submission */
  status: 'in_progress' | 'submitted' | 'graded';
  /** Teacher's grades for each question (available after grading) */
  grades?: Grade[];
  /** ISO timestamp when grading was completed */
  gradedAt?: string;
  /** User ID of teacher who graded */
  gradedBy?: string;
}

/**
 * Assignment entity
 * Represents a complete assignment with questions and metadata
 */
export interface Assignment {
  /** Unique identifier for this assignment */
  id: string;
  /** Reference to the class this assignment belongs to */
  classId: string;
  /** Assignment title */
  title: string;
  /** Optional description (Markdown-enabled) */
  description?: string;
  /** Array of questions included in this assignment */
  questions: Question[];
  /** Optional due date (ISO timestamp) */
  dueDate?: string;
  /** Total points possible (sum of all question points) */
  totalPoints?: number;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Current status of the assignment */
  status: 'draft' | 'published' | 'archived';
  /** Shuffle question order for each student (default: false) */
  shuffleQuestions?: boolean;
}
