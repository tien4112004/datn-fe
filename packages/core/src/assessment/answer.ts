import { QUESTION_TYPE } from './constants';

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
  selectedOptionId: string; // ID of the selected option
}

/**
 * Answer for Matching Question
 * Student creates pairs by matching left items to right items
 */
export interface MatchingAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.MATCHING;
  matches: Array<{
    // Array of matched pairs (leftId → rightId)
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
  text: string; // Student's text response
}

/**
 * Answer for Fill In Blank Question
 * Student provides text for each blank segment
 */
export interface FillInBlankAnswer {
  questionId: string;
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  blanks: Array<{
    // Array of blank answers (segmentId → value)
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
  questionId: string; // ID of the question being graded
  points: number; // Points awarded (0 to AssignmentQuestion's max points)
  feedback?: string; // Optional feedback from teacher
}

/**
 * Assignment submission
 * Represents a student's complete submission for an assignment
 */
export interface Submission {
  id: string; // Unique identifier for this submission
  assignmentId: string; // Reference to the assignment
  studentId: string; // Reference to the student
  student?: {
    // Populated student information (when included by backend)
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  answers: Answer[]; // Student's answers to all questions
  submittedAt: string; // ISO timestamp when submitted
  score?: number; // Total score (sum of all question grades)
  maxScore?: number; // Maximum possible score
  status: 'in_progress' | 'submitted' | 'graded'; // Current status of the submission
  grades?: Grade[]; // Teacher's grades for each question (available after grading)
  feedback?: string; // Overall feedback from teacher
  gradedAt?: string; // ISO timestamp when grading was completed
  gradedBy?: string; // User ID of teacher who graded
}

/**
 * Assignment entity
 * Represents a complete assignment with questions and metadata
 */
export interface Assignment {
  id: string; // Unique identifier for this assignment
  classId: string; // Reference to the class this assignment belongs to
  title: string; // Assignment title
  description?: string; // Optional description (Markdown-enabled)
  questions: import('./question').AssignmentQuestion[]; // Array of questions with assigned points
  dueDate?: string; // Optional due date (ISO timestamp)
  totalPoints?: number; // Total points possible (sum of all question points)
  createdAt: string; // ISO timestamp of creation
  updatedAt: string; // ISO timestamp of last update
  status: 'draft' | 'published' | 'archived'; // Current status of the assignment
  shuffleQuestions?: boolean; // Shuffle question order for each student (default: false)
}
