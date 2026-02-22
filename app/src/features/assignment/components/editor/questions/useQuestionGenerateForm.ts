import { useEffect, useState } from 'react';
import {
  useGenerateQuestions,
  useQuestionBankChapters,
} from '@/features/question-bank/hooks/useQuestionBankApi';
import type { GenerateQuestionsRequest } from '@/features/question-bank/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import {
  DIFFICULTY,
  getAllDifficulties,
  getAllQuestionTypes,
  getAllSubjects,
  getElementaryGrades,
} from '@aiprimary/core';

export interface ModelValue {
  name: string;
  provider: string;
}

interface UseQuestionGenerateFormOptions {
  initialGrade?: string;
  initialSubject?: string;
}

export function useQuestionGenerateForm({
  initialGrade,
  initialSubject,
}: UseQuestionGenerateFormOptions = {}) {
  const [prompt, setPrompt] = useState('');
  const [grade, setGrade] = useState(initialGrade || '');
  const [subject, setSubject] = useState(initialSubject || '');
  const [chapter, setChapter] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MULTIPLE_CHOICE']);
  const [questionsPerDifficulty, setQuestionsPerDifficulty] = useState<Record<string, number>>({
    [DIFFICULTY.KNOWLEDGE]: 2,
    [DIFFICULTY.COMPREHENSION]: 2,
    [DIFFICULTY.APPLICATION]: 1,
  });
  const [selectedModel, setSelectedModel] = useState<ModelValue | undefined>();
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const generateMutation = useGenerateQuestions();
  const {
    models,
    defaultModel,
    isLoading: isLoadingModels,
    isError: isErrorModels,
  } = useModels(MODEL_TYPES.TEXT);

  // Auto-select default model when models load
  useEffect(() => {
    if (defaultModel && !selectedModel) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel]);

  // Fetch chapters when both subject and grade are selected
  const { data: chapters } = useQuestionBankChapters(subject || undefined, grade || undefined);

  // Static data from core constants
  const grades = getElementaryGrades();
  const subjects = getAllSubjects();
  const questionTypes = getAllQuestionTypes();
  const difficulties = getAllDifficulties();

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleDifficultyChange = (difficulty: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setQuestionsPerDifficulty((prev) => ({
      ...prev,
      [difficulty]: Math.max(0, Math.min(50, numValue)),
    }));
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setChapter('');
  };

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setChapter('');
  };

  const getTotalQuestions = () =>
    Object.values(questionsPerDifficulty).reduce((sum, count) => sum + count, 0);

  const isFormValid = () =>
    grade.length > 0 && subject.length > 0 && selectedTypes.length > 0 && getTotalQuestions() > 0;

  const clearValidationError = (field: string) => {
    setValidationErrors((prev) => ({ ...prev, [field]: false }));
  };

  /** Build the API request from the current form state. */
  const buildRequest = (): GenerateQuestionsRequest => {
    const filteredDifficulties: Record<string, number> = {};
    for (const [key, value] of Object.entries(questionsPerDifficulty)) {
      if (value > 0) {
        filteredDifficulties[key] = value;
      }
    }

    return {
      ...(prompt.trim() && { prompt: prompt.trim() }),
      // TODO: Change this to use the correct topic/prompt field
      topic: chapter || '',
      grade,
      subject,
      questionTypes: selectedTypes,
      questionsPerDifficulty: filteredDifficulties,
      ...(chapter && { chapter }),
      ...(selectedModel && { provider: selectedModel.provider.toLowerCase(), model: selectedModel.name }),
    };
  };

  const resetForm = () => {
    setPrompt('');
    setGrade(initialGrade || '');
    setSubject(initialSubject || '');
    setChapter('');
    setSelectedTypes(['MULTIPLE_CHOICE']);
    setQuestionsPerDifficulty({
      [DIFFICULTY.KNOWLEDGE]: 2,
      [DIFFICULTY.COMPREHENSION]: 2,
      [DIFFICULTY.APPLICATION]: 1,
    });
    setSelectedModel(defaultModel ? { name: defaultModel.name, provider: defaultModel.provider } : undefined);
    setValidationErrors({});
  };

  return {
    // Form values
    prompt,
    setPrompt,
    grade,
    subject,
    chapter,
    setChapter,
    selectedTypes,
    questionsPerDifficulty,
    selectedModel,
    setSelectedModel,
    validationErrors,
    setValidationErrors,
    // Handlers
    handleTypeToggle,
    handleDifficultyChange,
    handleSubjectChange,
    handleGradeChange,
    clearValidationError,
    // Helpers
    getTotalQuestions,
    isFormValid,
    buildRequest,
    resetForm,
    // Static data
    grades,
    subjects,
    questionTypes,
    difficulties,
    // Async data
    chapters,
    models,
    defaultModel,
    isLoadingModels,
    isErrorModels,
    generateMutation,
  };
}
