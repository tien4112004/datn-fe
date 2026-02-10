// ── Base ID generation ──

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// ── Domain-specific ID builders ──

export function createTopicId(): string {
  return `topic-${generateId()}`;
}

// ── Matrix Cell ID ──

export function createCellId(topicId: string, difficulty: string, questionType: string): string {
  return `${topicId}-${difficulty}-${questionType}`;
}

export function parseCellId(
  cellId: string
): { topicId: string; difficulty: string; questionType: string } | null {
  const parts = cellId.split('-');
  if (parts.length < 3) return null;

  // The topicId might contain dashes, so we need to handle that
  // Format: topicId-DIFFICULTY-QUESTION_TYPE
  // DIFFICULTY and QUESTION_TYPE are UPPER_SNAKE_CASE
  const questionType = parts.pop()!;
  const difficulty = parts.pop()!;
  const topicId = parts.join('-');

  return { topicId, difficulty, questionType };
}
