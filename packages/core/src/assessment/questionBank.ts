import type { SubjectCode, BankType } from './constants';
import type { Question } from './question';

/**
 * QuestionBankItem combines Question with additional metadata for the bank
 */
export type QuestionBankItem = Question & {
  subject: SubjectCode;
  grade?: string;
  chapter?: string;
  contextId?: string;
  bankType?: BankType;
  createdBy?: string;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
};
