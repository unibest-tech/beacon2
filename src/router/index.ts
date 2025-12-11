import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory('/beacon2/'),
  routes: [
    {
      path: '/',
      component: Dashboard,
    },
  ],
})

// 路由守卫
// router.beforeEach((to, from, next) => {
//   // 设置页面标题
//   document.title = `${to.meta.title} - Unibest Beacon`
//   next()
// })

export default router
