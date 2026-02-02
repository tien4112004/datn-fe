// Polyfill for crypto.randomUUID (not available in Android WebView)
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function () {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
    );
  };
}

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@/router';
import i18n from '@/locales';
import { initializeFonts } from '@/utils/font';
import { templateRegistry } from '@/utils/slideLayout/converters/templateRegistry';
import { VueQueryPlugin, vueQueryPluginOptions } from '@/lib/query-client';

import 'prosemirror-view/style/prosemirror.css';
import 'animate.css';
import '@/assets/styles/tailwind.css';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/global.scss';
import '@/assets/styles/font.scss';

import Icon from '@/plugins/icon';
import Directive from '@/plugins/directive';

const app = createApp(App);
app.use(Icon);
app.use(Directive);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.mount('#app');

// Initialize Google Fonts for fallback fonts
initializeFonts();

// Prefetch all slide templates from API on app initialization
templateRegistry.prefetchAll();
