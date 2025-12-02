import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { dependencies } from './package.json';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
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
            entry: `${process.env.PRESENTATION_URL || env.PRESENTATION_URL}/remoteEntry.js`,
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
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:8081'),
    },
  };
});
