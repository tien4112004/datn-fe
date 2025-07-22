import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dependencies } from './package.json';
import { federation } from '@module-federation/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { env } from 'process';

// https://vite.dev/config/
export default defineConfig(() => {
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
            entry: `${env.PRESENTATION_URL}/remoteEntry.js`,
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
    resolve: {
      alias: {
        '@/components': path.resolve(__dirname, './src/shared/components'),
        '@': path.resolve(__dirname, './src'),
        '@ui': path.resolve(__dirname, './src/shared/components/ui'),
      },
    },
  };
});
