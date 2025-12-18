import { API_MODE, type ApiMode, api } from '@aiprimary/api';
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

export default class AdminRealApiService implements AdminApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  // Users
  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
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
      params,
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
  async getSlideTemplates(params?: PaginationParams): Promise<ApiResponse<SlideTemplate[]>> {
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

  // Art Styles
  async getArtStyles(params?: PaginationParams): Promise<ApiResponse<ArtStyle[]>> {
    const response = await api.get<ApiResponse<ArtStyle[]>>(`${this.baseUrl}/api/art-styles`, {
      params,
    });
    return response.data;
  }

  async createArtStyle(data: ArtStyle): Promise<ApiResponse<ArtStyle>> {
    const response = await api.post<ApiResponse<ArtStyle>>(`${this.baseUrl}/api/art-styles`, data);
    return response.data;
  }

  async updateArtStyle(id: string, data: ArtStyle): Promise<ApiResponse<ArtStyle>> {
    const response = await api.put<ApiResponse<ArtStyle>>(`${this.baseUrl}/api/art-styles/${id}`, data);
    return response.data;
  }

  // AI Models
  async getModels(type?: string | null): Promise<ApiResponse<Model[]>> {
    const params = type ? { type } : undefined;
    const response = await api.get<ApiResponse<Model[]>>(`${this.baseUrl}/model`, { params });
    return response.data;
  }

  async patchModel(id: string, data: ModelPatchData): Promise<ApiResponse<Model>> {
    const response = await api.patch<ApiResponse<Model>>(`${this.baseUrl}/model/${id}`, data);
    return response.data;
  }

  // FAQ Posts
  async getFAQPosts(params?: PaginationParams): Promise<ApiResponse<FAQPost[]>> {
    const response = await api.get<ApiResponse<FAQPost[]>>(`${this.baseUrl}/api/faq`, { params });
    return response.data;
  }

  async createFAQPost(data: FAQPost): Promise<ApiResponse<FAQPost>> {
    const response = await api.post<ApiResponse<FAQPost>>(`${this.baseUrl}/api/faq`, data);
    return response.data;
  }

  async updateFAQPost(id: string, data: FAQPost): Promise<ApiResponse<FAQPost>> {
    const response = await api.put<ApiResponse<FAQPost>>(`${this.baseUrl}/api/faq/${id}`, data);
    return response.data;
  }

  async deleteFAQPost(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/faq/${id}`);
    return response.data;
  }

  // Books
  async getBooks(params?: PaginationParams & { type?: BookType }): Promise<ApiResponse<Book[]>> {
    const response = await api.get<ApiResponse<Book[]>>(`${this.baseUrl}/api/books`, { params });
    return response.data;
  }

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    const response = await api.get<ApiResponse<Book>>(`${this.baseUrl}/api/books/${id}`);
    return response.data;
  }

  async createBook(data: FormData): Promise<ApiResponse<Book>> {
    const response = await api.post<ApiResponse<Book>>(`${this.baseUrl}/api/books`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updateBook(id: string, data: FormData): Promise<ApiResponse<Book>> {
    const response = await api.put<ApiResponse<Book>>(`${this.baseUrl}/api/books/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteBook(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`${this.baseUrl}/api/books/${id}`);
    return response.data;
  }
}
