/**
 * Assessment Constant Helper Utilities
 * Helper functions for working with assessment constants in a type-safe way
 */

import {
  QUESTION_TYPE,
  type QuestionType,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_I18N_KEYS,
  DIFFICULTY,
  type Difficulty,
  DIFFICULTY_LABELS,
  DIFFICULTY_I18N_KEYS,
  BANK_TYPE,
  type BankType,
  BANK_TYPE_LABELS,
  BANK_TYPE_I18N_KEYS,
  SUBJECT_CODE,
  type SubjectCode,
  SUBJECT_LABELS,
  SUBJECT_I18N_KEYS,
} from './constants';

/**
 * Generic constant item for UI components
 */
export interface ConstantItem<T = string> {
  value: T;
  label: string;
  i18nKey?: string;
}

// ============================================================================
// Question Type Helpers
// ============================================================================

/**
 * Get all question types as constant items
 */
export function getAllQuestionTypes(): ConstantItem<QuestionType>[] {
  return Object.values(QUESTION_TYPE).map((type) => ({
    value: type,
    label: QUESTION_TYPE_LABELS[type],
    i18nKey: QUESTION_TYPE_I18N_KEYS[type],
  }));
}

/**
 * Get the Vietnamese name for a question type
 */
export function getQuestionTypeName(type: QuestionType): string {
  return QUESTION_TYPE_LABELS[type] || type;
}

/**
 * Get the i18n key for a question type
 */
export function getQuestionTypeI18nKey(type: QuestionType): string {
  return QUESTION_TYPE_I18N_KEYS[type];
}

/**
 * Get mapping of question types to i18n keys
 */
export function getQuestionTypeI18nMap(): Record<QuestionType, string> {
  return { ...QUESTION_TYPE_I18N_KEYS };
}

/**
 * Get the badge CSS class for a question type
 */
export function getQuestionTypeBadgeClass(type: string): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800';
    case 'MATCHING':
      return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800';
    case 'FILL_IN_BLANK':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800';
    case 'OPEN_ENDED':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
    case 'GROUP':
      return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
}

// ============================================================================
// Difficulty Helpers
// ============================================================================

/**
 * Get all difficulties as constant items
 */
export function getAllDifficulties(): ConstantItem<Difficulty>[] {
  return Object.values(DIFFICULTY).map((difficulty) => ({
    value: difficulty,
    label: DIFFICULTY_LABELS[difficulty],
    i18nKey: DIFFICULTY_I18N_KEYS[difficulty],
  }));
}

/**
 * Get the Vietnamese name for a difficulty level
 */
export function getDifficultyName(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty] || difficulty;
}

/**
 * Get the i18n key for a difficulty level
 */
export function getDifficultyI18nKey(difficulty: Difficulty): string {
  return DIFFICULTY_I18N_KEYS[difficulty];
}

/**
 * Get mapping of difficulties to i18n keys
 */
export function getDifficultyI18nMap(): Record<Difficulty, string> {
  return { ...DIFFICULTY_I18N_KEYS };
}

/**
 * Get the badge CSS class for a difficulty level
 */
export function getDifficultyBadgeClass(difficulty: string): string {
  switch (difficulty) {
    case 'KNOWLEDGE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
    case 'COMPREHENSION':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
    case 'APPLICATION':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
    case 'ADVANCED_APPLICATION':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
}

// ============================================================================
// Bank Type Helpers
// ============================================================================

/**
 * Get all bank types as constant items
 */
export function getAllBankTypes(): ConstantItem<BankType>[] {
  return Object.values(BANK_TYPE).map((bankType) => ({
    value: bankType,
    label: BANK_TYPE_LABELS[bankType],
    i18nKey: BANK_TYPE_I18N_KEYS[bankType],
  }));
}

/**
 * Get the Vietnamese name for a bank type
 */
export function getBankTypeName(bankType: BankType): string {
  return BANK_TYPE_LABELS[bankType] || bankType;
}

/**
 * Get the i18n key for a bank type
 */
export function getBankTypeI18nKey(bankType: BankType): string {
  return BANK_TYPE_I18N_KEYS[bankType];
}

// ============================================================================
// Subject Helpers
// ============================================================================

/**
 * Get all subjects as constant items
 */
export function getAllSubjects(): ConstantItem<SubjectCode>[] {
  return Object.values(SUBJECT_CODE).map((code) => ({
    value: code,
    label: SUBJECT_LABELS[code],
    i18nKey: SUBJECT_I18N_KEYS[code],
  }));
}

/**
 * Get the Vietnamese name for a subject
 */
export function getSubjectLabel(subject: SubjectCode): string {
  return SUBJECT_LABELS[subject] || subject;
}

/**
 * Get the i18n key for a subject
 */
export function getSubjectI18nKey(subject: SubjectCode): string {
  return SUBJECT_I18N_KEYS[subject];
}

/**
 * Get mapping of subjects to i18n keys
 */
export function getSubjectI18nMap(): Record<SubjectCode, string> {
  return { ...SUBJECT_I18N_KEYS };
}

/**
 * Get the badge CSS class for a subject
 */
export function getSubjectBadgeClass(subject: string): string {
  switch (subject) {
    case 'T': // Math
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
    case 'TV': // Vietnamese
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
    case 'TA': // English
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800';
  }
}

// ============================================================================
// Generic Utilities
// ============================================================================

/**
 * Convert constant items to select/dropdown items
 */
export function toSelectItems<T>(
  items: ConstantItem<T>[],
  useI18n = false
): Array<{ value: T; label: string }> {
  return items.map((item) => ({
    value: item.value,
    label: useI18n && item.i18nKey ? item.i18nKey : item.label,
  }));
}
