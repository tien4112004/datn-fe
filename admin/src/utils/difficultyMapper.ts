import { DIFFICULTY, type Difficulty } from '@aiprimary/core';

/**
 * Maps frontend difficulty codes (Vietnamese) to backend enum values (English)
 * Frontend: nhan_biet, thong_hieu, van_dung, van_dung_cao
 * Backend: KNOWLEDGE, COMPREHENSION, APPLICATION, ADVANCED_APPLICATION
 */
const FRONTEND_TO_BACKEND: Record<Difficulty, string> = {
  [DIFFICULTY.EASY]: 'KNOWLEDGE',
  [DIFFICULTY.MEDIUM]: 'COMPREHENSION',
  [DIFFICULTY.HARD]: 'APPLICATION',
  [DIFFICULTY.SUPER_HARD]: 'ADVANCED_APPLICATION',
};

/**
 * Maps backend enum values (English) to frontend difficulty codes (Vietnamese)
 * Backend: KNOWLEDGE, COMPREHENSION, APPLICATION, ADVANCED_APPLICATION
 * Frontend: nhan_biet, thong_hieu, van_dung, van_dung_cao
 */
const BACKEND_TO_FRONTEND: Record<string, Difficulty> = {
  KNOWLEDGE: DIFFICULTY.EASY,
  COMPREHENSION: DIFFICULTY.MEDIUM,
  APPLICATION: DIFFICULTY.HARD,
  ADVANCED_APPLICATION: DIFFICULTY.SUPER_HARD,
};

/**
 * Converts frontend difficulty code to backend enum value
 * @param frontendDifficulty - Vietnamese difficulty code (e.g., 'nhan_biet')
 * @returns Backend enum value (e.g., 'KNOWLEDGE')
 * @example
 * toBackendDifficulty('nhan_biet') // returns 'KNOWLEDGE'
 * toBackendDifficulty('van_dung_cao') // returns 'ADVANCED_APPLICATION'
 */
export function toBackendDifficulty(frontendDifficulty: Difficulty): string {
  return FRONTEND_TO_BACKEND[frontendDifficulty];
}

/**
 * Converts backend enum value to frontend difficulty code
 * @param backendDifficulty - Backend enum value (e.g., 'KNOWLEDGE')
 * @returns Vietnamese difficulty code (e.g., 'nhan_biet'), defaults to EASY if not found
 * @example
 * toFrontendDifficulty('KNOWLEDGE') // returns 'nhan_biet'
 * toFrontendDifficulty('ADVANCED_APPLICATION') // returns 'van_dung_cao'
 */
export function toFrontendDifficulty(backendDifficulty: string): Difficulty {
  return BACKEND_TO_FRONTEND[backendDifficulty] || DIFFICULTY.EASY;
}
