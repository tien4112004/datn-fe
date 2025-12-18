import { API_MODE, type ApiMode } from '@aiprimary/api';
import type { AdminApiService } from '@/types/service';
import type { User } from '@/types/auth';
import type {
  ApiResponse,
  PaginationParams,
  SlideTheme,
  SlideTemplate,
  ArtStyle,
  Model,
  ModelPatchData,
  FAQPost,
  Book,
  BookType,
} from '@/types/api';
import {
  MOCK_USERS,
  MOCK_SLIDE_THEMES,
  MOCK_SLIDE_TEMPLATES,
  MOCK_ART_STYLES,
  MOCK_MODELS,
  MOCK_FAQ_POSTS,
  MOCK_BOOKS,
  delay,
  paginate,
  generateId,
} from '../mock-data';

// In-memory storage for mock mutations (stateful for demo purposes)
let mockUsers = [...MOCK_USERS];
let mockSlideThemes = [...MOCK_SLIDE_THEMES];
let mockSlideTemplates = [...MOCK_SLIDE_TEMPLATES];
let mockArtStyles = [...MOCK_ART_STYLES];
let mockModels = [...MOCK_MODELS];
let mockFAQPosts = [...MOCK_FAQ_POSTS];
let mockBooks = [...MOCK_BOOKS];

export default class AdminMockService implements AdminApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  // Users
  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    await delay();
    const { data, pagination } = paginate(mockUsers, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    await delay();
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return { success: true, data: user };
  }

  // Slide Themes
  async getSlideThemes(params?: PaginationParams): Promise<ApiResponse<SlideTheme[]>> {
    await delay();
    const { data, pagination } = paginate(mockSlideThemes, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async createSlideTheme(data: SlideTheme): Promise<ApiResponse<SlideTheme>> {
    await delay(500);
    const newTheme: SlideTheme = {
      ...data,
      id: generateId('theme'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSlideThemes.unshift(newTheme);
    return { success: true, data: newTheme };
  }

  async updateSlideTheme(id: string, data: SlideTheme): Promise<ApiResponse<SlideTheme>> {
    await delay(500);
    const index = mockSlideThemes.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Theme not found');
    const updated: SlideTheme = { ...data, id, updatedAt: new Date().toISOString() };
    mockSlideThemes[index] = updated;
    return { success: true, data: updated };
  }

  // Slide Templates
  async getSlideTemplates(params?: PaginationParams): Promise<ApiResponse<SlideTemplate[]>> {
    await delay();
    const { data, pagination } = paginate(mockSlideTemplates, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async createSlideTemplate(data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> {
    await delay(500);
    const newTemplate: SlideTemplate = {
      ...data,
      id: generateId('template'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSlideTemplates.unshift(newTemplate);
    return { success: true, data: newTemplate };
  }

  async updateSlideTemplate(id: string, data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> {
    await delay(500);
    const index = mockSlideTemplates.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Template not found');
    const updated: SlideTemplate = { ...data, id, updatedAt: new Date().toISOString() };
    mockSlideTemplates[index] = updated;
    return { success: true, data: updated };
  }

  // Art Styles
  async getArtStyles(params?: PaginationParams): Promise<ApiResponse<ArtStyle[]>> {
    await delay();
    const { data, pagination } = paginate(mockArtStyles, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async createArtStyle(data: ArtStyle): Promise<ApiResponse<ArtStyle>> {
    await delay(500);
    const newStyle: ArtStyle = {
      ...data,
      id: data.id || generateId('art-style'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockArtStyles.unshift(newStyle);
    return { success: true, data: newStyle };
  }

  async updateArtStyle(id: string, data: ArtStyle): Promise<ApiResponse<ArtStyle>> {
    await delay(500);
    const index = mockArtStyles.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Art style not found');
    const updated: ArtStyle = { ...data, id, updatedAt: new Date().toISOString() };
    mockArtStyles[index] = updated;
    return { success: true, data: updated };
  }

  // AI Models
  async getModels(type?: string | null): Promise<ApiResponse<Model[]>> {
    await delay();
    let filtered = mockModels;
    if (type) {
      filtered = mockModels.filter((m) => m.type === type);
    }
    return { success: true, data: filtered };
  }

  async patchModel(id: string, data: ModelPatchData): Promise<ApiResponse<Model>> {
    await delay(500);
    const index = mockModels.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Model not found');

    // If setting as default, unset other defaults of same type
    if (data.default) {
      const modelType = mockModels[index].type;
      mockModels.forEach((m, i) => {
        if (m.type === modelType && i !== index) {
          mockModels[i] = { ...m, default: false };
        }
      });
    }

    const updated: Model = { ...mockModels[index], ...data };
    mockModels[index] = updated;
    return { success: true, data: updated };
  }

  // FAQ Posts
  async getFAQPosts(params?: PaginationParams): Promise<ApiResponse<FAQPost[]>> {
    await delay();
    const { data, pagination } = paginate(mockFAQPosts, params?.page, params?.pageSize);
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
    mockFAQPosts.unshift(newPost);
    return { success: true, data: newPost };
  }

  async updateFAQPost(id: string, data: FAQPost): Promise<ApiResponse<FAQPost>> {
    await delay(500);
    const index = mockFAQPosts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('FAQ post not found');
    const updated: FAQPost = { ...data, id, updatedAt: new Date().toISOString() };
    mockFAQPosts[index] = updated;
    return { success: true, data: updated };
  }

  async deleteFAQPost(id: string): Promise<ApiResponse<void>> {
    await delay(500);
    const index = mockFAQPosts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('FAQ post not found');
    mockFAQPosts.splice(index, 1);
    return { success: true, data: undefined };
  }

  // Books
  async getBooks(params?: PaginationParams & { type?: BookType }): Promise<ApiResponse<Book[]>> {
    await delay();
    let filtered = mockBooks;
    if (params?.type) {
      filtered = mockBooks.filter((b) => b.type === params.type);
    }
    const { data, pagination } = paginate(filtered, params?.page, params?.pageSize);
    return { success: true, data, pagination };
  }

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    await delay();
    const book = mockBooks.find((b) => b.id === id);
    if (!book) throw new Error('Book not found');
    return { success: true, data: book };
  }

  async createBook(data: FormData): Promise<ApiResponse<Book>> {
    await delay(500);
    const newBook: Book = {
      id: generateId('book'),
      title: data.get('title') as string,
      description: data.get('description') as string,
      type: data.get('type') as BookType,
      grade: data.get('grade') as string,
      subject: data.get('subject') as string,
      publisher: data.get('publisher') as string,
      pdfUrl: '/uploads/books/mock-book.pdf',
      thumbnailUrl: '/uploads/thumbnails/mock-thumbnail.jpg',
      isPublished: data.get('isPublished') === 'true',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBooks.unshift(newBook);
    return { success: true, data: newBook };
  }

  async updateBook(id: string, data: FormData): Promise<ApiResponse<Book>> {
    await delay(500);
    const index = mockBooks.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');
    const updated: Book = {
      ...mockBooks[index],
      title: (data.get('title') as string) || mockBooks[index].title,
      description: (data.get('description') as string) || mockBooks[index].description,
      type: (data.get('type') as BookType) || mockBooks[index].type,
      grade: (data.get('grade') as string) || mockBooks[index].grade,
      subject: (data.get('subject') as string) || mockBooks[index].subject,
      publisher: (data.get('publisher') as string) || mockBooks[index].publisher,
      isPublished: data.has('isPublished')
        ? data.get('isPublished') === 'true'
        : mockBooks[index].isPublished,
      updatedAt: new Date().toISOString(),
    };
    mockBooks[index] = updated;
    return { success: true, data: updated };
  }

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    await delay(500);
    const index = mockBooks.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');
    mockBooks.splice(index, 1);
    return { success: true, data: undefined };
  }
}
