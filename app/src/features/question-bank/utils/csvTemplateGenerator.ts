import type { QuestionType } from '@aiprimary/core';
import { QUESTION_TYPE } from '@aiprimary/core';

/**
 * CSV Template Structure for Question Bank Import
 *
 * Multiple Choice:
 * title, type, difficulty, subject, grade, chapter, option1..optionN, correctOption, explanation
 *
 * Matching:
 * title, type, difficulty, subject, grade, chapter, pair1_left, pair1_right, ..., explanation
 *
 * Open Ended:
 * title, type, difficulty, subject, grade, chapter, expectedAnswer, maxLength, explanation
 *
 * Fill in Blank:
 * title, type, difficulty, subject, grade, chapter, text, blanks, caseSensitive, explanation
 */

const MULTIPLE_CHOICE_TEMPLATE = `title,type,difficulty,subject,grade,chapter,option1,option2,option3,option4,correctOption,explanation
"What is 2+2?","MULTIPLE_CHOICE","KNOWLEDGE","T","3","","2","3","4","5","3","Basic addition"
"Choose the correct spelling","MULTIPLE_CHOICE","COMPREHENSION","TV","2","","hok","học","hóc","hộc","2","Vietnamese spelling"`;

const MATCHING_TEMPLATE = `title,type,difficulty,subject,grade,chapter,pair1_left,pair1_right,pair2_left,pair2_right,pair3_left,pair3_right,explanation
"Match numbers with words","MATCHING","KNOWLEDGE","T","3","","1","One","2","Two","3","Three","Match numerical digits with written words"
"Match English to Vietnamese","MATCHING","COMPREHENSION","TA","4","","Book","Sách","Pen","Bút","Table","Bàn","Translate English words"`;

const OPEN_ENDED_TEMPLATE = `title,type,difficulty,subject,grade,chapter,expectedAnswer,maxLength,explanation
"Describe your family","OPEN_ENDED","COMPREHENSION","TV","3","","Gia đình tôi có 4 người...","500","Students should describe family members and relationships"
"Explain photosynthesis","OPEN_ENDED","APPLICATION","TA","5","","Photosynthesis is the process...","800","Explain the process of converting light to energy"`;

const FILL_IN_BLANK_TEMPLATE = `title,type,difficulty,subject,grade,chapter,text,blanks,caseSensitive,explanation
"Complete the sentence","FILL_IN_BLANK","KNOWLEDGE","TV","2","","Thủ đô của Việt Nam là {blank}.","Hà Nội","false","Capital city of Vietnam"
"Fill in the answer","FILL_IN_BLANK","COMPREHENSION","T","3","","5 + 7 = {blank}","12","false","Basic arithmetic"`;

/**
 * Generate CSV template for a specific question type
 */
export function generateQuestionBankTemplate(questionType?: QuestionType): string {
  if (!questionType) {
    // Return all templates combined
    return [
      '# Multiple Choice Questions',
      MULTIPLE_CHOICE_TEMPLATE,
      '',
      '# Matching Questions',
      MATCHING_TEMPLATE,
      '',
      '# Open-ended Questions',
      OPEN_ENDED_TEMPLATE,
      '',
      '# Fill in Blank Questions',
      FILL_IN_BLANK_TEMPLATE,
    ].join('\n');
  }

  switch (questionType) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return MULTIPLE_CHOICE_TEMPLATE;
    case QUESTION_TYPE.MATCHING:
      return MATCHING_TEMPLATE;
    case QUESTION_TYPE.OPEN_ENDED:
      return OPEN_ENDED_TEMPLATE;
    case QUESTION_TYPE.FILL_IN_BLANK:
      return FILL_IN_BLANK_TEMPLATE;
    default:
      return MULTIPLE_CHOICE_TEMPLATE;
  }
}

/**
 * Download CSV template file
 */
export function downloadCSVTemplate(questionType?: QuestionType): void {
  const csvContent = generateQuestionBankTemplate(questionType);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const filename = questionType
    ? `question-bank-template-${questionType}.csv`
    : 'question-bank-template-all.csv';

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get template description for a question type
 */
export function getTemplateDescription(questionType: QuestionType): string {
  switch (questionType) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return 'CSV format: title, type, difficulty, subject, grade, chapter, option1-N, correctOption (1-N), explanation';
    case QUESTION_TYPE.MATCHING:
      return 'CSV format: title, type, difficulty, subject, grade, chapter, pair1_left, pair1_right, ..., explanation';
    case QUESTION_TYPE.OPEN_ENDED:
      return 'CSV format: title, type, difficulty, subject, grade, chapter, expectedAnswer, maxLength, explanation';
    case QUESTION_TYPE.FILL_IN_BLANK:
      return 'CSV format: title, type, difficulty, subject, grade, chapter, text (use {blank} for blanks), blanks (answers), caseSensitive, explanation';
    default:
      return 'Unknown question type';
  }
}
