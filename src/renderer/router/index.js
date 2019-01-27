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
        component: () => import('@/views/home'),
        meta: {keepAlive: true}
      }
    ]
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/gallery'),
        meta: {keepAlive: false}
      }
    ]
  },
  {
    path: '/read',
    name: 'read',
    component: layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/read'),
        meta: {keepAlive: false}
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
