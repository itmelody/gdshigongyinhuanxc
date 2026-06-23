import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/inspection',
    name: 'Inspection',
    component: () => import('@/views/Inspection/index.vue'),
    meta: { title: '智能巡检' }
  },
  {
    path: '/hazard',
    name: 'Hazard',
    component: () => import('@/views/Hazard/index.vue'),
    meta: { title: '隐患管理' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics/index.vue'),
    meta: { title: '统计分析' }
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/views/System/index.vue'),
    meta: { title: '系统管理' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
