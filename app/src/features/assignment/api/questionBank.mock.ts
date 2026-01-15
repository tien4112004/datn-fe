import type { QuestionBankApiService } from '../types/questionBank';
import type { QuestionBankItem, QuestionBankFilters, QuestionBankResponse } from '../types/questionBank';
import { generateId } from '@/shared/lib/utils';
import { QUESTION_TYPE, DIFFICULTY } from '../types';
import type { MultipleChoiceOption, MatchingPair, BlankSegment } from '../types';

// Create mock question with proper type-specific fields
const createMockQuestion = (id: string, index: number): QuestionBankItem => {
  const baseQuestion = {
    id,
    difficulty: [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD][index % 3],
    title: `Sample Question ${index + 1}`,
    points: 10,
    subjectCode: ['T', 'TV', 'TA'][index % 3] as 'T' | 'TV' | 'TA',
    bankType: (index < 10 ? 'personal' : 'public') as 'personal' | 'public', // First 10 personal, rest public
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
  };

  const typeIndex = index % 4; // Support all 4 types

  if (typeIndex === 0) {
    // Multiple Choice
    const options: MultipleChoiceOption[] = [
      { id: generateId(), text: `Option A`, isCorrect: true },
      { id: generateId(), text: `Option B`, isCorrect: false },
      { id: generateId(), text: `Option C`, isCorrect: false },
    ];
    return {
      ...baseQuestion,
      type: QUESTION_TYPE.MULTIPLE_CHOICE,
      data: { options },
    } as QuestionBankItem;
  } else if (typeIndex === 1) {
    // Matching
    const pairs: MatchingPair[] = [
      { id: generateId(), left: 'Term 1', right: 'Definition 1' },
      { id: generateId(), left: 'Term 2', right: 'Definition 2' },
    ];
    return {
      ...baseQuestion,
      type: QUESTION_TYPE.MATCHING,
      data: { pairs },
    } as QuestionBankItem;
  } else if (typeIndex === 2) {
    // Open Ended
    return {
      ...baseQuestion,
      type: QUESTION_TYPE.OPEN_ENDED,
      data: {
        maxLength: 500,
        expectedAnswer: 'Sample expected answer',
      },
    } as QuestionBankItem;
  } else {
    // Fill In Blank
    const segments: BlankSegment[] = [
      { id: generateId(), type: 'text', content: 'The capital of France is ' },
      { id: generateId(), type: 'blank', content: 'Paris', acceptableAnswers: [] },
      { id: generateId(), type: 'text', content: '.' },
    ];
    return {
      ...baseQuestion,
      type: QUESTION_TYPE.FILL_IN_BLANK,
      data: {
        segments,
        caseSensitive: false,
      },
    } as QuestionBankItem;
  }
};

export default class QuestionBankMockApiService implements QuestionBankApiService {
  baseUrl: string;
  private questions: QuestionBankItem[];

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    // Initialize with predefined questions with specific IDs for testing
    const predefinedQuestions: QuestionBankItem[] = [
      // Predefined question with specific ID for testing
      {
        id: 'zzuhg9bpd',
        type: QUESTION_TYPE.MULTIPLE_CHOICE,
        difficulty: DIFFICULTY.MEDIUM,
        title: 'What is the capital of France?',
        points: 10,
        subjectCode: 'TA',
        bankType: 'personal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          options: [
            { id: generateId(), text: 'Paris', isCorrect: true },
            { id: generateId(), text: 'London', isCorrect: false },
            { id: generateId(), text: 'Berlin', isCorrect: false },
            { id: generateId(), text: 'Madrid', isCorrect: false },
          ],
        },
      } as QuestionBankItem,
    ];

    // Initialize with predefined questions and 19 random ones
    this.questions = [
      ...predefinedQuestions,
      ...Array.from({ length: 19 }, (_, i) => createMockQuestion(generateId(), i)),
    ];
  }

  async getQuestions(filters?: QuestionBankFilters): Promise<QuestionBankResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...this.questions];

    // Apply filters
    if (filters?.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter((q) => q.title.toLowerCase().includes(search));
    }

    if (filters?.questionType) {
      filtered = filtered.filter((q) => q.type === filters.questionType);
    }

    if (filters?.difficulty) {
      filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters?.subjectCode) {
      filtered = filtered.filter((q) => q.subjectCode === filters.subjectCode);
    }

    if (filters?.bankType) {
      filtered = filtered.filter((q) => q.bankType === filters.bankType);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      questions: paginated,
      total: filtered.length,
      page,
      limit,
    };
  }

  async getQuestionById(id: string): Promise<QuestionBankItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const question = this.questions.find((q) => q.id === id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }
    return question;
  }

  async createQuestion(
    question: Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuestionBankItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newQuestion = {
      ...question,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as QuestionBankItem;

    this.questions.push(newQuestion);
    return newQuestion;
  }

  async updateQuestion(id: string, question: Partial<QuestionBankItem>): Promise<QuestionBankItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.questions.findIndex((q) => q.id === id);
    if (index === -1) {
      throw new Error(`Question with id ${id} not found`);
    }

    const updated = {
      ...this.questions[index],
      ...question,
      updatedAt: new Date().toISOString(),
    } as QuestionBankItem;

    this.questions[index] = updated;
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const index = this.questions.findIndex((q) => q.id === id);
    if (index === -1) {
      throw new Error(`Question with id ${id} not found`);
    }

    this.questions.splice(index, 1);
  }

  async bulkDeleteQuestions(ids: string[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.questions = this.questions.filter((q) => !ids.includes(q.id));
  }

  async duplicateQuestion(id: string): Promise<QuestionBankItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const question = this.questions.find((q) => q.id === id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }

    const newQuestion = {
      ...question,
      id: generateId(),
      title: `${question.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as QuestionBankItem;

    this.questions.push(newQuestion);
    return newQuestion;
  }

  async copyToPersonal(id: string): Promise<QuestionBankItem> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const question = this.questions.find((q) => q.id === id);
    if (!question) {
      throw new Error(`Question with id ${id} not found`);
    }

    // Create a copy with bankType set to personal
    const copiedQuestion = {
      ...question,
      id: generateId(),
      bankType: 'personal' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as QuestionBankItem;

    this.questions.push(copiedQuestion);
    return copiedQuestion;
  }

  async exportQuestions(filters?: QuestionBankFilters): Promise<Blob> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { questions } = await this.getQuestions(filters);
    const json = JSON.stringify(questions, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  async importQuestions(file: File): Promise<{ success: number; failed: number }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const text = await file.text();
    let imported: QuestionBankItem[] = [];

    // JSON parsing only (CSV support can be added later)
    try {
      imported = JSON.parse(text) as QuestionBankItem[];
    } catch (error) {
      console.error('JSON parse error:', error);
      return { success: 0, failed: 1 };
    }

    let success = 0;
    let failed = 0;

    for (const question of imported) {
      try {
        // Remove id, createdAt, updatedAt from imported question
        const { id, createdAt, updatedAt, ...questionData } = question;
        await this.createQuestion(questionData as Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt'>);
        success++;
      } catch (error) {
        console.error('Error creating question:', error);
        failed++;
      }
    }

    return { success, failed };
  }

  async getChapters(subject: string, grade: string): Promise<string[]> {
    // Return mock chapter data based on subject and grade
    return [
      `${subject} - Grade ${grade} - Chapter 1`,
      `${subject} - Grade ${grade} - Chapter 2`,
      `${subject} - Grade ${grade} - Chapter 3`,
    ];
  }
}
