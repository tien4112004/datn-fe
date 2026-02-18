import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';
import path from 'path';

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
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'admin',
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
    server: {
      port: 5175,
    },
    preview: {
      port: 5175,
    },
    resolve: {
      alias: {
        '@ui': path.resolve(__dirname, '../packages/ui/src'),
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/api': path.resolve(__dirname, './src/api'),
        '@/context': path.resolve(__dirname, './src/context'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/features': path.resolve(__dirname, './src/features'),
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
