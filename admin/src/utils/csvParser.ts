import type { QuestionBankItem } from '@/types/question-bank';
import { QUESTION_TYPE, BANK_TYPE } from '@/types/question-bank';
import type { QuestionType, Difficulty, SubjectCode } from '@/types/question-bank';

/**
 * Parse CSV content to QuestionBankItem array
 */
export function parseQuestionBankCSV(csvContent: string): QuestionBankItem[] {
  const lines = csvContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#')); // Filter empty lines and comments

  if (lines.length < 2) {
    throw new Error('CSV file must contain a header row and at least one data row');
  }

  const questions: QuestionBankItem[] = [];
  const header = parseCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row = Object.fromEntries(header.map((key, idx) => [key, values[idx]]));
      const question = parseQuestionRow(row, i + 1);
      questions.push(question);
    } catch (error) {
      console.error(`Error parsing row ${i + 1}:`, error);
      throw new Error(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  return questions;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Parse a single question row
 */
function parseQuestionRow(row: Record<string, string>, rowNumber: number): QuestionBankItem {
  const type = row.type as QuestionType;
  const difficulty = row.difficulty as Difficulty;
  const subjectCode = row.subjectCode as SubjectCode;

  // Validate required fields
  if (!row.title) throw new Error('Missing required field: title');
  if (!type) throw new Error('Missing required field: type');
  if (!difficulty) throw new Error('Missing required field: difficulty');
  if (!subjectCode) throw new Error('Missing required field: subjectCode');

  const baseQuestion = {
    id: `csv-import-${Date.now()}-${rowNumber}`,
    title: row.title,
    difficulty,
    subjectCode,
    bankType: BANK_TYPE.PUBLIC,
    points: row.points ? parseInt(row.points) : 10,
    explanation: row.explanation || undefined,
  };

  switch (type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return parseMultipleChoiceQuestion(baseQuestion, row);
    case QUESTION_TYPE.MATCHING:
      return parseMatchingQuestion(baseQuestion, row);
    case QUESTION_TYPE.OPEN_ENDED:
      return parseOpenEndedQuestion(baseQuestion, row);
    case QUESTION_TYPE.FILL_IN_BLANK:
      return parseFillInBlankQuestion(baseQuestion, row);
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
}

/**
 * Parse Multiple Choice question
 */
function parseMultipleChoiceQuestion(base: any, row: Record<string, string>): QuestionBankItem {
  const options = [];
  const correctOption = parseInt(row.correctOption);

  if (!correctOption || correctOption < 1 || correctOption > 4) {
    throw new Error('correctOption must be 1, 2, 3, or 4');
  }

  for (let i = 1; i <= 4; i++) {
    const text = row[`option${i}`];
    if (!text) throw new Error(`Missing option${i}`);
    options.push({
      id: `opt-${i}`,
      text,
      isCorrect: i === correctOption,
    });
  }

  return {
    ...base,
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    options,
  } as QuestionBankItem;
}

/**
 * Parse Matching question
 */
function parseMatchingQuestion(base: any, row: Record<string, string>): QuestionBankItem {
  const pairs = [];
  let pairIndex = 1;

  while (row[`pair${pairIndex}_left`] && row[`pair${pairIndex}_right`]) {
    pairs.push({
      id: `pair-${pairIndex}`,
      left: row[`pair${pairIndex}_left`],
      right: row[`pair${pairIndex}_right`],
    });
    pairIndex++;
  }

  if (pairs.length === 0) {
    throw new Error('At least one matching pair is required (pair1_left, pair1_right)');
  }

  return {
    ...base,
    type: QUESTION_TYPE.MATCHING,
    pairs,
  } as QuestionBankItem;
}

/**
 * Parse Open-ended question
 */
function parseOpenEndedQuestion(base: any, row: Record<string, string>): QuestionBankItem {
  return {
    ...base,
    type: QUESTION_TYPE.OPEN_ENDED,
    expectedAnswer: row.expectedAnswer || undefined,
    maxLength: row.maxLength ? parseInt(row.maxLength) : 500,
  } as QuestionBankItem;
}

/**
 * Parse Fill in Blank question
 */
function parseFillInBlankQuestion(base: any, row: Record<string, string>): QuestionBankItem {
  const text = row.text;
  const blanks = row.blanks ? row.blanks.split('|').map((b) => b.trim()) : [];

  if (!text) throw new Error('Missing required field: text');
  if (!text.includes('{blank}')) {
    throw new Error('text must contain at least one {blank} placeholder');
  }

  // Count blanks in text
  const blankCount = (text.match(/\{blank\}/g) || []).length;
  if (blanks.length !== blankCount) {
    throw new Error(`Expected ${blankCount} blank answers, got ${blanks.length}`);
  }

  // Parse text into segments
  const segments = [];
  const parts = text.split('{blank}');
  let segmentId = 1;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      segments.push({
        id: `seg-${segmentId++}`,
        type: 'text' as const,
        content: parts[i],
      });
    }
    if (i < parts.length - 1) {
      segments.push({
        id: `seg-${segmentId++}`,
        type: 'blank' as const,
        content: blanks[i],
        acceptableAnswers: [blanks[i]],
      });
    }
  }

  return {
    ...base,
    type: QUESTION_TYPE.FILL_IN_BLANK,
    segments,
    caseSensitive: row.caseSensitive === 'true',
  } as QuestionBankItem;
}

/**
 * Export questions to CSV format
 */
export function exportQuestionsToCSV(questions: QuestionBankItem[]): string {
  if (questions.length === 0) {
    return '';
  }

  // Group by type for better organization
  const byType = {
    [QUESTION_TYPE.MULTIPLE_CHOICE]: questions.filter((q) => q.type === QUESTION_TYPE.MULTIPLE_CHOICE),
    [QUESTION_TYPE.MATCHING]: questions.filter((q) => q.type === QUESTION_TYPE.MATCHING),
    [QUESTION_TYPE.OPEN_ENDED]: questions.filter((q) => q.type === QUESTION_TYPE.OPEN_ENDED),
    [QUESTION_TYPE.FILL_IN_BLANK]: questions.filter((q) => q.type === QUESTION_TYPE.FILL_IN_BLANK),
  };

  const csvSections: string[] = [];

  // Multiple Choice
  if (byType[QUESTION_TYPE.MULTIPLE_CHOICE].length > 0) {
    csvSections.push('# Multiple Choice Questions');
    csvSections.push(
      'title,type,difficulty,subjectCode,points,option1,option2,option3,option4,correctOption,explanation'
    );
    byType[QUESTION_TYPE.MULTIPLE_CHOICE].forEach((q) => {
      if (q.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
        const correctIndex = q.options.findIndex((o) => o.isCorrect) + 1;
        csvSections.push(
          [
            `"${q.title.replace(/"/g, '""')}"`,
            q.type,
            q.difficulty,
            q.subjectCode,
            q.points || 10,
            ...q.options.map((o) => `"${o.text.replace(/"/g, '""')}"`),
            correctIndex,
            `"${(q.explanation || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      }
    });
    csvSections.push('');
  }

  // Matching
  if (byType[QUESTION_TYPE.MATCHING].length > 0) {
    csvSections.push('# Matching Questions');
    csvSections.push(
      'title,type,difficulty,subjectCode,points,pair1_left,pair1_right,pair2_left,pair2_right,pair3_left,pair3_right,explanation'
    );
    byType[QUESTION_TYPE.MATCHING].forEach((q) => {
      if (q.type === QUESTION_TYPE.MATCHING) {
        const pairValues = q.pairs.flatMap((p) => [
          `"${p.left.replace(/"/g, '""')}"`,
          `"${p.right.replace(/"/g, '""')}"`,
        ]);
        csvSections.push(
          [
            `"${q.title.replace(/"/g, '""')}"`,
            q.type,
            q.difficulty,
            q.subjectCode,
            q.points || 10,
            ...pairValues,
            `"${(q.explanation || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      }
    });
    csvSections.push('');
  }

  // Open-ended
  if (byType[QUESTION_TYPE.OPEN_ENDED].length > 0) {
    csvSections.push('# Open-ended Questions');
    csvSections.push('title,type,difficulty,subjectCode,points,expectedAnswer,maxLength,explanation');
    byType[QUESTION_TYPE.OPEN_ENDED].forEach((q) => {
      if (q.type === QUESTION_TYPE.OPEN_ENDED) {
        csvSections.push(
          [
            `"${q.title.replace(/"/g, '""')}"`,
            q.type,
            q.difficulty,
            q.subjectCode,
            q.points || 10,
            `"${(q.expectedAnswer || '').replace(/"/g, '""')}"`,
            q.maxLength || 500,
            `"${(q.explanation || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      }
    });
    csvSections.push('');
  }

  // Fill in Blank
  if (byType[QUESTION_TYPE.FILL_IN_BLANK].length > 0) {
    csvSections.push('# Fill in Blank Questions');
    csvSections.push('title,type,difficulty,subjectCode,points,text,blanks,caseSensitive,explanation');
    byType[QUESTION_TYPE.FILL_IN_BLANK].forEach((q) => {
      if (q.type === QUESTION_TYPE.FILL_IN_BLANK) {
        const text = q.segments.map((s) => (s.type === 'blank' ? '{blank}' : s.content)).join('');
        const blanks = q.segments
          .filter((s) => s.type === 'blank')
          .map((s) => s.content)
          .join('|');
        csvSections.push(
          [
            `"${q.title.replace(/"/g, '""')}"`,
            q.type,
            q.difficulty,
            q.subjectCode,
            q.points || 10,
            `"${text.replace(/"/g, '""')}"`,
            `"${blanks}"`,
            q.caseSensitive || false,
            `"${(q.explanation || '').replace(/"/g, '""')}"`,
          ].join(',')
        );
      }
    });
  }

  return csvSections.join('\n');
}
