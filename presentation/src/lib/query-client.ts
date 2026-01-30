import { VueQueryPlugin, QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query';

/**
 * Default options for TanStack Query
 */
const queryClientOptions = {
  defaultOptions: {
    queries: {
      // Queries are cached for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Data is considered fresh for 1 minute
      staleTime: 1000 * 60,
      // Retry failed queries 3 times with exponential backoff
      retry: 3,
      // Refetch on window focus for important data freshness
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
};

/**
 * Global query client instance
 */
export const queryClient = new QueryClient(queryClientOptions);

/**
 * Vue Query plugin options
 */
export const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClient,
  enableDevtoolsV6Plugin: true,
};

/**
 * Export the plugin for use in main.ts
 */
export { VueQueryPlugin };
