import Vue from 'vue'
import Router from 'vue-router'
import layout from '@/components/layout'

Vue.use(Router)

export const constantRouterMap = [
  {
    path: '/',
    name: 'Home',
    redirect: '/home',
    component: layout,
    children: [
      {
        path: 'home',
        component: () => import('@/views/home')
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

export default new Router({
  // mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
