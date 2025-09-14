import { createApp } from 'vue';
import { createPinia } from 'pinia';
import icon from './plugins/icon';
import directive from './plugins/directive/index';
import App from './App.vue';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/scope.scss';
import '@/assets/styles/tailwind.css';
import i18n from '@/locales';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(App, props);

  const pinia = createPinia();
  app.use(pinia);
  app.use(i18n);
  icon.install(app);
  directive.install(app);
  app.mount(el);

  return app;
}
