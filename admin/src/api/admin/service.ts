import type {
  ApiResponse,
  ArtStyleRequest,
  ContextFilterParams,
  FAQPost,
  MatrixTemplate,
  MatrixTemplateParams,
  Pagination,
  PaginationParams,
  SlideTemplateParams,
  UserQueryParams,
} from '@/types/api';
import type { User } from '@/types/auth';
import type {
  CoinPricing,
  CoinPricingCreateRequest,
  CoinPricingQueryParams,
  CoinPricingUpdateRequest,
  EnumOption,
} from '@/types/coin';
import type { Context } from '@/types/context';
import type {
  ChapterResponse,
  CreateQuestionPayload,
  ImportResult,
  QuestionBankFilters,
  QuestionBankItem,
  QuestionBankParams,
  UpdateQuestionPayload,
} from '@/types/questionBank';
import type { AdminApiService } from '@/types/service';
import type { TokenUsageFilterRequest, TokenUsageStats } from '@/types/tokenUsage';
import { exportQuestionsToCSV, parseQuestionBankCSV } from '@/utils/csvParser';
import { validateQuestionBankCSV } from '@/utils/csvValidation';
import { API_MODE, type ApiMode, api } from '@aiprimary/api';
import type { ArtStyle, Model, ModelPatchData, SlideTemplate, SlideTheme } from '@aiprimary/core';
import { getAllSubjects, getElementaryGrades } from '@aiprimary/core';

import { generateId } from '@aiprimary/core';

// ============= HELPER FUNCTIONS =============
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));
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
      id: generateId(),
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

  async getQuestionBankChapters(subject: string, grade: string): Promise<ApiResponse<ChapterResponse[]>> {
    const response = await api.get<ApiResponse<ChapterResponse[]>>(`${this.baseUrl}/api/chapters`, {
      params: { subject, grade },
    });
    return response.data;
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

  // Contexts
  async getContexts(params?: ContextFilterParams): Promise<ApiResponse<Context[]>> {
    const queryParams: Record<string, any> = {
      bankType: 'public',
      page: (params?.page ?? 0) + 1, // Backend is 1-indexed
      pageSize: params?.pageSize || 10,
    };

    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.subject && params.subject.length > 0) {
      queryParams.subject = params.subject;
    }
    if (params?.grade && params.grade.length > 0) {
      queryParams.grade = params.grade;
    }
    if (params?.sortBy) {
      queryParams.sortBy = params.sortBy;
    }
    if (params?.sortDirection) {
      queryParams.sortDirection = params.sortDirection;
    }

    const response = await api.get<ApiResponse<Context[]>>(`${this.baseUrl}/api/contexts`, {
      params: queryParams,
    });
    return response.data;
  }

  async getContextById(id: string): Promise<ApiResponse<Context>> {
    const response = await api.get<ApiResponse<Context>>(`${this.baseUrl}/api/contexts/${id}`);
    return response.data;
  }

  async createContext(data: Omit<Context, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Context>> {
    const response = await api.post<ApiResponse<Context>>(`${this.baseUrl}/api/contexts`, data);
    return response.data;
  }

  async updateContext(id: string, data: Partial<Context>): Promise<ApiResponse<Context>> {
    const response = await api.put<ApiResponse<Context>>(`${this.baseUrl}/api/contexts/${id}`, data);
    return response.data;
  }

  async deleteContext(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/contexts/${id}`);
    return response.data;
  }

  // Coin Pricing
  async getCoinPricing(params?: CoinPricingQueryParams): Promise<ApiResponse<CoinPricing[]>> {
    const response = await api.get<ApiResponse<CoinPricing[]>>(`${this.baseUrl}/api/admin/coin-pricing`, {
      params,
    });
    return response.data;
  }

  async getCoinPricingById(id: string): Promise<ApiResponse<CoinPricing>> {
    const response = await api.get<ApiResponse<CoinPricing>>(`${this.baseUrl}/api/admin/coin-pricing/${id}`);
    return response.data;
  }

  async createCoinPricing(data: CoinPricingCreateRequest): Promise<ApiResponse<CoinPricing>> {
    const response = await api.post<ApiResponse<CoinPricing>>(`${this.baseUrl}/api/admin/coin-pricing`, data);
    return response.data;
  }

  async updateCoinPricing(id: string, data: CoinPricingUpdateRequest): Promise<ApiResponse<CoinPricing>> {
    const response = await api.put<ApiResponse<CoinPricing>>(
      `${this.baseUrl}/api/admin/coin-pricing/${id}`,
      data
    );
    return response.data;
  }

  async deleteCoinPricing(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/admin/coin-pricing/${id}`);
    return response.data;
  }

  async getResourceTypes(): Promise<ApiResponse<EnumOption[]>> {
    const response = await api.get<ApiResponse<EnumOption[]>>(
      `${this.baseUrl}/api/admin/coin-pricing/resource-types`
    );
    return response.data;
  }

  async getUnitTypes(): Promise<ApiResponse<EnumOption[]>> {
    const response = await api.get<ApiResponse<EnumOption[]>>(
      `${this.baseUrl}/api/admin/coin-pricing/unit-types`
    );
    return response.data;
  }

  // Matrix Templates
  async getMatrixTemplates(params?: MatrixTemplateParams): Promise<ApiResponse<MatrixTemplate[]>> {
    const response = await api.get<ApiResponse<MatrixTemplate[]>>(`${this.baseUrl}/api/matrix-templates`, {
      params,
    });
    return response.data;
  }

  async getMatrixTemplateById(id: string): Promise<ApiResponse<MatrixTemplate>> {
    const response = await api.get<ApiResponse<MatrixTemplate>>(`${this.baseUrl}/api/matrix-templates/${id}`);
    return response.data;
  }

  async createMatrixTemplate(data: Partial<MatrixTemplate>): Promise<ApiResponse<MatrixTemplate>> {
    const response = await api.post<ApiResponse<MatrixTemplate>>(
      `${this.baseUrl}/api/matrix-templates`,
      data
    );
    return response.data;
  }

  async updateMatrixTemplate(
    id: string,
    data: Partial<MatrixTemplate>
  ): Promise<ApiResponse<MatrixTemplate>> {
    const response = await api.put<ApiResponse<MatrixTemplate>>(
      `${this.baseUrl}/api/matrix-templates/${id}`,
      data
    );
    return response.data;
  }

  async deleteMatrixTemplate(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/matrix-templates/${id}`);
    return response.data;
  }

  // Token Usage
  async getTokenUsageStats(
    userId: string,
    filters?: TokenUsageFilterRequest
  ): Promise<ApiResponse<TokenUsageStats>> {
    const response = await api.get<ApiResponse<TokenUsageStats>>(
      `${this.baseUrl}/api/admin/token-usage/users/${userId}/stats`,
      {
        params: filters,
      }
    );
    return response.data;
  }

  async getTokenUsageByModel(userId: string): Promise<ApiResponse<TokenUsageStats[]>> {
    const response = await api.get<ApiResponse<TokenUsageStats[]>>(
      `${this.baseUrl}/api/admin/token-usage/users/${userId}/by-model`
    );
    return response.data;
  }

  async getTokenUsageByRequestType(userId: string): Promise<ApiResponse<TokenUsageStats[]>> {
    const response = await api.get<ApiResponse<TokenUsageStats[]>>(
      `${this.baseUrl}/api/admin/token-usage/users/${userId}/by-request-type`
    );
    return response.data;
  }
}
