/**
 * Shuffle Utilities
 *
 * Provides deterministic and random shuffling for:
 * - Question order in collections
 * - Multiple choice options
 * - Matching pairs
 */

import type { Question, MultipleChoiceQuestion, MatchingQuestion } from '@aiprimary/core';

/**
 * Fisher-Yates shuffle algorithm
 * Creates a shuffled copy of the array
 */
export function shuffleArray<T>(array: T[], seed?: string): T[] {
  const shuffled = [...array];

  if (seed) {
    // Deterministic shuffle using seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    const random = () => {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  } else {
    // Random shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  }

  return shuffled;
}

/**
 * Shuffle multiple choice options while preserving correct answer tracking
 */
export function shuffleMultipleChoiceOptions(
  question: MultipleChoiceQuestion,
  seed?: string
): MultipleChoiceQuestion {
  if (!question.data.shuffleOptions) {
    return question;
  }

  return {
    ...question,
    data: {
      ...question.data,
      options: shuffleArray(question.data.options, seed),
    },
  };
}

/**
 * Shuffle matching pairs (both left and right sides independently)
 */
export function shuffleMatchingPairs(question: MatchingQuestion, seed?: string): MatchingQuestion {
  if (!question.data.shufflePairs) {
    return question;
  }

  // Create shuffled pairs with shuffled rights
  const shuffledPairs = question.data.pairs.map((pair) => ({ ...pair }));
  const rights = shuffledPairs.map((p) => ({ right: p.right, rightImageUrl: p.rightImageUrl }));
  const shuffledRights = shuffleArray(rights, seed);

  shuffledPairs.forEach((pair, index) => {
    pair.right = shuffledRights[index].right;
    pair.rightImageUrl = shuffledRights[index].rightImageUrl;
  });

  return {
    ...question,
    data: {
      ...question.data,
      pairs: shuffleArray(shuffledPairs, seed ? seed + '_left' : undefined),
    },
  };
}

/**
 * Shuffle a single question based on its type and settings
 */
export function shuffleQuestion(question: Question, seed?: string): Question {
  switch (question.type) {
    case 'multiple_choice':
      return shuffleMultipleChoiceOptions(question, seed);
    case 'matching':
      return shuffleMatchingPairs(question, seed);
    case 'fill_in_blank':
    case 'open_ended':
      // No shuffling for fill-in-blank and open-ended questions
      return question;
    default:
      return question;
  }
}

/**
 * Shuffle an array of questions (between-questions shuffling)
 */
export function shuffleQuestions(questions: Question[], seed?: string): Question[] {
  return shuffleArray(questions, seed);
}

/**
 * Generate a deterministic seed from user ID and assignment ID
 * This ensures each student gets the same shuffle every time they view the assignment
 */
export function generateShuffleSeed(userId: string, assignmentId: string, questionId?: string): string {
  const base = `${userId}-${assignmentId}`;
  return questionId ? `${base}-${questionId}` : base;
}

/**
 * Apply shuffling to all questions in a collection
 * @param questions - Array of questions
 * @param shuffleQuestionOrder - Whether to shuffle the question order
 * @param seed - Optional seed for deterministic shuffling (e.g., userId-assignmentId)
 */
export function applyShuffleToCollection(
  questions: Question[],
  shuffleQuestionOrder: boolean,
  seed?: string
): Question[] {
  // First, shuffle individual question content
  let shuffledQuestions = questions.map((q, index) => {
    const questionSeed = seed ? `${seed}-q${index}` : undefined;
    return shuffleQuestion(q, questionSeed);
  });

  // Then shuffle question order if enabled
  if (shuffleQuestionOrder) {
    shuffledQuestions = shuffleQuestions(shuffledQuestions, seed);
  }

  return shuffledQuestions;
}
