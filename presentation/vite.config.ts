import { fileURLToPath, URL } from 'node:url';
import { federation } from '@module-federation/vite';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import Icons from 'unplugin-icons/dist/vite.js';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...env, ...process.env };
  const port = env.PORT ? parseInt(env.PORT, 10) : 5174;

  const apiUrl = process.env.VITE_API_URL;
  const presentationUrl = process.env.VITE_PRESENTATION_URL || `http://localhost:${port}/`;

  return {
    base: presentationUrl,
    plugins: [
      vue(),
      federation({
        name: 'vueRemote',
        filename: 'remoteEntry.js',
        exposes: {
          './Editor': './src/mount/appMount.ts',
          './ThumbnailSlide': './src/mount/thumbnailMount.ts',
          './method': './src/mount/methodMount.ts',
        },
        shared: {
          vue: {
            singleton: true,
          },
        },
      }),
      Icons({ compiler: 'vue3' }),
    ],

    server: {
      allowedHosts: ['nitro15.tail5769d8.ts.net'],
      fs: {
        allow: ['.', '../shared'],
      },
      port: port,
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
      port: port,
      allowedHosts: ['*'],
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
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData: `
            @use '@/assets/styles/mixin.scss' as *;
          `,
        },
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer],
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
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_PRESENTATION_URL': JSON.stringify(presentationUrl),
    },
  };
});
