import type { QuestionBankItem } from '@/types/questionBank';
import { QUESTION_TYPE, DIFFICULTY, SUBJECT_CODE } from '@/types/questionBank';

export interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate parsed questions
 */
export function validateQuestionBankCSV(questions: QuestionBankItem[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (questions.length === 0) {
    errors.push({ row: 0, message: 'No valid questions found in CSV' });
    return { isValid: false, errors, warnings };
  }

  questions.forEach((question, index) => {
    const rowNumber = index + 2; // +2 because: 1 for header, 1 for 0-indexed

    // Validate basic fields
    if (!question.title || question.title.trim().length === 0) {
      errors.push({ row: rowNumber, field: 'title', message: 'Title is required' });
    }

    if (question.title && question.title.length > 500) {
      warnings.push({ row: rowNumber, field: 'title', message: 'Title is very long (>500 chars)' });
    }

    if (!question.type) {
      errors.push({ row: rowNumber, field: 'type', message: 'Question type is required' });
    } else if (!Object.values(QUESTION_TYPE).includes(question.type as any)) {
      errors.push({
        row: rowNumber,
        field: 'type',
        message: `Invalid question type: ${question.type}`,
      });
    }

    if (!question.difficulty) {
      errors.push({ row: rowNumber, field: 'difficulty', message: 'Difficulty is required' });
    } else if (!Object.values(DIFFICULTY).includes(question.difficulty as any)) {
      errors.push({
        row: rowNumber,
        field: 'difficulty',
        message: `Invalid difficulty: ${question.difficulty}`,
      });
    }

    if (!question.subjectCode) {
      errors.push({ row: rowNumber, field: 'subjectCode', message: 'Subject code is required' });
    } else if (!Object.values(SUBJECT_CODE).includes(question.subjectCode as any)) {
      errors.push({
        row: rowNumber,
        field: 'subjectCode',
        message: `Invalid subject code: ${question.subjectCode}`,
      });
    }

    if (question.points && (question.points < 1 || question.points > 100)) {
      warnings.push({
        row: rowNumber,
        field: 'points',
        message: 'Points should be between 1 and 100',
      });
    }

    // Type-specific validation
    switch (question.type) {
      case QUESTION_TYPE.MULTIPLE_CHOICE:
        validateMultipleChoice(question, rowNumber, errors, warnings);
        break;
      case QUESTION_TYPE.MATCHING:
        validateMatching(question, rowNumber, errors, warnings);
        break;
      case QUESTION_TYPE.OPEN_ENDED:
        validateOpenEnded(question, rowNumber, errors, warnings);
        break;
      case QUESTION_TYPE.FILL_IN_BLANK:
        validateFillInBlank(question, rowNumber, errors, warnings);
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateMultipleChoice(
  question: QuestionBankItem,
  row: number,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (question.type !== QUESTION_TYPE.MULTIPLE_CHOICE) return;

  if (!question.data.options || question.data.options.length < 2) {
    errors.push({ row, field: 'options', message: 'At least 2 options are required' });
    return;
  }

  if (question.data.options.length > 6) {
    warnings.push({ row, field: 'options', message: 'More than 6 options may be confusing' });
  }

  const correctCount = question.data.options.filter((o) => o.isCorrect).length;
  if (correctCount === 0) {
    errors.push({ row, field: 'correctOption', message: 'At least one correct option is required' });
  } else if (correctCount > 1) {
    warnings.push({
      row,
      field: 'correctOption',
      message: 'Multiple correct options found (multi-select)',
    });
  }

  question.data.options.forEach((option, idx) => {
    if (!option.text || option.text.trim().length === 0) {
      errors.push({
        row,
        field: `option${idx + 1}`,
        message: `Option ${idx + 1} text is required`,
      });
    }
  });
}

function validateMatching(
  question: QuestionBankItem,
  row: number,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (question.type !== QUESTION_TYPE.MATCHING) return;

  if (!question.data.pairs || question.data.pairs.length < 2) {
    errors.push({ row, field: 'pairs', message: 'At least 2 matching pairs are required' });
    return;
  }

  if (question.data.pairs.length > 10) {
    warnings.push({ row, field: 'pairs', message: 'More than 10 pairs may be difficult to match' });
  }

  question.data.pairs.forEach((pair, idx) => {
    if (!pair.left || pair.left.trim().length === 0) {
      errors.push({
        row,
        field: `pair${idx + 1}_left`,
        message: `Pair ${idx + 1} left side is required`,
      });
    }
    if (!pair.right || pair.right.trim().length === 0) {
      errors.push({
        row,
        field: `pair${idx + 1}_right`,
        message: `Pair ${idx + 1} right side is required`,
      });
    }
  });
}

function validateOpenEnded(
  question: QuestionBankItem,
  row: number,
  _errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (question.type !== QUESTION_TYPE.OPEN_ENDED) return;

  if (question.data.maxLength && question.data.maxLength < 10) {
    warnings.push({ row, field: 'maxLength', message: 'Max length is very short (<10 chars)' });
  }

  if (question.data.maxLength && question.data.maxLength > 5000) {
    warnings.push({ row, field: 'maxLength', message: 'Max length is very long (>5000 chars)' });
  }

  if (!question.data.expectedAnswer || question.data.expectedAnswer.trim().length === 0) {
    warnings.push({
      row,
      field: 'expectedAnswer',
      message: 'Expected answer is recommended for grading reference',
    });
  }
}

function validateFillInBlank(
  question: QuestionBankItem,
  row: number,
  errors: ValidationError[],
  warnings: ValidationError[]
): void {
  if (question.type !== QUESTION_TYPE.FILL_IN_BLANK) return;

  if (!question.data.segments || question.data.segments.length === 0) {
    errors.push({ row, field: 'segments', message: 'Question segments are required' });
    return;
  }

  const blankCount = question.data.segments.filter((s) => s.type === 'blank').length;

  if (blankCount === 0) {
    errors.push({ row, field: 'text', message: 'At least one {blank} placeholder is required' });
  }

  if (blankCount > 10) {
    warnings.push({ row, field: 'text', message: 'More than 10 blanks may be confusing' });
  }

  question.data.segments.forEach((segment, idx) => {
    if (segment.type === 'blank') {
      if (!segment.content || segment.content.trim().length === 0) {
        errors.push({
          row,
          field: 'blanks',
          message: `Blank ${idx + 1} answer is required`,
        });
      }
    }
  });
}

/**
 * Check for duplicate questions
 */
export function checkDuplicates(
  newQuestions: QuestionBankItem[],
  existingQuestions: QuestionBankItem[]
): string[] {
  const duplicates: string[] = [];

  newQuestions.forEach((newQ) => {
    const isDuplicate = existingQuestions.some(
      (existingQ) =>
        existingQ.title.toLowerCase().trim() === newQ.title.toLowerCase().trim() &&
        existingQ.subjectCode === newQ.subjectCode &&
        existingQ.type === newQ.type
    );

    if (isDuplicate) {
      duplicates.push(newQ.title);
    }
  });

  return duplicates;
}
