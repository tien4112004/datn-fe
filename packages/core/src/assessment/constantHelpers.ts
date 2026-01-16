/**
 * Assessment Constant Helper Utilities
 *
 * Provides helper functions to work with assessment constants (question types,
 * difficulties, bank types) in a type-safe and consistent way. These utilities
 * support both hardcoded Vietnamese labels and i18n localization keys.
 *
 * @module assessment/constantHelpers
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
 * Represents a constant value with its display label and optional i18n key
 */
export interface ConstantItem<T = string> {
  /** The constant value (e.g., 'MULTIPLE_CHOICE') */
  value: T;
  /** The hardcoded Vietnamese label (e.g., 'Trắc Nghiệm') */
  label: string;
  /** The i18n key for localization (e.g., 'types.multipleChoice') */
  i18nKey?: string;
}

// ============================================================================
// Question Type Helpers
// ============================================================================

/**
 * Get all question types as an array of constant items
 *
 * @param options - Configuration options
 * @param options.includeGroup - Whether to include the GROUP type (default: true)
 * @returns Array of question type items with value, label, and i18nKey
 *
 * @example
 * ```typescript
 * // Get all question types including GROUP
 * const allTypes = getAllQuestionTypes();
 * // [
 * //   { value: 'MULTIPLE_CHOICE', label: 'Trắc Nghiệm', i18nKey: 'types.multipleChoice' },
 * //   { value: 'MATCHING', label: 'Nối', i18nKey: 'types.matching' },
 * //   ...
 * // ]
 *
 * // Get question types without GROUP
 * const typesWithoutGroup = getAllQuestionTypes({ includeGroup: false });
 * ```
 */
export function getAllQuestionTypes(options?: { includeGroup?: boolean }): ConstantItem<QuestionType>[] {
  const { includeGroup = true } = options || {};

  const types = Object.values(QUESTION_TYPE).map((type) => ({
    value: type,
    label: QUESTION_TYPE_LABELS[type],
    i18nKey: QUESTION_TYPE_I18N_KEYS[type],
  }));

  if (!includeGroup) {
    return types.filter((type) => type.value !== QUESTION_TYPE.GROUP);
  }

  return types;
}

/**
 * Get the i18n key for a specific question type
 *
 * @param type - The question type code
 * @returns The i18n key for the question type
 *
 * @example
 * ```typescript
 * getQuestionTypeI18nKey('MULTIPLE_CHOICE'); // Returns 'types.multipleChoice'
 * getQuestionTypeI18nKey('MATCHING'); // Returns 'types.matching'
 * ```
 */
export function getQuestionTypeI18nKey(type: QuestionType): string {
  return QUESTION_TYPE_I18N_KEYS[type];
}

/**
 * Get a mapping of all question types to their i18n keys
 *
 * @returns Record mapping question type codes to i18n keys
 *
 * @example
 * ```typescript
 * const i18nMap = getQuestionTypeI18nMap();
 * // {
 * //   MULTIPLE_CHOICE: 'types.multipleChoice',
 * //   MATCHING: 'types.matching',
 * //   ...
 * // }
 * ```
 */
export function getQuestionTypeI18nMap(): Record<QuestionType, string> {
  return { ...QUESTION_TYPE_I18N_KEYS };
}

// ============================================================================
// Difficulty Helpers
// ============================================================================

/**
 * Get all difficulties as an array of constant items
 *
 * @returns Array of difficulty items with value, label, and i18nKey
 *
 * @example
 * ```typescript
 * const difficulties = getAllDifficulties();
 * // [
 * //   { value: 'KNOWLEDGE', label: 'Nhận biết', i18nKey: 'difficulty.knowledge' },
 * //   { value: 'COMPREHENSION', label: 'Thông hiểu', i18nKey: 'difficulty.comprehension' },
 * //   ...
 * // ]
 * ```
 */
export function getAllDifficulties(): ConstantItem<Difficulty>[] {
  return Object.values(DIFFICULTY).map((difficulty) => ({
    value: difficulty,
    label: DIFFICULTY_LABELS[difficulty],
    i18nKey: DIFFICULTY_I18N_KEYS[difficulty],
  }));
}

/**
 * Get the i18n key for a specific difficulty level
 *
 * @param difficulty - The difficulty code
 * @returns The i18n key for the difficulty level
 *
 * @example
 * ```typescript
 * getDifficultyI18nKey('KNOWLEDGE'); // Returns 'difficulty.knowledge'
 * getDifficultyI18nKey('APPLICATION'); // Returns 'difficulty.application'
 * ```
 */
export function getDifficultyI18nKey(difficulty: Difficulty): string {
  return DIFFICULTY_I18N_KEYS[difficulty];
}

/**
 * Get a mapping of all difficulties to their i18n keys
 *
 * @returns Record mapping difficulty codes to i18n keys
 *
 * @example
 * ```typescript
 * const i18nMap = getDifficultyI18nMap();
 * // {
 * //   KNOWLEDGE: 'difficulty.knowledge',
 * //   COMPREHENSION: 'difficulty.comprehension',
 * //   ...
 * // }
 * ```
 */
export function getDifficultyI18nMap(): Record<Difficulty, string> {
  return { ...DIFFICULTY_I18N_KEYS };
}

// ============================================================================
// Bank Type Helpers
// ============================================================================

/**
 * Get all bank types as an array of constant items
 *
 * @returns Array of bank type items with value, label, and i18nKey
 *
 * @example
 * ```typescript
 * const bankTypes = getAllBankTypes();
 * // [
 * //   { value: 'personal', label: 'Cá nhân', i18nKey: 'bankType.personal' },
 * //   { value: 'public', label: 'Công khai', i18nKey: 'bankType.public' }
 * // ]
 * ```
 */
export function getAllBankTypes(): ConstantItem<BankType>[] {
  return Object.values(BANK_TYPE).map((bankType) => ({
    value: bankType,
    label: BANK_TYPE_LABELS[bankType],
    i18nKey: BANK_TYPE_I18N_KEYS[bankType],
  }));
}

/**
 * Get the i18n key for a specific bank type
 *
 * @param bankType - The bank type code
 * @returns The i18n key for the bank type
 *
 * @example
 * ```typescript
 * getBankTypeI18nKey('personal'); // Returns 'bankType.personal'
 * getBankTypeI18nKey('public'); // Returns 'bankType.public'
 * ```
 */
export function getBankTypeI18nKey(bankType: BankType): string {
  return BANK_TYPE_I18N_KEYS[bankType];
}

/**
 * Get the Vietnamese name for a bank type
 *
 * @param bankType - The bank type code
 * @returns The Vietnamese display name
 *
 * @example
 * ```typescript
 * getBankTypeName('personal'); // Returns 'Cá nhân'
 * getBankTypeName('public'); // Returns 'Công khai'
 * ```
 */
export function getBankTypeName(bankType: BankType): string {
  return BANK_TYPE_LABELS[bankType];
}

// ============================================================================
// Generic Utilities
// ============================================================================

/**
 * Convert constant items to select/dropdown items
 * Useful for UI components that need value-label pairs
 *
 * @param items - Array of constant items
 * @param useI18n - Whether to use i18nKey as label (default: false, uses label)
 * @returns Array of objects with value and label properties
 *
 * @example
 * ```typescript
 * const questionTypes = getAllQuestionTypes();
 *
 * // Use Vietnamese labels
 * const selectItems = toSelectItems(questionTypes);
 * // [{ value: 'MULTIPLE_CHOICE', label: 'Trắc Nghiệm' }, ...]
 *
 * // Use i18n keys
 * const i18nItems = toSelectItems(questionTypes, true);
 * // [{ value: 'MULTIPLE_CHOICE', label: 'types.multipleChoice' }, ...]
 * ```
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
