import { createRouter, createWebHistory } from 'vue-router'
import CheckoutDemo from '../views/CheckoutDemo.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: CheckoutDemo,
    },
  ],
})

export default router
