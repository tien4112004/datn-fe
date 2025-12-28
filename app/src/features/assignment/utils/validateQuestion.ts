import type { Question } from '@/features/assignment/types';
import { QUESTION_TYPE } from '@/features/assignment/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateQuestion(question: Question | null): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!question) {
    errors.push('Question data is missing');
    return { isValid: false, errors, warnings };
  }

  // Common validations
  if (!question.title?.trim()) {
    errors.push('Question title is required');
  }

  if (!question.points || question.points < 1) {
    errors.push('Points must be at least 1');
  }

  // Type-specific validations
  switch (question.type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE: {
      const opts = question.data.options || [];

      if (opts.length < 2) {
        errors.push('Multiple choice requires at least 2 options');
      }

      const hasCorrect = opts.some((o) => o.isCorrect);
      if (!hasCorrect) {
        errors.push('At least one option must be marked as correct');
      }

      const emptyOptions = opts.filter((o) => !o.text?.trim());
      if (emptyOptions.length > 0) {
        errors.push(`${emptyOptions.length} option(s) have no text`);
      }

      // Detect placeholder content
      const placeholderOptions = opts.filter((o) => /^Option \d+$/.test(o.text));
      if (placeholderOptions.length > 0) {
        warnings.push(
          `${placeholderOptions.length} option(s) appear to use placeholder text (e.g., "Option 1")`
        );
      }

      break;
    }

    case QUESTION_TYPE.MATCHING: {
      const pairs = question.data.pairs || [];

      if (pairs.length < 2) {
        errors.push('Matching requires at least 2 pairs');
      }

      const emptyLeftPairs = pairs.filter((p) => !p.left?.trim());
      const emptyRightPairs = pairs.filter((p) => !p.right?.trim());

      if (emptyLeftPairs.length > 0) {
        errors.push(`${emptyLeftPairs.length} pair(s) have no left value`);
      }

      if (emptyRightPairs.length > 0) {
        errors.push(`${emptyRightPairs.length} pair(s) have no right value`);
      }

      // Detect placeholder content
      const placeholderPairs = pairs.filter(
        (p) => /^(Left|Right) \d+$/.test(p.left) || /^(Left|Right) \d+$/.test(p.right)
      );
      if (placeholderPairs.length > 0) {
        warnings.push(`${placeholderPairs.length} pair(s) appear to use placeholder text (e.g., "Left 1")`);
      }

      break;
    }

    case QUESTION_TYPE.FILL_IN_BLANK: {
      const segments = question.data.segments || [];
      const blanks = segments.filter((s) => s.type === 'blank');

      if (blanks.length === 0) {
        errors.push('Fill-in-blank must have at least one blank');
      }

      const emptyBlanks = blanks.filter((b) => !b.content?.trim());
      if (emptyBlanks.length > 0) {
        errors.push(`${emptyBlanks.length} blank(s) have no correct answer`);
      }

      // Detect placeholder content
      const placeholderSegments = segments.filter(
        (s) => s.type === 'text' && /^Fill in the /.test(s.content)
      );
      if (placeholderSegments.length > 0) {
        warnings.push('Some segments appear to use placeholder text (e.g., "Fill in the blank")');
      }

      break;
    }

    case QUESTION_TYPE.OPEN_ENDED: {
      // More lenient for open-ended questions
      if (!question.data.expectedAnswer?.trim()) {
        warnings.push('Consider adding an expected answer for grading reference');
      }

      if (question.data.maxLength && question.data.maxLength < 10) {
        warnings.push('Maximum length seems very short (less than 10 characters)');
      }

      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
