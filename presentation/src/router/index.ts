import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Lazy load components
const ThumbnailDemo = () => import('@/components/ThumbnailDemo.vue');
const Editor = () => import('@/views/Editor/index.vue');
const Screen = () => import('@/views/Screen/index.vue');
const Mobile = () => import('@/views/Mobile/index.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: Editor,
    meta: {
      title: 'PPT Editor',
    },
  },
  {
    path: '/demo',
    name: 'demo',
    component: ThumbnailDemo,
    meta: {
      title: 'Thumbnail Demo',
    },
  },
  {
    path: '/screen',
    name: 'screen',
    component: Screen,
    meta: {
      title: 'Screen View',
    },
  },
  {
    path: '/mobile',
    name: 'mobile',
    component: Mobile,
    meta: {
      title: 'Mobile View',
    },
  },
  // Catch-all route for 404s
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title based on route meta
  if (to.meta.title) {
    document.title = `${to.meta.title} - PPTist`;
  }

  next();
});

export default router;
