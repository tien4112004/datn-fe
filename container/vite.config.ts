import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'host',
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
  };
});
