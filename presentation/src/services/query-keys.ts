/**
 * Centralized query key factory for TanStack Query
 * This ensures consistent and type-safe query keys across the application
 */

export const queryKeys = {
  // Template keys
  templates: {
    all: ['templates'] as const,
    lists: () => [...queryKeys.templates.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.templates.lists(), filters] as const,
    byLayout: (layout: string) => [...queryKeys.templates.all, 'layout', layout] as const,
  },

  // Presentation keys
  presentations: {
    all: ['presentations'] as const,
    lists: () => [...queryKeys.presentations.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.presentations.lists(), filters] as const,
    details: () => [...queryKeys.presentations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.presentations.details(), id] as const,
    aiResult: (id: string) => [...queryKeys.presentations.all, 'ai-result', id] as const,
    sharedUsers: (id: string) => [...queryKeys.presentations.all, 'shared-users', id] as const,
    publicAccess: (id: string) => [...queryKeys.presentations.all, 'public-access', id] as const,
    shareState: (id: string) => [...queryKeys.presentations.all, 'share-state', id] as const,
  },

  // Slide theme keys
  slideThemes: {
    all: ['slide-themes'] as const,
    lists: () => [...queryKeys.slideThemes.all, 'list'] as const,
    list: (params?: { page?: number; limit?: number }) => [...queryKeys.slideThemes.lists(), params] as const,
  },

  // Image keys
  images: {
    all: ['images'] as const,
    my: (page?: number, pageSize?: number, sort?: string) =>
      [...queryKeys.images.all, 'my', { page, pageSize, sort }] as const,
    search: (payload: any) => [...queryKeys.images.all, 'search', payload] as const,
  },

  // User search keys
  users: {
    all: ['users'] as const,
    search: (query: string) => [...queryKeys.users.all, 'search', query] as const,
  },
} as const;
