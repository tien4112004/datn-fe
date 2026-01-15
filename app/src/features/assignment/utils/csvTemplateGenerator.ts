import type { QuestionType } from '@/features/assignment/types';
import { QUESTION_TYPE } from '@/features/assignment/types';

/**
 * CSV Template Structure for Question Bank Import
 *
 * Multiple Choice:
 * title, type, difficulty, subjectCode, points, option1, option2, option3, option4, correctOption, explanation
 *
 * Matching:
 * title, type, difficulty, subjectCode, points, pair1_left, pair1_right, pair2_left, pair2_right, ..., explanation
 *
 * Open Ended:
 * title, type, difficulty, subjectCode, points, expectedAnswer, maxLength, explanation
 *
 * Fill in Blank:
 * title, type, difficulty, subjectCode, points, text, blanks, caseSensitive, explanation
 */

const MULTIPLE_CHOICE_TEMPLATE = `title,type,difficulty,subjectCode,points,option1,option2,option3,option4,correctOption,explanation
"What is 2+2?","multiple_choice","nhan_biet","T","10","2","3","4","5","4","Basic addition"
"Choose the correct spelling","multiple_choice","thong_hieu","TV","10","hok","học","hóc","hộc","học","Vietnamese spelling"`;

const MATCHING_TEMPLATE = `title,type,difficulty,subjectCode,points,pair1_left,pair1_right,pair2_left,pair2_right,pair3_left,pair3_right,explanation
"Match numbers with words","matching","nhan_biet","T","15","1","One","2","Two","3","Three","Match numerical digits with written words"
"Match English to Vietnamese","matching","thong_hieu","TA","15","Book","Sách","Pen","Bút","Table","Bàn","Translate English words"`;

const OPEN_ENDED_TEMPLATE = `title,type,difficulty,subjectCode,points,expectedAnswer,maxLength,explanation
"Describe your family","open_ended","thong_hieu","TV","20","Gia đình tôi có 4 người...","500","Students should describe family members and relationships"
"Explain photosynthesis","open_ended","van_dung","TA","25","Photosynthesis is the process...","800","Explain the process of converting light to energy"`;

const FILL_IN_BLANK_TEMPLATE = `title,type,difficulty,subjectCode,points,text,blanks,caseSensitive,explanation
"Complete the sentence","fill_in_blank","nhan_biet","TV","10","Thủ đô của Việt Nam là {blank}.","Hà Nội","false","Capital city of Vietnam"
"Fill in the answer","fill_in_blank","thong_hieu","T","10","5 + 7 = {blank}","12","false","Basic arithmetic"`;

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
      return 'CSV format: title, type, difficulty, subjectCode, points, option1-4, correctOption (1-4), explanation';
    case QUESTION_TYPE.MATCHING:
      return 'CSV format: title, type, difficulty, subjectCode, points, pair1_left, pair1_right, ..., explanation';
    case QUESTION_TYPE.OPEN_ENDED:
      return 'CSV format: title, type, difficulty, subjectCode, points, expectedAnswer, maxLength, explanation';
    case QUESTION_TYPE.FILL_IN_BLANK:
      return 'CSV format: title, type, difficulty, subjectCode, points, text (use {blank} for blanks), blanks (answers), caseSensitive, explanation';
    default:
      return 'Unknown question type';
  }
}
