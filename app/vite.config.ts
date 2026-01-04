import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Configure URLs with production fallbacks
  const apiUrl =
    env.NODE_ENV === 'production'
      ? 'https://api.huy-devops.site'
      : env.VITE_API_URL || 'http://localhost:3000';

  const presentationUrl =
    env.NODE_ENV === 'production'
      ? 'https://presentation.huy-devops.site'
      : env.VITE_PRESENTATION_URL || 'http://localhost:5174';

  return {
    server: {
      allowedHosts: ['nitro15.tail5769d8.ts.net'],
      host: '100.66.47.29',
      port: 80,
    },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'host',
        remotes: {
          vueRemote: {
            type: 'module',
            name: 'vueRemote',
            entry: `${presentationUrl}/remoteEntry.js`,
            entryGlobalName: 'vueRemote',
            shareScope: 'default',
          },
        },
        exposes: {},
        filename: 'remoteEntry.js',
        shared: {
          react: {
            requiredVersion: dependencies.react,
            singleton: true,
          },
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        treeshake: false,
      },
    },
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, './src/shared/components'),
        '@/utils': path.resolve(__dirname, './src/shared/lib/utils'),
        '@/hooks': path.resolve(__dirname, './src/shared/hooks'),
        '@/types': path.resolve(__dirname, './src/shared/types'),
        '@/assets': path.resolve(__dirname, './src/shared/assets'),
        '@/services': path.resolve(__dirname, './src/shared/services'),
        '@/context': path.resolve(__dirname, './src/shared/context'),
        '@': path.resolve(__dirname, './src'),
        '@ui': path.resolve(__dirname, './src/shared/components/ui'),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        supported: {
          'top-level-await': true,
        },
      },
    },
    preview: {
      allowedHosts: ['*'],
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
