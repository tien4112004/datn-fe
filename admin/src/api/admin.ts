import api from './client';
import type { User } from '@/types/auth';
import type {
  ApiResponse,
  PaginationParams,
  SlideTheme,
  SlideTemplate,
  Model,
  ModelPatchData,
  FAQPost,
  Book,
  BookType,
} from '@/types/api';
import { getApiMode } from '@aiprimary/api';
import {
  MOCK_USERS,
  MOCK_SLIDE_THEMES,
  MOCK_SLIDE_TEMPLATES,
  MOCK_MODELS,
  MOCK_FAQ_POSTS,
  MOCK_BOOKS,
  delay,
  paginate,
  generateId,
} from './mock-data';

// In-memory storage for mock mutations
let mockUsers = [...MOCK_USERS];
let mockSlideThemes = [...MOCK_SLIDE_THEMES];
let mockSlideTemplates = [...MOCK_SLIDE_TEMPLATES];
let mockModels = [...MOCK_MODELS];
let mockFAQPosts = [...MOCK_FAQ_POSTS];
let mockBooks = [...MOCK_BOOKS];

export const adminApi = {
  // Users
  getUsers: async (params?: PaginationParams): Promise<ApiResponse<User[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const { data, pagination } = paginate(mockUsers, params?.page, params?.pageSize);
      return { success: true, data, pagination };
    }
    const response = await api.get<ApiResponse<User[]>>('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const user = mockUsers.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      return { success: true, data: user };
    }
    const response = await api.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data;
  },

  // Slide Themes
  getSlideThemes: async (params?: PaginationParams): Promise<ApiResponse<SlideTheme[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const { data, pagination } = paginate(mockSlideThemes, params?.page, params?.pageSize);
      return { success: true, data, pagination };
    }
    const response = await api.get<ApiResponse<SlideTheme[]>>('/admin/slide/theme', { params });
    return response.data;
  },

  createSlideTheme: async (data: SlideTheme): Promise<ApiResponse<SlideTheme>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.post<ApiResponse<SlideTheme>>('/admin/slide/theme', data);
    return response.data;
  },

  updateSlideTheme: async (id: string, data: SlideTheme): Promise<ApiResponse<SlideTheme>> => {
    if (getApiMode() === 'mock') {
      await delay(500);
      const index = mockSlideThemes.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Theme not found');
      const updated: SlideTheme = { ...data, id, updatedAt: new Date().toISOString() };
      mockSlideThemes[index] = updated;
      return { success: true, data: updated };
    }
    const response = await api.put<ApiResponse<SlideTheme>>(`/admin/slide/theme/${id}`, data);
    return response.data;
  },

  // Slide Templates/Layouts
  getSlideTemplates: async (params?: PaginationParams): Promise<ApiResponse<SlideTemplate[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const { data, pagination } = paginate(mockSlideTemplates, params?.page, params?.pageSize);
      return { success: true, data, pagination };
    }
    const response = await api.get<ApiResponse<SlideTemplate[]>>('/admin/slide/layout', { params });
    return response.data;
  },

  createSlideTemplate: async (data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.post<ApiResponse<SlideTemplate>>('/admin/slide/layout', data);
    return response.data;
  },

  updateSlideTemplate: async (id: string, data: SlideTemplate): Promise<ApiResponse<SlideTemplate>> => {
    if (getApiMode() === 'mock') {
      await delay(500);
      const index = mockSlideTemplates.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Template not found');
      const updated: SlideTemplate = { ...data, id, updatedAt: new Date().toISOString() };
      mockSlideTemplates[index] = updated;
      return { success: true, data: updated };
    }
    const response = await api.put<ApiResponse<SlideTemplate>>(`/admin/slide/layout/${id}`, data);
    return response.data;
  },

  // AI Models
  getModels: async (type?: string | null): Promise<ApiResponse<Model[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      let filtered = mockModels;
      if (type) {
        filtered = mockModels.filter((m) => m.type === type);
      }
      return { success: true, data: filtered };
    }
    const params = type ? { type } : undefined;
    const response = await api.get<ApiResponse<Model[]>>('/model', { params });
    return response.data;
  },

  patchModel: async (id: string, data: ModelPatchData): Promise<ApiResponse<Model>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.patch<ApiResponse<Model>>(`/model/${id}`, data);
    return response.data;
  },

  // FAQ Posts
  getFAQPosts: async (params?: PaginationParams): Promise<ApiResponse<FAQPost[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const { data, pagination } = paginate(mockFAQPosts, params?.page, params?.pageSize);
      return { success: true, data, pagination };
    }
    const response = await api.get<ApiResponse<FAQPost[]>>('/admin/faq', { params });
    return response.data;
  },

  createFAQPost: async (data: FAQPost): Promise<ApiResponse<FAQPost>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.post<ApiResponse<FAQPost>>('/admin/faq', data);
    return response.data;
  },

  updateFAQPost: async (id: string, data: FAQPost): Promise<ApiResponse<FAQPost>> => {
    if (getApiMode() === 'mock') {
      await delay(500);
      const index = mockFAQPosts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('FAQ post not found');
      const updated: FAQPost = { ...data, id, updatedAt: new Date().toISOString() };
      mockFAQPosts[index] = updated;
      return { success: true, data: updated };
    }
    const response = await api.put<ApiResponse<FAQPost>>(`/admin/faq/${id}`, data);
    return response.data;
  },

  deleteFAQPost: async (id: string): Promise<ApiResponse<void>> => {
    if (getApiMode() === 'mock') {
      await delay(500);
      const index = mockFAQPosts.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('FAQ post not found');
      mockFAQPosts.splice(index, 1);
      return { success: true, data: undefined };
    }
    const response = await api.delete<ApiResponse<void>>(`/admin/faq/${id}`);
    return response.data;
  },

  // Books (Textbooks & Teacher Books)
  getBooks: async (params?: PaginationParams & { type?: BookType }): Promise<ApiResponse<Book[]>> => {
    if (getApiMode() === 'mock') {
      await delay();
      let filtered = mockBooks;
      if (params?.type) {
        filtered = mockBooks.filter((b) => b.type === params.type);
      }
      const { data, pagination } = paginate(filtered, params?.page, params?.pageSize);
      return { success: true, data, pagination };
    }
    const response = await api.get<ApiResponse<Book[]>>('/admin/books', { params });
    return response.data;
  },

  getBookById: async (id: string): Promise<ApiResponse<Book>> => {
    if (getApiMode() === 'mock') {
      await delay();
      const book = mockBooks.find((b) => b.id === id);
      if (!book) throw new Error('Book not found');
      return { success: true, data: book };
    }
    const response = await api.get<ApiResponse<Book>>(`/admin/books/${id}`);
    return response.data;
  },

  createBook: async (data: FormData): Promise<ApiResponse<Book>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.post<ApiResponse<Book>>('/admin/books', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBook: async (id: string, data: FormData): Promise<ApiResponse<Book>> => {
    if (getApiMode() === 'mock') {
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
    const response = await api.put<ApiResponse<Book>>(`/admin/books/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBook: async (id: string): Promise<ApiResponse<void>> => {
    if (getApiMode() === 'mock') {
      await delay(500);
      const index = mockBooks.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Book not found');
      mockBooks.splice(index, 1);
      return { success: true, data: undefined };
    }
    const response = await api.delete<ApiResponse<void>>(`/admin/books/${id}`);
    return response.data;
  },
};
