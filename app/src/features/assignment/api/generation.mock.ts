import type {
  GenerateQuestionsFromContextRequest,
  GenerateQuestionsFromContextResponse,
  GenerateQuestionsByTopicRequest,
  GenerateQuestionsByTopicResponse,
} from '../types/generation';
import type { QuestionBankItem } from '@/features/question-bank/types';

const MOCK_DELAY_MS = 1500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeMockQuestion(
  topicName: string,
  difficulty: string,
  questionType: string,
  index: number
): QuestionBankItem {
  const id = `mock-${topicName}-${difficulty}-${questionType}-${index}-${Date.now()}`;

  if (questionType === 'MULTIPLE_CHOICE') {
    return {
      id,
      type: 'MULTIPLE_CHOICE',
      difficulty: difficulty as QuestionBankItem['difficulty'],
      title: `[Mock] ${topicName} — ${difficulty} question #${index + 1}`,
      explanation: 'This is a mock explanation for testing purposes.',
      subject: 'T',
      grade: '5',
      data: {
        options: [
          { id: 'a', text: 'Option A (correct)', isCorrect: true },
          { id: 'b', text: 'Option B', isCorrect: false },
          { id: 'c', text: 'Option C', isCorrect: false },
          { id: 'd', text: 'Option D', isCorrect: false },
        ],
      },
    };
  }

  if (questionType === 'MATCHING') {
    return {
      id,
      type: 'MATCHING',
      difficulty: difficulty as QuestionBankItem['difficulty'],
      title: `[Mock] Match the following for ${topicName} #${index + 1}`,
      subject: 'T',
      grade: '5',
      data: {
        pairs: [
          { id: 'p1', left: 'Left 1', right: 'Right 1' },
          { id: 'p2', left: 'Left 2', right: 'Right 2' },
        ],
      },
    };
  }

  if (questionType === 'FILL_IN_BLANK') {
    return {
      id,
      type: 'FILL_IN_BLANK',
      difficulty: difficulty as QuestionBankItem['difficulty'],
      title: `[Mock] Fill in the blank for ${topicName} #${index + 1}`,
      subject: 'T',
      grade: '5',
      data: {
        segments: [
          { id: 's1', type: 'TEXT', content: 'The answer is ' },
          { id: 's2', type: 'BLANK', content: 'mock answer' },
          { id: 's3', type: 'TEXT', content: '.' },
        ],
      },
    };
  }

  return {
    id,
    type: 'OPEN_ENDED',
    difficulty: difficulty as QuestionBankItem['difficulty'],
    title: `[Mock] Open-ended question about ${topicName} #${index + 1}`,
    explanation: 'Mock expected answer.',
    subject: 'T',
    grade: '5',
    data: { expectedAnswer: 'This is the mock expected answer.' },
  };
}

export default class GenerationMockService {
  async generateQuestionsFromContext(
    _request: GenerateQuestionsFromContextRequest
  ): Promise<GenerateQuestionsFromContextResponse> {
    await delay(MOCK_DELAY_MS);
    return { totalGenerated: 0, questions: [] };
  }

  async generateQuestionsByTopic(
    request: GenerateQuestionsByTopicRequest
  ): Promise<GenerateQuestionsByTopicResponse> {
    await delay(MOCK_DELAY_MS);

    // Mock: randomly fail ~1 in 3 topics
    if (Math.random() < 0.33) {
      throw new Error(`[Mock] Failed to generate questions for topic "${request.topicName}": API timeout`);
    }

    const questions: QuestionBankItem[] = [];
    let questionIndex = 0;

    for (const [difficulty, typeMap] of Object.entries(request.questionsPerDifficulty)) {
      for (const [questionType, countPoints] of Object.entries(typeMap)) {
        const count = parseInt(countPoints.split(':')[0], 10);
        for (let i = 0; i < count; i++) {
          questions.push(makeMockQuestion(request.topicName, difficulty, questionType, questionIndex++));
        }
      }
    }

    return {
      totalGenerated: questions.length,
      questions,
      context: request.hasContext
        ? { id: 'mock-context-id', title: `Mock context for ${request.topicName}` }
        : undefined,
    };
  }
}
