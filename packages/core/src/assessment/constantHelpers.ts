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
 * Get core question types (same as getAllQuestionTypes since GROUP is removed)
 * @deprecated Use getAllQuestionTypes instead
 */
export function getCoreQuestionTypes(): ConstantItem<QuestionType>[] {
  return getAllQuestionTypes();
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
