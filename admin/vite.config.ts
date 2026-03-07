import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...env, ...process.env };

  const apiUrl = process.env.VITE_API_URL;
  const presentationUrl = process.env.VITE_PRESENTATION_URL || 'http://localhost:5174';

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
      allowedHosts: ['nitro15.tail5769d8.ts.net'],
      cors: {
        origin: '*',
        credentials: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
    },
    preview: {
      port: 5175,
      allowedHosts: ['*'],
    },
    resolve: {
      alias: {
        '@aiprimary/question': path.resolve(__dirname, '../packages/question/src'),
        '@question': path.resolve(__dirname, '../packages/question/src'),
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
      'import.meta.env.VITE_PRESENTATION_URL': JSON.stringify(presentationUrl),
    },
  };
});
