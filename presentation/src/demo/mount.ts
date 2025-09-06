import { createApp } from 'vue';
import { createPinia } from 'pinia';
import icon from '../plugins/icon';
import directive from '../plugins/directive/index';
import ThumbnailSlide from '../views/components/ThumbnailSlide/index.vue';
import '@/assets/styles/prosemirror.scss';
import '@/assets/styles/scope.scss';
import i18n from '@/locales';

export function mount(el: string | Element, props: Record<string, unknown> = {}) {
  const app = createApp(ThumbnailSlide, props);

  console.log('Mounting ThumbnailSlide with props:', props);

  const pinia = createPinia();
  app.use(pinia);
  app.use(i18n);
  icon.install(app);
  directive.install(app);
  app.mount(el);

  return app;
}
