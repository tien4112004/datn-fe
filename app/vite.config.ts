import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  // Configure URLs with production fallbacks
  const apiUrl = process.env.VITE_API_URL;
  const presentationUrl = process.env.VITE_PRESENTATION_URL;

  return {
    server: {
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
        '@aiprimary/core': path.resolve(__dirname, '../packages/core/src'),
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
      'import.meta.env.VITE_PRESENTATION_URL': JSON.stringify(process.env.VITE_PRESENTATION_URL),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
        process.env.VITE_FIREBASE_STORAGE_BUCKET
      ),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      ),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_VAPID_KEY': JSON.stringify(process.env.VITE_FIREBASE_VAPID_KEY),
    },
  };
});
