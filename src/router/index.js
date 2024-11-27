import { createRouter, createWebHistory } from 'vue-router'
import ModelLoading from '@/views/ModelLoading.vue'

const routes = [
  {
    path: '/',
    name: 'modelLoading',
    component: ModelLoading,
    redirect: '/BascDemo'
  },
  {
    path: '/BascDemo',
    name:'BascDemo',
    component: () => import('@/views/BascDemo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
