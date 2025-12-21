import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Use a placeholder URL for build time - actual URL is loaded at runtime
  const presentationUrl =
    env.NODE_ENV === 'production'
      ? 'https://presentation.huy-devops.site' // replace with actual production URL
      : process.env.PRESENTATION_URL || env.PRESENTATION_URL || 'http://localhost:5174'; // fallback for local development

  return {
    base: mode === 'production' ? './' : '/',
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
        output: {
          // manualChunks: {
          //   'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          //   'ui-vendor': [
          //     '@radix-ui/react-dialog',
          //     '@radix-ui/react-dropdown-menu',
          //     '@radix-ui/react-select',
          //     '@radix-ui/react-popover',
          //     '@radix-ui/react-tabs',
          //     '@radix-ui/react-tooltip',
          //     '@radix-ui/react-alert-dialog',
          //     '@radix-ui/react-label',
          //     '@radix-ui/react-switch',
          //     '@radix-ui/react-checkbox',
          //     '@radix-ui/react-slider',
          //     '@radix-ui/react-toggle',
          //     '@radix-ui/react-toggle-group',
          //     '@radix-ui/react-progress',
          //     '@radix-ui/react-radio-group',
          //     '@radix-ui/react-collapsible',
          //     '@radix-ui/react-context-menu',
          //     '@radix-ui/react-slot',
          //     '@radix-ui/react-separator',
          //     '@radix-ui/react-scroll-area',
          //     '@radix-ui/react-avatar',
          //   ],
          //   'query-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          //   'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          //   'antd-vendor': ['antd'],
          //   'chart-vendor': ['recharts'],
          //   'editor-vendor': ['@blocknote/core', '@blocknote/react', '@blocknote/mantine'],
          //   'flow-vendor': ['@xyflow/react'],
          //   'utils-vendor': ['lodash', 'date-fns', 'clsx', 'class-variance-authority'],
          //   'i18n-vendor': ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
          // },
        },
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
