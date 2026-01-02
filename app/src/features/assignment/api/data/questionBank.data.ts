import type { QuestionBankItem } from '../../types/questionBank';
import { QUESTION_TYPE, DIFFICULTY, BANK_TYPE } from '../../types';
import { generateId } from '@/shared/lib/utils';

/**
 * Question Bank Mock Data
 * Collection of pre-made questions for browsing and selection
 * Distributed across all question types, difficulty levels, and subjects
 *
 * Note: All questions here are from the application-wide bank
 */

export const questionBankData: QuestionBankItem[] = [
  // ============================================
  // MULTIPLE CHOICE QUESTIONS (5 questions)
  // ============================================
  {
    id: generateId(),
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.EASY,
    title: '5 + 3 bằng bao nhiêu?',
    explanation: '5 + 3 = 8',
    points: 5,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      options: [
        { id: generateId(), text: '6', isCorrect: false },
        { id: generateId(), text: '7', isCorrect: false },
        { id: generateId(), text: '8', isCorrect: true },
        { id: generateId(), text: '9', isCorrect: false },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.EASY,
    title: 'Từ nào viết đúng chính tả?',
    explanation: 'Chữ "học" viết đúng chính tả trong tiếng Việt.',
    points: 5,
    subjectCode: 'TV',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      options: [
        { id: generateId(), text: 'hok', isCorrect: false },
        { id: generateId(), text: 'học', isCorrect: true },
        { id: generateId(), text: 'hóc', isCorrect: false },
        { id: generateId(), text: 'hộc', isCorrect: false },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.MEDIUM,
    title: 'What color is the sky?',
    explanation: 'The sky appears blue due to the scattering of sunlight by the atmosphere.',
    points: 10,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      options: [
        { id: generateId(), text: 'Red', isCorrect: false },
        { id: generateId(), text: 'Blue', isCorrect: true },
        { id: generateId(), text: 'Green', isCorrect: false },
        { id: generateId(), text: 'Yellow', isCorrect: false },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.MEDIUM,
    title: '12 × 3 bằng bao nhiêu?',
    explanation: '12 nhân với 3 bằng 36.',
    points: 10,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      options: [
        { id: generateId(), text: '32', isCorrect: false },
        { id: generateId(), text: '34', isCorrect: false },
        { id: generateId(), text: '36', isCorrect: true },
        { id: generateId(), text: '38', isCorrect: false },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.HARD,
    title: 'Choose the correct sentence:',
    explanation: 'The correct form is "She goes to school every day" using the third person singular form.',
    points: 15,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      options: [
        { id: generateId(), text: 'She go to school every day', isCorrect: false },
        { id: generateId(), text: 'She goes to school every day', isCorrect: true },
        { id: generateId(), text: 'She going to school every day', isCorrect: false },
        { id: generateId(), text: 'She gone to school every day', isCorrect: false },
      ],
    },
  },

  // ============================================
  // MATCHING QUESTIONS (4 questions)
  // ============================================
  {
    id: generateId(),
    type: QUESTION_TYPE.MATCHING,
    difficulty: DIFFICULTY.EASY,
    title: 'Nối số với chữ số tương ứng',
    explanation: 'Ghép các số với cách viết bằng chữ.',
    points: 10,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      pairs: [
        { id: generateId(), left: '10', right: 'Mười' },
        { id: generateId(), left: '20', right: 'Hai mươi' },
        { id: generateId(), left: '30', right: 'Ba mươi' },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MATCHING,
    difficulty: DIFFICULTY.MEDIUM,
    title: 'Match English words with Vietnamese meanings',
    explanation: 'Connect English words with their Vietnamese translations.',
    points: 15,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      pairs: [
        { id: generateId(), left: 'Book', right: 'Sách' },
        { id: generateId(), left: 'Pen', right: 'Bút' },
        { id: generateId(), left: 'Table', right: 'Bàn' },
        { id: generateId(), left: 'Chair', right: 'Ghế' },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MATCHING,
    difficulty: DIFFICULTY.MEDIUM,
    title: 'Nối từ loại với ví dụ',
    explanation: 'Ghép các từ loại trong tiếng Việt với ví dụ tương ứng.',
    points: 15,
    subjectCode: 'TV',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      pairs: [
        { id: generateId(), left: 'Danh từ', right: 'Cái bàn' },
        { id: generateId(), left: 'Động từ', right: 'Chạy' },
        { id: generateId(), left: 'Tính từ', right: 'Đẹp' },
        { id: generateId(), left: 'Trạng từ', right: 'Nhanh' },
      ],
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.MATCHING,
    difficulty: DIFFICULTY.SUPER_HARD,
    title: 'Nối phép tính với kết quả',
    explanation: 'Tính toán và ghép các phép tính với kết quả đúng.',
    points: 20,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      pairs: [
        { id: generateId(), left: '15 + 8', right: '23' },
        { id: generateId(), left: '24 - 9', right: '15' },
        { id: generateId(), left: '6 × 7', right: '42' },
        { id: generateId(), left: '48 ÷ 6', right: '8' },
        { id: generateId(), left: '100 - 35', right: '65' },
      ],
    },
  },

  // ============================================
  // OPEN-ENDED QUESTIONS (3 questions)
  // ============================================
  {
    id: generateId(),
    type: QUESTION_TYPE.OPEN_ENDED,
    difficulty: DIFFICULTY.MEDIUM,
    title: 'Em hãy viết một đoạn văn ngắn (5-7 câu) về gia đình của em.',
    explanation:
      'Học sinh nên mô tả các thành viên trong gia đình, công việc và những điều đặc biệt về gia đình.',
    points: 15,
    subjectCode: 'TV',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      expectedAnswer:
        'Gia đình em có bốn người: bố, mẹ, em và em trai. Bố em là kỹ sư, còn mẹ em là giáo viên. Em học lớp 5, em trai học lớp 2. Gia đình em rất yêu thương nhau. Cuối tuần, cả nhà thường đi chơi công viên. Em rất yêu gia đình của mình.',
      maxLength: 500,
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.OPEN_ENDED,
    difficulty: DIFFICULTY.HARD,
    title: 'Write a short paragraph (5-7 sentences) about your favorite animal.',
    explanation:
      'Students should describe the animal, its characteristics, habitat, and explain why they like it.',
    points: 20,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      expectedAnswer:
        'My favorite animal is the dolphin. Dolphins are intelligent marine mammals that live in oceans. They are gray in color and can swim very fast. Dolphins are friendly and often play with each other. They communicate using clicks and whistles. I like dolphins because they are smart and beautiful. I hope to see dolphins in real life someday.',
      maxLength: 800,
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.OPEN_ENDED,
    difficulty: DIFFICULTY.SUPER_HARD,
    title:
      'Giải thích cách giải bài toán: "Một cửa hàng có 156 quả cam. Người ta đã bán đi 3/4 số cam. Hỏi còn lại bao nhiêu quả cam?"',
    explanation: 'Học sinh cần trình bày đầy đủ các bước giải và giải thích lý do.',
    points: 25,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      expectedAnswer:
        'Bước 1: Tính số cam đã bán. Số cam đã bán = 156 × 3/4 = 117 quả. Bước 2: Tính số cam còn lại. Số cam còn lại = 156 - 117 = 39 quả. Vậy cửa hàng còn lại 39 quả cam. Giải thích: Ta dùng phép nhân để tính 3/4 của 156, sau đó dùng phép trừ để tìm số còn lại.',
      maxLength: 1000,
    },
  },

  // ============================================
  // FILL-IN-BLANK QUESTIONS (4 questions)
  // ============================================
  {
    id: generateId(),
    type: QUESTION_TYPE.FILL_IN_BLANK,
    difficulty: DIFFICULTY.EASY,
    title: 'Điền vào chỗ trống',
    explanation: 'Thủ đô của Việt Nam là Hà Nội.',
    points: 5,
    subjectCode: 'TV',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      segments: [
        { id: generateId(), type: 'text', content: 'Thủ đô của Việt Nam là ' },
        {
          id: generateId(),
          type: 'blank',
          content: 'Hà Nội',
          acceptableAnswers: ['Hà Nội', 'Ha Noi'],
        },
        { id: generateId(), type: 'text', content: '.' },
      ],
      caseSensitive: false,
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.FILL_IN_BLANK,
    difficulty: DIFFICULTY.EASY,
    title: 'Complete the sentence',
    explanation: 'The color of grass is green.',
    points: 5,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      segments: [
        { id: generateId(), type: 'text', content: 'The grass is ' },
        {
          id: generateId(),
          type: 'blank',
          content: 'green',
          acceptableAnswers: ['green'],
        },
        { id: generateId(), type: 'text', content: '.' },
      ],
      caseSensitive: false,
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.FILL_IN_BLANK,
    difficulty: DIFFICULTY.MEDIUM,
    title: 'Điền số thích hợp vào chỗ trống',
    explanation: '5 + 7 = 12',
    points: 10,
    subjectCode: 'T',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      segments: [
        { id: generateId(), type: 'text', content: '5 + 7 = ' },
        {
          id: generateId(),
          type: 'blank',
          content: '12',
          acceptableAnswers: ['12', 'mười hai'],
        },
        { id: generateId(), type: 'text', content: '' },
      ],
      caseSensitive: false,
    },
  },
  {
    id: generateId(),
    type: QUESTION_TYPE.FILL_IN_BLANK,
    difficulty: DIFFICULTY.HARD,
    title: 'Fill in the blank with the correct form',
    explanation: 'Use "am" with "I" in present tense.',
    points: 15,
    subjectCode: 'TA',
    bankType: BANK_TYPE.APPLICATION,
    createdAt: new Date().toISOString(),
    data: {
      segments: [
        { id: generateId(), type: 'text', content: 'I ' },
        {
          id: generateId(),
          type: 'blank',
          content: 'am',
          acceptableAnswers: ['am'],
        },
        { id: generateId(), type: 'text', content: ' a student.' },
      ],
      caseSensitive: true,
    },
  },
];
