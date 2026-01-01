import {
  QUESTION_TYPE,
  type Difficulty,
  type QuestionType,
  type SubjectCode,
  type BankType,
} from './constants';

/**
 * Base interface for all questions
 * Contains common properties shared across all question types
 */
export interface BaseQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Type of the question (multiple choice, matching, etc.) */
  type: QuestionType;
  /** Difficulty level based on Vietnamese education system */
  difficulty: Difficulty;
  /** Question text (Markdown-enabled) */
  title: string;
  /** Optional image URL for the question */
  titleImageUrl?: string;
  /** Explanation shown in After Assessment mode (Markdown-enabled) */
  explanation?: string;
  /** Points allocated for this question */
  points?: number;

  // Question bank metadata (optional for backward compatibility)
  /** Subject classification */
  subjectCode?: SubjectCode;
  /** Personal or application-wide bank */
  bankType?: BankType;
  /** ISO timestamp of creation */
  createdAt?: string;
  /** ISO timestamp of last update */
  updatedAt?: string;
  /** User ID of the question creator */
  createdBy?: string;
}

/**
 * Multiple Choice Question
 * Student selects one correct answer from multiple options
 */
export interface MultipleChoiceOption {
  /** Unique identifier for this option */
  id: string;
  /** Option text (Markdown-enabled) */
  text: string;
  /** Optional image URL for this option */
  imageUrl?: string;
  /** In editing mode, marks the correct answer */
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  /** Array of answer options (typically 2-4 options) */
  options: MultipleChoiceOption[];
  /** Shuffle options for each student (default: false) */
  shuffleOptions?: boolean;
}

/**
 * Matching Question
 * Student matches pairs of related items (left to right)
 */
export interface MatchingPair {
  /** Unique identifier for this pair */
  id: string;
  /** Left item text (Markdown-enabled) */
  left: string;
  /** Optional image URL for left item */
  leftImageUrl?: string;
  /** Right item text (Markdown-enabled) */
  right: string;
  /** Optional image URL for right item */
  rightImageUrl?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MATCHING;
  /** Array of matching pairs */
  pairs: MatchingPair[];
  /** Shuffle pairs for each student (default: false) */
  shufflePairs?: boolean;
}

/**
 * Open-ended Question
 * Student provides a free-form text answer
 */
export interface OpenEndedQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.OPEN_ENDED;
  /** Optional reference answer for grading guidance (Markdown-enabled) */
  expectedAnswer?: string;
  /** Character limit for student response */
  maxLength?: number;
}

/**
 * Fill In Blank Question
 * Student fills in missing words/phrases in a text
 */
export interface BlankSegment {
  /** Unique identifier for this segment */
  id: string;
  /** Type of segment: 'text' for static text, 'blank' for fillable field */
  type: 'text' | 'blank';
  /** For 'text' type: the text to display; for 'blank': the correct answer */
  content: string;
  /** Alternative correct answers for a blank segment */
  acceptableAnswers?: string[];
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  /** Array of segments alternating between text and blanks */
  segments: BlankSegment[];
  /** Whether blank answers should be case-sensitive */
  caseSensitive?: boolean;
}

/**
 * Union type for all question types
 * Use type guards to narrow to specific question type
 */
export type Question = MultipleChoiceQuestion | MatchingQuestion | OpenEndedQuestion | FillInBlankQuestion;

/**
 * Type guards for runtime type checking
 */

/** Check if a question is Multiple Choice */
export const isMultipleChoice = (q: Question): q is MultipleChoiceQuestion =>
  q.type === QUESTION_TYPE.MULTIPLE_CHOICE;

/** Check if a question is Matching */
export const isMatching = (q: Question): q is MatchingQuestion => q.type === QUESTION_TYPE.MATCHING;

/** Check if a question is Open-ended */
export const isOpenEnded = (q: Question): q is OpenEndedQuestion => q.type === QUESTION_TYPE.OPEN_ENDED;

/** Check if a question is Fill In Blank */
export const isFillInBlank = (q: Question): q is FillInBlankQuestion =>
  q.type === QUESTION_TYPE.FILL_IN_BLANK;
