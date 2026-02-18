import type { Difficulty, QuestionType, SubjectCode } from './constants';
import type { Grade } from './grades';
import type { Question, AssignmentQuestion } from './question';
import type { MatrixDimensionTopic } from './assessmentMatrix';

/**
 * Context stored at assignment level (cloned & editable reading passages)
 */
export interface AssignmentContext {
  id: string;
  title: string;
  content: string;
  author?: string;
}

/**
 * Assignment topic (curriculum topic within an assignment)
 */
export interface AssignmentTopic {
  id: string;
  name: string;
  description?: string;
  chapters?: string[];
  hasContext?: boolean;
}

/**
 * Question with topic assignment (extends Question with topicId)
 */
export type QuestionWithTopic = Question & {
  topicId: string;
  contextId?: string;
};

/**
 * Assignment question with topic assignment
 */
export type AssignmentQuestionWithTopic = {
  question: QuestionWithTopic;
  points: number;
};

/**
 * Matrix structure for API requests/responses
 */
export interface ApiMatrix {
  grade: Grade;
  subject: SubjectCode;
  dimensions: {
    topics: MatrixDimensionTopic[];
    difficulties: Difficulty[];
    questionTypes: QuestionType[];
  };
  matrix: string[][][];
  totalQuestions: number;
  totalPoints: number;
}

/**
 * Matrix cell (topic x difficulty x questionType) - flat representation for UI
 */
export interface MatrixCell {
  id: string;
  topicId: string;
  topicName: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  requiredCount: number;
  currentCount: number;
  points?: number;
}

/**
 * Matrix cell with validation status
 */
export interface MatrixCellWithValidation extends MatrixCell {
  status: 'valid' | 'warning' | 'info';
  message?: string;
}

/**
 * Assignment entity
 */
export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subject?: SubjectCode;
  grade?: Grade;
  topics?: AssignmentTopic[];
  contexts?: AssignmentContext[];
  questions?: (AssignmentQuestion | AssignmentQuestionWithTopic)[];
  matrix?: ApiMatrix;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
  maxSubmissions?: number;
  allowRetake?: boolean;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
  passingScore?: number;
  availableFrom?: string;
  availableUntil?: string;
}
