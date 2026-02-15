/**
 * Smart defaults for matrix generation based on grade and subject
 */

export interface SmartDefaults {
  difficulties: string[];
  questionTypes: string[];
  suggestedPoints: number;
}

/**
 * Get recommended difficulty levels based on grade
 * - Grade 1-2: KNOWLEDGE only (basic recall)
 * - Grade 3-4: KNOWLEDGE + COMPREHENSION (understanding)
 * - Grade 5+: All three levels (advanced thinking)
 */
export function getRecommendedDifficulties(grade: string): string[] {
  const gradeNum = parseInt(grade);

  if (gradeNum <= 2) {
    return ['KNOWLEDGE'];
  } else if (gradeNum <= 4) {
    return ['KNOWLEDGE', 'COMPREHENSION'];
  } else {
    return ['KNOWLEDGE', 'COMPREHENSION', 'APPLICATION'];
  }
}

/**
 * Get recommended question types based on grade
 * - Grade 1-3: MULTIPLE_CHOICE + FILL_IN_BLANK (simpler formats)
 * - Grade 4+: All types (comprehensive assessment)
 */
export function getRecommendedQuestionTypes(grade: string): string[] {
  const gradeNum = parseInt(grade);

  if (gradeNum <= 3) {
    return ['MULTIPLE_CHOICE', 'FILL_IN_BLANK'];
  } else {
    return ['MULTIPLE_CHOICE', 'FILL_IN_BLANK', 'MATCHING', 'OPEN_ENDED'];
  }
}

/**
 * Calculate suggested total points based on number of questions
 * Default ratio: 0.5 points per question (can be overridden by user)
 *
 * @param totalQuestions Number of questions
 * @returns Suggested total points
 */
export function calculateSuggestedPoints(totalQuestions: number): number {
  // Round to nearest 5 for cleaner numbers
  return Math.round((totalQuestions * 5) / 5) * 5;
}

/**
 * Get comprehensive smart defaults for a grade/subject combination
 */
export function getSmartDefaults(grade: string, totalQuestions: number): SmartDefaults {
  return {
    difficulties: getRecommendedDifficulties(grade),
    questionTypes: getRecommendedQuestionTypes(grade),
    suggestedPoints: calculateSuggestedPoints(totalQuestions),
  };
}

/**
 * Get user-friendly explanations for difficulty levels
 */
export const DIFFICULTY_EXPLANATIONS: Record<string, string> = {
  KNOWLEDGE: 'Recall: Students need to remember and retrieve information they have learned',
  COMPREHENSION: 'Understand: Students need to explain and interpret information in their own words',
  APPLICATION: 'Apply: Students need to use learned concepts to solve new problems or situations',
};

/**
 * Get user-friendly explanations for question types
 */
export const QUESTION_TYPE_EXPLANATIONS: Record<string, string> = {
  MULTIPLE_CHOICE: 'Select one correct answer from multiple options',
  FILL_IN_BLANK: 'Fill in missing words or phrases in a sentence',
  MATCHING: 'Match items from one column to another',
  OPEN_ENDED: 'Write a short or long response in their own words',
};

/**
 * Get example prompts to help users understand the prompt field
 */
export const EXAMPLE_PROMPTS = [
  'Focus on chapters 1-3 and vocabulary only',
  'Emphasize practical applications and real-world scenarios',
  'Include questions about historical events and their impacts',
  'Test understanding of mathematical formulas and calculations',
  'Assess comprehension of key concepts from recent lessons',
  'Mix theoretical questions with practical problem-solving',
];
