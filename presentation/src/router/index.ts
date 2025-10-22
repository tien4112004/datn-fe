import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/thumbnail',
    name: 'thumbnail',
    component: () => import('@/views/ThumbnailView.vue'),
  },
  {
    path: '/mobile',
    name: 'mobile',
    component: () => import('@/views/MobileApp.vue'),
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
