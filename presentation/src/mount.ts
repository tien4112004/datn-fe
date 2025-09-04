import { createApp } from 'vue';
import { createPinia } from 'pinia';
import icon from './plugins/icon';
import directive from './plugins/directive/index';
import router from './router';
import App from './App.vue';
import ThumbnailDemo from './components/ThumbnailDemo.vue';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/scope.scss';
import i18n from '@/locales';

export function mount(el: string | Element, props: Record<string, unknown>) {
  const app = createApp(App, props);

  const pinia = createPinia();
  app.use(pinia);
  app.use(router);
  app.use(i18n);
  icon.install(app);
  directive.install(app);
  app.mount(el);

  return app;
}

export function mountThumbnailDemo(el: string | Element, props: Record<string, unknown> = {}) {
  const app = createApp(ThumbnailDemo, props);

  const pinia = createPinia();
  app.use(pinia);
  app.use(i18n);
  icon.install(app);
  directive.install(app);
  app.mount(el);

  return app;
}

// Export components for Module Federation
export { default as ThumbnailDemo } from './components/ThumbnailDemo.vue';
export { useThumbnailDemoStore } from './store/thumbnailDemo';
