import { QUESTION_TYPE, type Difficulty, type QuestionType } from './constants';

/**
 * Multiple Choice Question Data
 */
export interface MultipleChoiceOption {
  id: string; // Unique identifier for this option
  text: string; // Option text (Markdown-enabled)
  imageUrl?: string; // Optional image URL for this option
  isCorrect: boolean; // In editing mode, marks the correct answer
}

export interface MultipleChoiceData {
  options: MultipleChoiceOption[]; // Array of answer options (typically 2-4 options)
  shuffleOptions?: boolean; // Shuffle options for each student (default: false)
}

/**
 * Matching Question Data
 */
export interface MatchingPair {
  id: string; // Unique identifier for this pair
  left: string; // Left item text (Markdown-enabled)
  leftImageUrl?: string; // Optional image URL for left item
  right: string; // Right item text (Markdown-enabled)
  rightImageUrl?: string; // Optional image URL for right item
}

export interface MatchingData {
  pairs: MatchingPair[]; // Array of matching pairs
  shufflePairs?: boolean; // Shuffle pairs for each student (default: false)
}

/**
 * Open-ended Question Data
 */
export interface OpenEndedData {
  expectedAnswer?: string; // Optional reference answer for grading guidance (Markdown-enabled)
  maxLength?: number; // Character limit for student response
}

/**
 * Fill In Blank Question Data
 */
export interface BlankSegment {
  id: string; // Unique identifier for this segment
  type: 'text' | 'blank'; // Type of segment: 'text' for static text, 'blank' for fillable field
  content: string; // For 'text' type: the text to display; for 'blank': the correct answer
  acceptableAnswers?: string[]; // Alternative correct answers for a blank segment
}

export interface FillInBlankData {
  segments: BlankSegment[]; // Array of segments alternating between text and blanks
  caseSensitive?: boolean; // Whether blank answers should be case-sensitive
}

/**
 * Sub-Question within a Group Question
 */
export interface SubQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MATCHING' | 'OPEN_ENDED' | 'FILL_IN_BLANK';
  title: string;
  titleImageUrl?: string;
  explanation?: string;
  data: MultipleChoiceData | MatchingData | OpenEndedData | FillInBlankData;
  points?: number;
}

/**
 * Group Question Data
 * Contains a description/context and multiple sub-questions
 */
export interface GroupQuestionData {
  description?: string; // Rich text introduction/context (e.g., reading passage)
  questions: SubQuestion[]; // Array of sub-questions
  showQuestionNumbers?: boolean; // Whether to show question numbers
  shuffleQuestions?: boolean; // Shuffle questions for each student
}

/**
 * Union type for all question data types
 */
export type QuestionData =
  | MultipleChoiceData
  | MatchingData
  | OpenEndedData
  | FillInBlankData
  | GroupQuestionData;

/**
 * Base interface for all questions
 * Contains common properties shared across all question types
 */
export interface BaseQuestion {
  id: string; // Unique identifier for the question
  type: QuestionType; // Type of the question (multiple choice, matching, etc.)
  difficulty: Difficulty; // Difficulty level based on Vietnamese education system
  title: string; // Question text (Markdown-enabled)
  titleImageUrl?: string; // Optional image URL for the question
  explanation?: string; // Explanation shown in After Assessment mode (Markdown-enabled)
  data: QuestionData; // Question-type-specific data (options, pairs, segments, etc.)
}

/**
 * Multiple Choice Question
 * Student selects one correct answer from multiple options
 */
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MULTIPLE_CHOICE;
  data: MultipleChoiceData;
}

/**
 * Matching Question
 * Student matches pairs of related items (left to right)
 */
export interface MatchingQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.MATCHING;
  data: MatchingData;
}

/**
 * Open-ended Question
 * Student provides a free-form text answer
 */
export interface OpenEndedQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.OPEN_ENDED;
  data: OpenEndedData;
}

/**
 * Fill In Blank Question
 * Student fills in missing words/phrases in a text
 */
export interface FillInBlankQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.FILL_IN_BLANK;
  data: FillInBlankData;
}

/**
 * Group Question
 * Contains multiple sub-questions with a shared context/description
 */
export interface GroupQuestion extends BaseQuestion {
  type: typeof QUESTION_TYPE.GROUP;
  data: GroupQuestionData;
}

/**
 * Union type for all question types
 * Use type guards to narrow to specific question type
 */
export type Question =
  | MultipleChoiceQuestion
  | MatchingQuestion
  | OpenEndedQuestion
  | FillInBlankQuestion
  | GroupQuestion;

/**
 * Type guards for runtime type checking
 */

export const isMultipleChoice = (q: Question): q is MultipleChoiceQuestion =>
  // Check if a question is Multiple Choice
  q.type === QUESTION_TYPE.MULTIPLE_CHOICE;

export const isMatching = (q: Question): q is MatchingQuestion => q.type === QUESTION_TYPE.MATCHING; // Check if a question is Matching

export const isOpenEnded = (q: Question): q is OpenEndedQuestion => q.type === QUESTION_TYPE.OPEN_ENDED; // Check if a question is Open-ended

export const isFillInBlank = (q: Question): q is FillInBlankQuestion =>
  // Check if a question is Fill In Blank
  q.type === QUESTION_TYPE.FILL_IN_BLANK;

export const isGroup = (q: Question): q is GroupQuestion =>
  // Check if a question is Group
  q.type === QUESTION_TYPE.GROUP;

/**
 * Assignment Question
 * Wraps a Question with assignment-specific metadata like points.
 * This separates the concern of scoring from the base question definition,
 * allowing the same question to have different points in different assignments.
 */
export interface AssignmentQuestion {
  question: Question; // The question content and structure
  points: number; // Points allocated for this question in the assignment context (required)
}
