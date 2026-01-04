import { getAdminApiService } from '@/api/admin';
import { getAuthApiService } from '@/api/auth';
import type { ArtStyleRequest, BookType, FAQPost, PaginationParams, SlideTemplateParams } from '@/types/api';
import type { ModelPatchData } from '@aiprimary/core';
import type { LoginRequest } from '@/types/auth';
import type { SlideTemplate, SlideTheme } from '@aiprimary/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Query key factory for admin API
 * Provides a hierarchical structure for cache management
 */
export const authKeys = {
  profile: ['auth', 'profile'] as const,
};

export const adminKeys = {
  // Users
  users: {
    all: ['users'] as const,
    list: (params?: PaginationParams) => [...adminKeys.users.all, 'list', params] as const,
    detail: (id: string) => [...adminKeys.users.all, 'detail', id] as const,
  },
  // Slide Themes
  themes: {
    all: ['slide-themes'] as const,
    list: (params?: PaginationParams) => [...adminKeys.themes.all, 'list', params] as const,
  },
  // Slide Templates
  templates: {
    all: ['slide-templates'] as const,
    list: (params?: PaginationParams) => [...adminKeys.templates.all, 'list', params] as const,
  },
  // Art Styles
  artStyles: {
    all: ['art-styles'] as const,
    list: (params?: PaginationParams) => [...adminKeys.artStyles.all, 'list', params] as const,
  },
  // Models
  models: {
    all: ['models'] as const,
    list: (type?: string | null) => [...adminKeys.models.all, 'list', type] as const,
  },
  // FAQ Posts
  faq: {
    all: ['faq-posts'] as const,
    list: (params?: PaginationParams) => [...adminKeys.faq.all, 'list', params] as const,
  },
  // Books
  books: {
    all: ['books'] as const,
    list: (params?: PaginationParams & { type?: BookType }) =>
      [...adminKeys.books.all, 'list', params] as const,
    detail: (id: string) => [...adminKeys.books.all, 'detail', id] as const,
  },
};

// ============= AUTH =============

/**
 * Hook to get current user profile
 * Used to check authentication status and get user data
 */
export function useProfile(enabled: boolean = true) {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => getAuthApiService().getProfile(),
    enabled,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: false, // Don't retry on 401
  });
}

/**
 * Hook to handle user login
 * Stores tokens in localStorage on success
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => getAuthApiService().login(credentials),
    onSuccess: (response) => {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);

      // Invalidate profile to trigger refetch
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
    onError: (error) => {
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Invalid credentials',
      });
    },
  });
}

/**
 * Hook to handle user logout
 * Clears tokens and profile cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => getAuthApiService().logout(),
    onSuccess: () => {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');

      // Clear all cached data
      queryClient.clear();

      toast.success('Logged out successfully');
    },
    onError: (error) => {
      // Still clear local data even if server call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');
      queryClient.clear();

      console.error('Logout error:', error);
    },
  });
}

/**
 * Hook to refresh access token
 * Used when access token expires
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: (refreshToken: string) => getAuthApiService().refreshToken(refreshToken),
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
    },
    onError: () => {
      // Clear tokens if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('admin_user');
    },
  });
}

// ============= USERS =============

export function useUsers(params?: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.users.list(params),
    queryFn: () => getAdminApiService().getUsers(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: adminKeys.users.detail(id),
    queryFn: () => getAdminApiService().getUserById(id),
    enabled: !!id,
    staleTime: 300000,
    gcTime: 600000,
  });
}

// ============= SLIDE THEMES =============

export function useSlideThemes(params?: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.themes.list(params),
    queryFn: () => getAdminApiService().getSlideThemes(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateSlideTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SlideTheme) => getAdminApiService().createSlideTheme(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.themes.all });
      toast.success('Theme created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create theme', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateSlideTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideTheme }) =>
      getAdminApiService().updateSlideTheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.themes.all });
      toast.success('Theme updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update theme', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

// ============= SLIDE TEMPLATES =============

export function useSlideTemplates(params?: SlideTemplateParams) {
  return useQuery({
    queryKey: adminKeys.templates.list(params),
    queryFn: () => getAdminApiService().getSlideTemplates(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateSlideTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SlideTemplate) => getAdminApiService().createSlideTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.templates.all });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create template', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateSlideTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SlideTemplate }) =>
      getAdminApiService().updateSlideTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.templates.all });
      toast.success('Template updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update template', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useDeleteSlideTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().deleteSlideTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.templates.all });
      toast.success('Template deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete template', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

// ============= ART STYLES =============

export function useArtStyles(params?: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.artStyles.list(params),
    queryFn: () => getAdminApiService().getArtStyles(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateArtStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ArtStyleRequest) => getAdminApiService().createArtStyle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.artStyles.all });
      toast.success('Art style created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create art style', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateArtStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArtStyleRequest }) =>
      getAdminApiService().updateArtStyle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.artStyles.all });
      toast.success('Art style updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update art style', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

// ============= MODELS =============

export function useModels(type?: string | null) {
  return useQuery({
    queryKey: adminKeys.models.list(type),
    queryFn: () => getAdminApiService().getModels(type),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function usePatchModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModelPatchData }) =>
      getAdminApiService().patchModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.models.all });
      toast.success('Model updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update model', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

// ============= FAQ POSTS =============

export function useFAQPosts(params?: PaginationParams) {
  return useQuery({
    queryKey: adminKeys.faq.list(params),
    queryFn: () => getAdminApiService().getFAQPosts(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useCreateFAQPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FAQPost) => getAdminApiService().createFAQPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.faq.all });
      toast.success('FAQ post created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create FAQ post', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateFAQPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FAQPost }) => getAdminApiService().updateFAQPost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.faq.all });
      toast.success('FAQ post updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update FAQ post', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useDeleteFAQPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().deleteFAQPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.faq.all });
      toast.success('FAQ post deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete FAQ post', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

// ============= BOOKS =============

export function useBooks(params?: PaginationParams & { type?: BookType }) {
  return useQuery({
    queryKey: adminKeys.books.list(params),
    queryFn: () => getAdminApiService().getBooks(params),
    staleTime: 30000,
    gcTime: 300000,
  });
}

export function useBookById(id: string) {
  return useQuery({
    queryKey: adminKeys.books.detail(id),
    queryFn: () => getAdminApiService().getBookById(id),
    enabled: !!id,
    staleTime: 300000,
    gcTime: 600000,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => getAdminApiService().createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.books.all });
      toast.success('Book created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create book', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => getAdminApiService().updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.books.all });
      toast.success('Book updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update book', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => getAdminApiService().deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.books.all });
      toast.success('Book deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete book', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    },
  });
}
