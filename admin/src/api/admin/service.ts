import type {
  ApiResponse,
  ArtStyleRequest,
  Book,
  BookType,
  FAQPost,
  Pagination,
  PaginationParams,
  UserQueryParams,
  SlideTemplateParams,
} from '@/types/api';
import type { Model, ModelPatchData } from '@aiprimary/core';
import type { User } from '@/types/auth';
import type { AdminApiService } from '@/types/service';
import { API_MODE, type ApiMode, api } from '@aiprimary/api';
import type { ArtStyle, SlideTemplate, SlideTheme } from '@aiprimary/core';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';
import type {
  QuestionBankItem,
  QuestionBankParams,
  QuestionBankFilters,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ImportResult,
} from '@/types/questionBank';
import { parseQuestionBankCSV, exportQuestionsToCSV } from '@/utils/csvParser';
import { validateQuestionBankCSV } from '@/utils/csvValidation';

// ============= HELPER FUNCTIONS =============
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const generateId = (prefix: string = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const paginate = <T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): { data: T[]; pagination: Pagination } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      pageSize,
      totalPages,
      totalItems,
    },
  };
};

// ============= MOCK DATA FOR UNIMPLEMENTED APIs =============
// These mock implementations will be replaced when backend APIs are ready

// Mock data for FAQ Posts
let MOCK_FAQ_POSTS: FAQPost[] = [
  {
    id: 'faq-1',
    title: 'How do I create a new presentation?',
    content: `To create a new presentation, follow these steps:

1. Click the "New Presentation" button on the dashboard
2. Choose a template or start from scratch
3. Add your content using the slide editor
4. Save and share your presentation

You can also import existing presentations from PowerPoint or Google Slides.`,
    category: 'Getting Started',
    isPublished: true,
    order: 1,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'faq-2',
    title: 'What AI features are available?',
    content: `Our platform offers several AI-powered features:

- **Content Generation**: AI can help you generate slide content based on topics
- **Image Generation**: Create custom images using AI
- **Design Suggestions**: Get layout and design recommendations
- **Translation**: Automatically translate your presentations
- **Summary**: Generate summaries of long presentations`,
    category: 'AI Features',
    isPublished: true,
    order: 2,
    createdAt: '2024-02-05T09:00:00Z',
    updatedAt: '2024-07-20T11:15:00Z',
  },
  {
    id: 'faq-3',
    title: 'How do I share my presentation?',
    content: `You can share your presentation in multiple ways:

1. **Public Link**: Generate a shareable link anyone can view
2. **Email Invite**: Send direct invitations to collaborators
3. **Embed**: Get an embed code for websites
4. **Export**: Download as PDF, PPTX, or images

Access the sharing options by clicking the "Share" button in the presentation editor.`,
    category: 'Sharing',
    isPublished: true,
    order: 3,
    createdAt: '2024-03-12T15:30:00Z',
    updatedAt: '2024-08-10T09:45:00Z',
  },
  {
    id: 'faq-4',
    title: 'How do I upgrade my account?',
    content: `To upgrade your account:

1. Go to Settings > Subscription
2. Compare available plans
3. Select your preferred plan
4. Complete the payment process

You can upgrade or downgrade your plan at any time. Changes take effect immediately.`,
    category: 'Account',
    isPublished: false,
    order: 4,
    createdAt: '2024-04-08T11:00:00Z',
    updatedAt: '2024-09-05T16:20:00Z',
  },
  {
    id: 'faq-5',
    title: 'What file formats can I import?',
    content: `We support the following file formats for import:

- **PowerPoint**: .pptx, .ppt
- **Google Slides**: Direct import via Google account
- **PDF**: Convert PDF files to editable presentations
- **Images**: .png, .jpg, .svg for individual slides

Simply drag and drop files or use the Import button in the dashboard.`,
    category: 'Getting Started',
    isPublished: true,
    order: 5,
    createdAt: '2024-05-20T13:00:00Z',
    updatedAt: '2024-09-10T10:30:00Z',
  },
];

// Mock data for Books
let MOCK_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Mathematics Grade 10',
    description:
      'Comprehensive mathematics textbook covering algebra, geometry, and statistics for grade 10 students.',
    type: 'TEXTBOOK',
    grade: '10',
    subject: 'Mathematics',
    publisher: 'Education Press',
    pdfUrl: '/uploads/books/math-grade-10.pdf',
    thumbnailUrl: '/uploads/thumbnails/math-grade-10.jpg',
    isPublished: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'book-2',
    title: 'Physics Grade 11',
    description: 'Complete physics curriculum including mechanics, thermodynamics, and electromagnetism.',
    type: 'TEXTBOOK',
    grade: '11',
    subject: 'Physics',
    publisher: 'Science Books Inc.',
    pdfUrl: '/uploads/books/physics-grade-11.pdf',
    thumbnailUrl: '/uploads/thumbnails/physics-grade-11.jpg',
    isPublished: true,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-07-15T11:15:00Z',
  },
  {
    id: 'book-3',
    title: 'English Literature Guide',
    description: 'Teacher guide for English literature curriculum with lesson plans and assessments.',
    type: 'TEACHERBOOK',
    grade: '10-12',
    subject: 'English',
    publisher: 'Language Arts Publishing',
    pdfUrl: '/uploads/books/english-teacher-guide.pdf',
    thumbnailUrl: '/uploads/thumbnails/english-teacher-guide.jpg',
    isPublished: true,
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-08-10T09:45:00Z',
  },
  {
    id: 'book-4',
    title: 'Chemistry Lab Manual',
    description: 'Practical chemistry experiments and procedures for laboratory sessions.',
    type: 'TEXTBOOK',
    grade: '11',
    subject: 'Chemistry',
    publisher: 'Science Books Inc.',
    pdfUrl: '/uploads/books/chemistry-lab-manual.pdf',
    thumbnailUrl: '/uploads/thumbnails/chemistry-lab.jpg',
    isPublished: false,
    createdAt: '2024-04-12T16:30:00Z',
    updatedAt: '2024-09-01T15:00:00Z',
  },
  {
    id: 'book-5',
    title: 'History Teaching Guide',
    description: 'Comprehensive teaching guide for world history with interactive activities.',
    type: 'TEACHERBOOK',
    grade: '9-10',
    subject: 'History',
    publisher: 'Humanities Press',
    pdfUrl: '/uploads/books/history-teacher-guide.pdf',
    thumbnailUrl: '/uploads/thumbnails/history-guide.jpg',
    isPublished: true,
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-09-15T12:30:00Z',
  },
];

export default class AdminRealApiService implements AdminApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  // Users
  async getUsers(params?: UserQueryParams): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>(`${this.baseUrl}/api/users`, { params });
    return response.data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(`${this.baseUrl}/api/users/${id}`);
    return response.data;
  }

  // Slide Themes
  async getSlideThemes(params?: PaginationParams): Promise<ApiResponse<SlideTheme[]>> {
    const response = await api.get<ApiResponse<SlideTheme[]>>(`${this.baseUrl}/api/slide-themes`, {
      params: {
        ...params,
        page: params?.page && params.page >= 1 ? params.page : 1,
        limit: params?.pageSize,
      },
    });
    return response.data;
  }

  async createSlideTheme(data: SlideTheme): Promise<ApiResponse<SlideTheme>> {
    const response = await api.post<ApiResponse<SlideTheme>>(`${this.baseUrl}/api/slide-themes`, data);
    return response.data;
  }

  async updateSlideTheme(id: string, data: SlideTheme): Promise<ApiResponse<SlideTheme>> {
    const response = await api.put<ApiResponse<SlideTheme>>(`${this.baseUrl}/api/slide-themes/${id}`, data);
    return response.data;
  }

  // Slide Templates
  async getSlideTemplates(params?: SlideTemplateParams): Promise<ApiResponse<SlideTemplate[]>> {
    const response = await api.get<ApiResponse<SlideTemplate[]>>(`${this.baseUrl}/api/slide-templates`, {
      params,
    });
    return response.data;
  }

  async createSlideTemplate(data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> {
    const response = await api.post<ApiResponse<SlideTemplate>>(`${this.baseUrl}/api/slide-templates`, data);
    return response.data;
  }

  async updateSlideTemplate(id: string, data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> {
    const response = await api.put<ApiResponse<SlideTemplate>>(
      `${this.baseUrl}/api/slide-templates/${id}`,
      data
    );
    return response.data;
  }

  async deleteSlideTemplate(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/slide-templates/${id}`);
    return response.data;
  }

  // Art Styles
  async getArtStyles(params?: PaginationParams): Promise<ApiResponse<ArtStyle[]>> {
    const response = await api.get<ApiResponse<ArtStyle[]>>(`${this.baseUrl}/api/art-styles`, {
      params,
    });
    return response.data;
  }

  async createArtStyle(data: ArtStyleRequest): Promise<ApiResponse<ArtStyle>> {
    const response = await api.post<ApiResponse<ArtStyle>>(`${this.baseUrl}/api/art-styles`, data);
    return response.data;
  }

  async updateArtStyle(id: string, data: ArtStyleRequest): Promise<ApiResponse<ArtStyle>> {
    const response = await api.put<ApiResponse<ArtStyle>>(`${this.baseUrl}/api/art-styles/${id}`, data);
    return response.data;
  }

  // AI Models
  async getModels(type?: string | null): Promise<ApiResponse<Model[]>> {
    const params = type ? { modelType: type } : undefined;
    const response = await api.get<ApiResponse<any[]>>(`${this.baseUrl}/api/models`, { params });

    // Map backend response to frontend Model interface
    const mappedData = response.data.data.map((model: any) => ({
      id: model.modelId,
      name: model.modelName,
      displayName: model.displayName,
      enabled: model.enabled,
      default: model.default,
      provider: model.provider,
      type: model.modelType,
    }));

    return {
      ...response.data,
      data: mappedData,
    };
  }

  async patchModel(id: string, data: ModelPatchData): Promise<ApiResponse<Model>> {
    const response = await api.patch<ApiResponse<any>>(`${this.baseUrl}/api/models/${id}`, data);

    // Map backend response to frontend Model interface
    const mappedData = {
      id: response.data.data.modelId,
      name: response.data.data.modelName,
      displayName: response.data.data.displayName,
      enabled: response.data.data.enabled,
      default: response.data.data.default,
      provider: response.data.data.provider,
      type: response.data.data.modelType,
    };

    return {
      ...response.data,
      data: mappedData,
    };
  }

  // FAQ Posts (MOCK - Backend not implemented yet)
  async getFAQPosts(params?: PaginationParams): Promise<ApiResponse<FAQPost[]>> {
    await delay();
    const { data, pagination } = paginate(MOCK_FAQ_POSTS, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async createFAQPost(data: FAQPost): Promise<ApiResponse<FAQPost>> {
    await delay(500);
    const newPost: FAQPost = {
      ...data,
      id: generateId('faq'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_FAQ_POSTS.unshift(newPost);
    return { success: true, data: newPost };
  }

  async updateFAQPost(id: string, data: FAQPost): Promise<ApiResponse<FAQPost>> {
    await delay(500);
    const index = MOCK_FAQ_POSTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('FAQ post not found');
    const updated = { ...data, id, updatedAt: new Date().toISOString() };
    MOCK_FAQ_POSTS[index] = updated;
    return { success: true, data: updated };
  }

  async deleteFAQPost(id: string): Promise<ApiResponse<void>> {
    await delay(500);
    const index = MOCK_FAQ_POSTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('FAQ post not found');
    MOCK_FAQ_POSTS.splice(index, 1);
    return { success: true, data: undefined };
  }

  // Books (MOCK - Backend not implemented yet)
  async getBooks(params?: PaginationParams & { type?: BookType }): Promise<ApiResponse<Book[]>> {
    await delay();
    let books = MOCK_BOOKS;
    if (params?.type) {
      books = books.filter((b) => b.type === params.type);
    }
    const { data, pagination } = paginate(books, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    await delay();
    const book = MOCK_BOOKS.find((b) => b.id === id);
    if (!book) throw new Error('Book not found');
    return { success: true, data: book };
  }

  async createBook(data: FormData): Promise<ApiResponse<Book>> {
    await delay(500);
    const newBook: Book = {
      id: generateId('book'),
      title: data.get('title') as string,
      type: data.get('type') as BookType,
      description: data.get('description') as string,
      grade: data.get('grade') as string,
      subject: data.get('subject') as string,
      publisher: data.get('publisher') as string,
      pdfUrl: '/uploads/books/sample.pdf',
      thumbnailUrl: '/uploads/thumbnails/sample-thumb.jpg',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_BOOKS.unshift(newBook);
    return { success: true, data: newBook };
  }

  async updateBook(id: string, data: FormData): Promise<ApiResponse<Book>> {
    await delay(500);
    const index = MOCK_BOOKS.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');
    const updated = {
      ...MOCK_BOOKS[index],
      title: data.get('title') as string,
      description: data.get('description') as string,
      updatedAt: new Date().toISOString(),
    };
    MOCK_BOOKS[index] = updated;
    return { success: true, data: updated };
  }

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    await delay(500);
    const index = MOCK_BOOKS.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');
    MOCK_BOOKS.splice(index, 1);
    return { success: true, data: undefined };
  }

  // Question Bank
  async getQuestionBank(params?: QuestionBankParams): Promise<ApiResponse<QuestionBankItem[]>> {
    // Map frontend field names to backend field names
    const queryParams: any = {
      bankType: 'public', // Admin manages public questions
      page: params?.page,
      pageSize: params?.pageSize,
      search: params?.searchText,
      sortBy: params?.sortBy,
      sortDirection: params?.sortDirection,
    };

    // Map subject -> subject, questionType -> type
    if (params?.difficulty) {
      queryParams.difficulty = params.difficulty;
    }
    if (params?.subject) {
      queryParams.subject = params.subject; // Backend expects 'subject'
    }
    if (params?.questionType) {
      queryParams.type = params.questionType; // Backend expects 'type'
    }
    if (params?.grade) {
      queryParams.grade = params.grade;
    }
    if (params?.chapter) {
      queryParams.chapter = params.chapter;
    }

    const response = await api.get<ApiResponse<QuestionBankItem[]>>(
      `${this.baseUrl}/api/admin/questionbank`,
      {
        params: queryParams,
      }
    );
    return response.data;
  }

  // Question Bank Metadata (Static values from frontend)
  async getQuestionBankSubjects(): Promise<ApiResponse<string[]>> {
    // Return static subject codes from frontend
    const subjects = getAllSubjects().map((s) => s.code);
    return { success: true, data: subjects };
  }

  async getQuestionBankGrades(): Promise<ApiResponse<string[]>> {
    // Return static elementary grade codes (1-5) from frontend
    const grades = getElementaryGrades().map((g) => g.code);
    return { success: true, data: grades };
  }

  async getQuestionBankChapters(_subject: string, _grade: string): Promise<ApiResponse<string[]>> {
    // Chapters are dynamic and curriculum-specific, return empty array
    // In the future, this could be populated from a static curriculum definition
    return { success: true, data: [] };
  }

  async getQuestionById(id: string): Promise<ApiResponse<QuestionBankItem>> {
    const response = await api.get<ApiResponse<QuestionBankItem>>(
      `${this.baseUrl}/api/admin/questionbank/${id}`
    );
    return response.data;
  }

  async createQuestion(payload: CreateQuestionPayload): Promise<ApiResponse<QuestionBankItem>> {
    // Map frontend field names to backend field names
    const { subject, ...rest } = payload.question as any;
    const backendPayload = [
      {
        ...rest,
        subject: subject,
      },
    ];

    const response = await api.post<ApiResponse<QuestionBankItem>>(
      `${this.baseUrl}/api/admin/questionbank`,
      backendPayload
    );
    return response.data;
  }

  async updateQuestion(id: string, payload: UpdateQuestionPayload): Promise<ApiResponse<QuestionBankItem>> {
    // Map frontend field names to backend field names
    const { subject, ...rest } = payload.question as any;
    const backendPayload = {
      ...rest,
      subject: subject, // Backend expects 'subject' not 'subject'
    };

    const response = await api.put<ApiResponse<QuestionBankItem>>(
      `${this.baseUrl}/api/admin/questionbank/${id}`,
      backendPayload
    );
    return response.data;
  }

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/admin/questionbank/${id}`);
    return response.data;
  }

  async bulkDeleteQuestions(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    // Client-side implementation: delete one by one using existing endpoint
    let deletedCount = 0;

    for (const id of ids) {
      try {
        await this.deleteQuestion(id);
        deletedCount++;
      } catch {
        // Continue deleting other items even if one fails
      }
    }

    return {
      success: true,
      data: { deletedCount },
    };
  }

  async duplicateQuestion(id: string): Promise<ApiResponse<QuestionBankItem>> {
    // Client-side implementation: fetch question then create a copy
    const original = await this.getQuestionById(id);

    // Strip fields that backend generates
    const { id: _id, createdAt, updatedAt, createdBy, ...questionData } = original.data;

    // Create new question with same data
    const payload: CreateQuestionPayload = {
      question: questionData as Omit<QuestionBankItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    };

    return this.createQuestion(payload);
  }

  async exportQuestions(filters?: QuestionBankFilters): Promise<Blob> {
    // Client-side implementation: fetch all questions and generate CSV
    const allQuestions: QuestionBankItem[] = [];
    let page = 1;
    const pageSize = 100;

    // Fetch all pages
    while (true) {
      const response = await this.getQuestionBank({ ...filters, page, pageSize });
      allQuestions.push(...response.data);
      if (response.data.length < pageSize) break;
      page++;
    }

    // Convert to CSV using existing utility
    const csvContent = exportQuestionsToCSV(allQuestions);

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async importQuestions(file: File): Promise<ApiResponse<ImportResult>> {
    // Client-side implementation: parse CSV and create questions one by one
    const content = await file.text();

    // Parse CSV to questions
    let questions: QuestionBankItem[];
    try {
      questions = parseQuestionBankCSV(content);
    } catch (error) {
      return {
        success: false,
        data: {
          success: 0,
          failed: 0,
          errors: [{ row: 0, error: error instanceof Error ? error.message : 'Failed to parse CSV' }],
        },
      };
    }

    // Validate questions
    const validation = validateQuestionBankCSV(questions);
    if (!validation.isValid) {
      return {
        success: false,
        data: {
          success: 0,
          failed: questions.length,
          errors: validation.errors.map((e) => ({ row: e.row, error: e.message })),
        },
      };
    }

    // Create questions one by one, tracking success/failure
    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const { id: _id, createdAt, updatedAt, createdBy, ...data } = questions[i];
        await this.createQuestion({ question: data as any });
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push({ row: i + 2, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return {
      success: true,
      data: { success: successCount, failed: failedCount, errors: errors.length > 0 ? errors : undefined },
    };
  }
}
