import {
  QUESTION_TYPE,
  type Difficulty,
  type QuestionType,
  type SubjectCode,
  type BankType,
} from './constants';

// Base interface for all questions
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  title: string; // Markdown-enabled question text
  titleImageUrl?: string; // Optional image in question
  explanation?: string; // Markdown-enabled explanation (shown in After Assessment mode)
  points?: number; // For scoring
  // Question bank metadata (optional for backward compatibility)
  subjectCode?: SubjectCode; // Subject classification
  bankType?: BankType; // Personal or application-wide
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  createdBy?: string; // User ID of creator
}

// Multiple Choice Question
export interface MultipleChoiceOption {
  id: string;
  text: string; // Markdown-enabled
  imageUrl?: string; // Optional image in option
  isCorrect: boolean; // In editing mode, marks correct answer
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  options: MultipleChoiceOption[];
  shuffleOptions?: boolean; // Shuffle options for each student (default: false)
}

// Matching Question
export interface MatchingPair {
  id: string;
  left: string; // Markdown-enabled
  leftImageUrl?: string;
  right: string; // Markdown-enabled
  rightImageUrl?: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MATCHING;
  pairs: MatchingPair[];
  shufflePairs?: boolean; // Shuffle pairs for each student (default: false)
}

// Open-ended Question
export interface OpenEndedQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.OPEN_ENDED;
  expectedAnswer?: string; // Optional reference answer (markdown)
  maxLength?: number; // Character limit for student response
}

// Fill In Blank Question
export interface BlankSegment {
  id: string;
  type: 'text' | 'blank';
  content: string; // For 'text' type: the text; for 'blank': correct answer
  acceptableAnswers?: string[]; // Alternative correct answers for blank
}

export interface FillInBlankQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  segments: BlankSegment[]; // Array alternating text and blanks
  caseSensitive?: boolean;
}

// Union type for all question types
export type Question = MultipleChoiceQuestion | MatchingQuestion | OpenEndedQuestion | FillInBlankQuestion;

// Type guards
export const isMultipleChoice = (q: Question): q is MultipleChoiceQuestion =>
  q.type === QUESTION_TYPE.MULTIPLE_CHOICE;

export const isMatching = (q: Question): q is MatchingQuestion => q.type === QUESTION_TYPE.MATCHING;

export const isOpenEnded = (q: Question): q is OpenEndedQuestion => q.type === QUESTION_TYPE.OPEN_ENDED;

export const isFillInBlank = (q: Question): q is FillInBlankQuestion =>
  q.type === QUESTION_TYPE.FILL_IN_BLANK;
