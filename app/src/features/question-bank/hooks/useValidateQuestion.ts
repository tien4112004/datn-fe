import { useTranslation } from 'react-i18next';
import type { Question } from '@aiprimary/core';
import { QUESTION_TYPE } from '@aiprimary/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useValidateQuestion() {
  const { t } = useTranslation('questions');

  return (question: Question | null): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!question) {
      errors.push(t('validation.missingData'));
      return { isValid: false, errors, warnings };
    }

    // Common validations
    if (!question.title?.trim()) {
      errors.push(t('validation.titleRequired'));
    }

    // Type-specific validations
    switch (question.type) {
      case QUESTION_TYPE.MULTIPLE_CHOICE: {
        const opts = question.data.options || [];

        if (opts.length < 2) {
          errors.push(t('validation.minOptions'));
        }

        const hasCorrect = opts.some((o) => o.isCorrect);
        if (!hasCorrect) {
          errors.push(t('validation.exactlyOneCorrect'));
        }

        const emptyOptions = opts.filter((o) => !o.text?.trim());
        if (emptyOptions.length > 0) {
          errors.push(t('validation.emptyOptions', { count: emptyOptions.length }));
        }

        // Detect placeholder content
        const placeholderOptions = opts.filter((o) => /^Option \d+$/.test(o.text));
        if (placeholderOptions.length > 0) {
          warnings.push(t('validation.placeholderOptions', { count: placeholderOptions.length }));
        }

        break;
      }

      case QUESTION_TYPE.MATCHING: {
        const pairs = question.data.pairs || [];

        if (pairs.length < 2) {
          errors.push(t('validation.minPairs'));
        }

        const emptyLeftPairs = pairs.filter((p) => !p.left?.trim());
        const emptyRightPairs = pairs.filter((p) => !p.right?.trim());

        if (emptyLeftPairs.length > 0) {
          errors.push(t('validation.emptyLeftItems', { count: emptyLeftPairs.length }));
        }

        if (emptyRightPairs.length > 0) {
          errors.push(t('validation.emptyRightItems', { count: emptyRightPairs.length }));
        }

        // Detect placeholder content
        const placeholderPairs = pairs.filter(
          (p) => /^(Left|Right) \d+$/.test(p.left) || /^(Left|Right) \d+$/.test(p.right)
        );
        if (placeholderPairs.length > 0) {
          warnings.push(t('validation.placeholderPairs', { count: placeholderPairs.length }));
        }

        break;
      }

      case QUESTION_TYPE.FILL_IN_BLANK: {
        const segments = question.data.segments || [];
        const blanks = segments.filter((s) => s.type === 'blank');

        if (blanks.length === 0) {
          errors.push(t('validation.minSegments'));
        }

        const emptyBlanks = blanks.filter((b) => !b.content?.trim());
        if (emptyBlanks.length > 0) {
          errors.push(t('validation.emptyBlanks', { count: emptyBlanks.length }));
        }

        // Detect placeholder content
        const placeholderSegments = segments.filter(
          (s) => s.type === 'text' && /^Fill in the /.test(s.content)
        );
        if (placeholderSegments.length > 0) {
          warnings.push(t('validation.placeholderSegments'));
        }

        break;
      }

      case QUESTION_TYPE.OPEN_ENDED: {
        // More lenient for open-ended questions
        if (!question.data.expectedAnswer?.trim()) {
          warnings.push(t('validation.missingExpectedAnswer'));
        }

        if (question.data.maxLength && question.data.maxLength < 10) {
          warnings.push(t('validation.shortMaxLength'));
        }

        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };
}
