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
