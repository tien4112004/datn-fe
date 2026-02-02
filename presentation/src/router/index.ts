import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/thumbnail',
    name: 'thumbnail',
    component: () => import('@/views/ThumbnailView.vue'),
  },
  {
    path: '/mobile/:id',
    name: 'mobile',
    component: () => import('@/views/MobileApp.vue'),
    meta: { mode: 'view' },
  },
  {
    path: '/generation/:id',
    name: 'generation',
    component: () => import('@/views/MobileApp.vue'),
    meta: { mode: 'generate' },
  },
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/MainApp.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
