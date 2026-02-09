import type { SubjectCode } from '@aiprimary/core';
import type { Grade } from '@aiprimary/core/assessment/grades.js';
import type { AssignmentQuestionWithTopic, QuestionItemRequest } from '../types';

/**
 * Backend question format (flat structure).
 * The service layer normalizes point→points, so we read `points`.
 */
interface BackendQuestion {
  id: string;
  type: string;
  difficulty: string;
  title: string;
  titleImageUrl?: string;
  explanation?: string;
  grade?: string;
  chapter?: string;
  subject?: string;
  data: unknown;
  points: number;
  contextId?: string;
}

/**
 * Transform backend questions (flat format from API) to frontend format (nested).
 * Called during form initialization in edit mode.
 */
export function transformQuestionsFromApi(
  questions: BackendQuestion[],
  defaultTopicId: string
): AssignmentQuestionWithTopic[] {
  return questions.map((q) => {
    const question = {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      title: q.title,
      titleImageUrl: q.titleImageUrl,
      explanation: q.explanation,
      data: q.data,
      contextId: q.contextId,
      topicId: defaultTopicId,
    } as AssignmentQuestionWithTopic['question'];

    return {
      question,
      points: q.points,
    };
  });
}

/**
 * Transform frontend questions (nested format) to backend API format (flat).
 * Called during form submission.
 */
export function transformQuestionsForApi(questions: AssignmentQuestionWithTopic[]): QuestionItemRequest[] {
  return questions.map(({ question, points }) => {
    const q = question as typeof question & {
      grade?: string;
      chapter?: string;
      subject?: string;
    };
    return {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      title: q.title,
      titleImageUrl: q.titleImageUrl,
      explanation: q.explanation,
      grade: q.grade as Grade | undefined,
      chapter: q.chapter,
      subject: q.subject as SubjectCode | undefined,
      data: q.data ? { type: q.type, ...q.data } : null,
      point: points,
      contextId: q.contextId,
    };
  });
}
