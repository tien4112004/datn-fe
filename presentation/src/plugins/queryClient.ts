import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import type { App } from 'vue';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
    },
  },
});

export default {
  install(app: App) {
    app.use(VueQueryPlugin, { queryClient });
  },
};
