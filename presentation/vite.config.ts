import { fileURLToPath, URL } from 'node:url';
import { federation } from '@module-federation/vite';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import Icons from 'unplugin-icons/dist/vite.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = env.PORT ? parseInt(env.PORT, 10) : 5174;
  return {
    base: process.env.VITE_BASE_URL || env.VITE_BASE_URL || 'http://localhost:5174/',
    plugins: [
      vue(),
      federation({
        name: 'vueRemote',
        manifest: true,
        filename: 'remoteEntry.js',
        exposes: {
          './Editor': './src/mount.ts',
          './ThumbnailDemo': './src/components/ThumbnailDemo.vue',
        },
      }),
      Icons({ compiler: 'vue3' }),
    ],

    server: {
      fs: {
        allow: ['.', '../shared'],
      },
      port: port,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },

    preview: {
      port: port,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: `
            @use '@/assets/styles/variable.scss' as *;
            @use '@/assets/styles/mixin.scss' as *;
          `,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: path.resolve(__dirname, './node_modules/vue/dist/vue.runtime.esm-bundler.js'),
        pinia: path.resolve(__dirname, './node_modules/pinia/dist/pinia.mjs'),
        shared: path.resolve(__dirname, '../shared/shared'),
      },
    },
    build: {
      target: 'esnext',
      minify: false,
    },
  };
});
