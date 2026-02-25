import type { QuestionBankItem } from '@aiprimary/core';
import { QUESTION_TYPE } from '@aiprimary/core';

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
  let header = parseCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    // Detect header rows (from combined multi-section templates) and switch header
    if (values[0] === 'title') {
      header = values;
      continue;
    }

    try {
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
  const type = row.type;
  const difficulty = row.difficulty;
  // Support both 'subject' and 'subject' column names
  const subject = row.subject || row.subject;

  // Validate required fields
  if (!row.title) throw new Error('Missing required field: title');
  if (!type) throw new Error('Missing required field: type');
  if (!difficulty) throw new Error('Missing required field: difficulty');
  if (!subject) throw new Error('Missing required field: subject');

  const baseQuestion = {
    id: `csv-${rowNumber}`,
    title: row.title,
    difficulty,
    subject,
    explanation: row.explanation || undefined,
    grade: row.grade || undefined,
    chapter: row.chapter || undefined,
  };

  switch (type.toUpperCase()) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
    case 'MULTIPLE_CHOICE':
      return parseMultipleChoiceQuestion(baseQuestion, row);
    case QUESTION_TYPE.MATCHING:
    case 'MATCHING':
      return parseMatchingQuestion(baseQuestion, row);
    case QUESTION_TYPE.OPEN_ENDED:
    case 'OPEN_ENDED':
      return parseOpenEndedQuestion(baseQuestion, row);
    case QUESTION_TYPE.FILL_IN_BLANK:
    case 'FILL_IN_BLANK':
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

  // Dynamically find all optionN columns (support 2-6 options)
  let i = 1;
  while (row[`option${i}`] !== undefined && row[`option${i}`] !== '') {
    options.push({
      id: `opt-${i}`,
      text: row[`option${i}`],
      isCorrect: false,
    });
    i++;
  }

  if (options.length < 2) {
    throw new Error('At least 2 options are required');
  }

  const correctOption = parseInt(row.correctOption);
  if (!correctOption || correctOption < 1 || correctOption > options.length) {
    throw new Error(`correctOption must be between 1 and ${options.length}`);
  }

  options[correctOption - 1].isCorrect = true;

  return {
    ...base,
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    data: {
      options,
    },
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
    data: {
      pairs,
    },
  } as QuestionBankItem;
}

/**
 * Parse Open-ended question
 */
function parseOpenEndedQuestion(base: any, row: Record<string, string>): QuestionBankItem {
  return {
    ...base,
    type: QUESTION_TYPE.OPEN_ENDED,
    data: {
      expectedAnswer: row.expectedAnswer || undefined,
      maxLength: row.maxLength ? parseInt(row.maxLength) : 500,
    },
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
    data: {
      segments,
      caseSensitive: row.caseSensitive === 'true',
    },
  } as QuestionBankItem;
}

/**
 * Export questions to CSV format
 */
export function exportQuestionsToCSV(questions: QuestionBankItem[]): string {
  if (questions.length === 0) {
    return '';
  }

  const escapeCSV = (value: string | undefined | null): string => {
    const str = value || '';
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Filter questions with valid data for each type
  const byType = {
    [QUESTION_TYPE.MULTIPLE_CHOICE]: questions.filter(
      (q) => q.type === QUESTION_TYPE.MULTIPLE_CHOICE && q.data?.options?.length > 0
    ),
    [QUESTION_TYPE.MATCHING]: questions.filter(
      (q) => q.type === QUESTION_TYPE.MATCHING && q.data?.pairs?.length > 0
    ),
    [QUESTION_TYPE.OPEN_ENDED]: questions.filter(
      (q) => q.type === QUESTION_TYPE.OPEN_ENDED && q.data != null
    ),
    [QUESTION_TYPE.FILL_IN_BLANK]: questions.filter(
      (q) => q.type === QUESTION_TYPE.FILL_IN_BLANK && q.data?.segments?.length > 0
    ),
  };

  const csvSections: string[] = [];

  // Multiple Choice
  if (byType[QUESTION_TYPE.MULTIPLE_CHOICE].length > 0) {
    const mcQuestions = byType[QUESTION_TYPE.MULTIPLE_CHOICE];
    const maxOptions = Math.max(...mcQuestions.map((q: any) => q.data.options?.length || 0));
    const optionHeaders = Array.from({ length: maxOptions }, (_, i) => `option${i + 1}`).join(',');

    csvSections.push('# Multiple Choice Questions');
    csvSections.push(
      `title,type,difficulty,subject,grade,chapter,${optionHeaders},correctOption,explanation`
    );
    mcQuestions.forEach((q: any) => {
      const options = q.data.options || [];
      const correctIndex = options.findIndex((o: any) => o.isCorrect) + 1;
      const optionValues = Array.from({ length: maxOptions }, (_, i) => {
        const opt = options[i];
        return opt ? escapeCSV(opt.text) : '';
      });
      csvSections.push(
        [
          escapeCSV(q.title),
          q.type,
          q.difficulty,
          q.subject,
          escapeCSV(q.grade),
          escapeCSV(q.chapter),
          ...optionValues,
          correctIndex,
          escapeCSV(q.explanation),
        ].join(',')
      );
    });
    csvSections.push('');
  }

  // Matching
  if (byType[QUESTION_TYPE.MATCHING].length > 0) {
    const matchQuestions = byType[QUESTION_TYPE.MATCHING];
    const maxPairs = Math.max(...matchQuestions.map((q: any) => q.data.pairs?.length || 0));
    const pairHeaders = Array.from(
      { length: maxPairs },
      (_, i) => `pair${i + 1}_left,pair${i + 1}_right`
    ).join(',');

    csvSections.push('# Matching Questions');
    csvSections.push(`title,type,difficulty,subject,grade,chapter,${pairHeaders},explanation`);
    matchQuestions.forEach((q: any) => {
      const pairs = q.data.pairs || [];
      const pairValues = Array.from({ length: maxPairs }, (_, i) => {
        const pair = pairs[i];
        if (pair) {
          return [escapeCSV(pair.left), escapeCSV(pair.right)];
        }
        return ['', ''];
      }).flat();
      csvSections.push(
        [
          escapeCSV(q.title),
          q.type,
          q.difficulty,
          q.subject,
          escapeCSV(q.grade),
          escapeCSV(q.chapter),
          ...pairValues,
          escapeCSV(q.explanation),
        ].join(',')
      );
    });
    csvSections.push('');
  }

  // Open-ended
  if (byType[QUESTION_TYPE.OPEN_ENDED].length > 0) {
    csvSections.push('# Open-ended Questions');
    csvSections.push('title,type,difficulty,subject,grade,chapter,expectedAnswer,maxLength,explanation');
    byType[QUESTION_TYPE.OPEN_ENDED].forEach((q: any) => {
      csvSections.push(
        [
          escapeCSV(q.title),
          q.type,
          q.difficulty,
          q.subject,
          escapeCSV(q.grade),
          escapeCSV(q.chapter),
          escapeCSV(q.data?.expectedAnswer),
          q.data?.maxLength || 500,
          escapeCSV(q.explanation),
        ].join(',')
      );
    });
    csvSections.push('');
  }

  // Fill in Blank
  if (byType[QUESTION_TYPE.FILL_IN_BLANK].length > 0) {
    csvSections.push('# Fill in Blank Questions');
    csvSections.push('title,type,difficulty,subject,grade,chapter,text,blanks,caseSensitive,explanation');
    byType[QUESTION_TYPE.FILL_IN_BLANK].forEach((q: any) => {
      const segments = q.data.segments || [];
      const text = segments.map((s: any) => (s.type === 'blank' ? '{blank}' : s.content)).join('');
      const blanks = segments
        .filter((s: any) => s.type === 'blank')
        .map((s: any) => s.content)
        .join('|');
      csvSections.push(
        [
          escapeCSV(q.title),
          q.type,
          q.difficulty,
          q.subject,
          escapeCSV(q.grade),
          escapeCSV(q.chapter),
          escapeCSV(text),
          escapeCSV(blanks),
          q.data?.caseSensitive || false,
          escapeCSV(q.explanation),
        ].join(',')
      );
    });
  }

  return csvSections.join('\n');
}
