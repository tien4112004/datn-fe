import { useState, useCallback } from 'react';
import type {
  SubQuestion,
  MultipleChoiceData,
  MatchingData,
  OpenEndedData,
  FillInBlankData,
} from '@aiprimary/core';
import { generateId } from '@/shared/lib/utils';

/**
 * Hook for managing group question state
 * Handles add, remove, reorder, and update operations for sub-questions
 */
export function useGroupQuestion(initialQuestions: SubQuestion[] = []) {
  const [questions, setQuestions] = useState<SubQuestion[]>(initialQuestions);

  /**
   * Add a new sub-question
   */
  const addQuestion = useCallback(
    (
      type: SubQuestion['type'],
      title: string = '',
      data: MultipleChoiceData | MatchingData | OpenEndedData | FillInBlankData
    ): SubQuestion => {
      const newQuestion: SubQuestion = {
        id: generateId(),
        type,
        title,
        data,
        points: 1,
      };

      setQuestions((prev) => [...prev, newQuestion]);
      return newQuestion;
    },
    []
  );

  /**
   * Remove a sub-question by ID
   */
  const removeQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  /**
   * Update a sub-question
   */
  const updateQuestion = useCallback((id: string, updates: Partial<SubQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  }, []);

  /**
   * Reorder questions (drag and drop)
   */
  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      const [removed] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, removed);
      return newQuestions;
    });
  }, []);

  /**
   * Calculate total points
   */
  const calculateTotalPoints = useCallback(() => {
    return questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }, [questions]);

  /**
   * Reset all questions
   */
  const reset = useCallback((newQuestions: SubQuestion[] = []) => {
    setQuestions(newQuestions);
  }, []);

  return {
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    reorderQuestions,
    calculateTotalPoints,
    reset,
  };
}
