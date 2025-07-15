import { createApp } from 'vue';
import { createPinia } from 'pinia';
import icon from './plugins/icon.ts';
import directive from './plugins/directive/index.ts';
import App from './App.vue';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/scope.scss';
import i18n from '@/locales';

export function mount(el) {
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  icon.install(app);
  directive.install(app);
  app.mount(el);
  app.use(i18n);

  return app;
}
