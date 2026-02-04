import type { AssignmentQuestionWithTopic, AssignmentContext } from '../types/assignment';
import type { Context } from '../types/context';

/**
 * Base context shape used in grouping (common fields between Context and AssignmentContext)
 */
export type GroupingContext = Pick<Context, 'id' | 'title' | 'content'> | AssignmentContext;

/**
 * Represents a group of questions - either under a context or standalone
 */
export interface QuestionGroup {
  /** Unique identifier for the group */
  id: string;
  /** Type of group: 'context' for questions with reading passage, 'standalone' for individual questions */
  type: 'context' | 'standalone';
  /** Context ID if this is a context group */
  contextId?: string;
  /** Context data if this is a context group (can be Context or AssignmentContext) */
  context?: GroupingContext;
  /** Questions in this group */
  questions: AssignmentQuestionWithTopic[];
}

/**
 * Extracts all unique contextIds from a list of questions
 */
export function getUniqueContextIds(questions: AssignmentQuestionWithTopic[]): string[] {
  const contextIds = new Set<string>();
  for (const q of questions) {
    if (!q?.question) continue;
    const contextId = (q.question as any).contextId;
    if (contextId) {
      contextIds.add(contextId);
    }
  }
  return Array.from(contextIds);
}

/**
 * Groups questions by their contextId.
 * Questions with the same contextId are grouped together.
 * Questions without a contextId become standalone groups.
 *
 * The order is determined by the first occurrence of each context/question in the original array.
 * Accepts both Context (from API) and AssignmentContext (cloned in assignment) types.
 */
export function groupQuestionsByContext(
  questions: AssignmentQuestionWithTopic[],
  contexts: Map<string, GroupingContext>
): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const contextGroups = new Map<string, QuestionGroup>();

  for (const q of questions) {
    // Skip invalid entries
    if (!q?.question) continue;

    const contextId = (q.question as any).contextId as string | undefined;

    if (contextId) {
      // Question has a context - add to or create context group
      let group = contextGroups.get(contextId);
      if (!group) {
        group = {
          id: `context-${contextId}`,
          type: 'context',
          contextId,
          context: contexts.get(contextId),
          questions: [],
        };
        contextGroups.set(contextId, group);
        groups.push(group);
      }
      group.questions.push(q);
    } else {
      // Standalone question - create individual group
      groups.push({
        id: `standalone-${q.question.id}`,
        type: 'standalone',
        questions: [q],
      });
    }
  }

  return groups;
}

/**
 * Flattens question groups back into a flat array of questions.
 * Preserves the order of groups and questions within groups.
 */
export function flattenQuestionGroups(groups: QuestionGroup[]): AssignmentQuestionWithTopic[] {
  const questions: AssignmentQuestionWithTopic[] = [];
  for (const group of groups) {
    questions.push(...group.questions);
  }
  return questions;
}

/**
 * Finds the group that contains a specific question
 */
export function findGroupByQuestionId(
  groups: QuestionGroup[],
  questionId: string
): QuestionGroup | undefined {
  return groups.find((group) => group.questions.some((q) => q?.question?.id === questionId));
}

/**
 * Finds a group by its context ID
 */
export function findGroupByContextId(groups: QuestionGroup[], contextId: string): QuestionGroup | undefined {
  return groups.find((group) => group.type === 'context' && group.contextId === contextId);
}

/**
 * Gets the display number for a question within all questions
 * (accounting for grouping - questions in context groups are numbered sequentially)
 */
export function getQuestionDisplayNumber(groups: QuestionGroup[], questionId: string): number {
  let number = 0;
  for (const group of groups) {
    for (const q of group.questions) {
      number++;
      if (q?.question?.id === questionId) {
        return number;
      }
    }
  }
  return -1;
}

/**
 * Gets the index of a question within its context group
 */
export function getQuestionIndexInGroup(group: QuestionGroup, questionId: string): number {
  return group.questions.findIndex((q) => q?.question?.id === questionId);
}
