import type { ApiMode } from '@aiprimary/api';
import type { User, LoginRequest, LoginResponse } from './auth';
import type {
  ApiResponse,
  PaginationParams,
  UserQueryParams,
  SlideTemplateParams,
  FAQPost,
  Book,
  BookType,
  ArtStyleRequest,
} from './api';
import type { SlideTheme, SlideTemplate, ArtStyle, Model, ModelPatchData } from '@aiprimary/core';
import type {
  QuestionBankItem,
  QuestionBankParams,
  QuestionBankFilters,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ImportResult,
} from './question-bank';

/**
 * Base service interface that all API services must extend
 */
export interface Service {
  baseUrl: string;
  getType(): ApiMode;
}

/**
 * Authentication API Service Interface
 */
export interface AuthApiService extends Service {
  login(data: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  refreshToken(refreshToken: string): Promise<LoginResponse>;
}

/**
 * Admin API Service Interface
 */
export interface AdminApiService extends Service {
  // Users
  getUsers(params?: UserQueryParams): Promise<ApiResponse<User[]>>;
  getUserById(id: string): Promise<ApiResponse<User>>;

  // Slide Themes
  getSlideThemes(params?: PaginationParams): Promise<ApiResponse<SlideTheme[]>>;
  createSlideTheme(data: SlideTheme): Promise<ApiResponse<SlideTheme>>;
  updateSlideTheme(id: string, data: SlideTheme): Promise<ApiResponse<SlideTheme>>;

  // Slide Templates
  getSlideTemplates(params?: SlideTemplateParams): Promise<ApiResponse<SlideTemplate[]>>;
  createSlideTemplate(data: SlideTemplate): Promise<ApiResponse<SlideTemplate>>;
  updateSlideTemplate(id: string, data: SlideTemplate): Promise<ApiResponse<SlideTemplate>>;
  deleteSlideTemplate(id: string): Promise<ApiResponse<void>>;

  // Art Styles
  getArtStyles(params?: PaginationParams): Promise<ApiResponse<ArtStyle[]>>;
  createArtStyle(data: ArtStyleRequest): Promise<ApiResponse<ArtStyle>>;
  updateArtStyle(id: string, data: ArtStyleRequest): Promise<ApiResponse<ArtStyle>>;

  // AI Models
  getModels(type?: string | null): Promise<ApiResponse<Model[]>>;
  patchModel(id: string, data: ModelPatchData): Promise<ApiResponse<Model>>;

  // FAQ Posts
  getFAQPosts(params?: PaginationParams): Promise<ApiResponse<FAQPost[]>>;
  createFAQPost(data: FAQPost): Promise<ApiResponse<FAQPost>>;
  updateFAQPost(id: string, data: FAQPost): Promise<ApiResponse<FAQPost>>;
  deleteFAQPost(id: string): Promise<ApiResponse<void>>;

  // Books
  getBooks(params?: PaginationParams & { type?: BookType }): Promise<ApiResponse<Book[]>>;
  getBookById(id: string): Promise<ApiResponse<Book>>;
  createBook(data: FormData): Promise<ApiResponse<Book>>;
  updateBook(id: string, data: FormData): Promise<ApiResponse<Book>>;
  deleteBook(id: string): Promise<ApiResponse<void>>;

  // Question Bank
  getQuestionBank(params?: QuestionBankParams): Promise<ApiResponse<QuestionBankItem[]>>;
  getQuestionById(id: string): Promise<ApiResponse<QuestionBankItem>>;
  createQuestion(payload: CreateQuestionPayload): Promise<ApiResponse<QuestionBankItem>>;
  updateQuestion(id: string, payload: UpdateQuestionPayload): Promise<ApiResponse<QuestionBankItem>>;
  deleteQuestion(id: string): Promise<ApiResponse<void>>;
  bulkDeleteQuestions(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>>;
  duplicateQuestion(id: string): Promise<ApiResponse<QuestionBankItem>>;
  exportQuestions(filters?: QuestionBankFilters): Promise<Blob>;
  importQuestions(file: File): Promise<ApiResponse<ImportResult>>;
  // Question Bank Metadata
  getQuestionBankSubjects(): Promise<ApiResponse<string[]>>;
  getQuestionBankGrades(): Promise<ApiResponse<string[]>>;
  getQuestionBankChapters(subject: string, grade: string): Promise<ApiResponse<string[]>>;
}
