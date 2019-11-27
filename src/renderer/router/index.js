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
        meta: { keepAlive: true }
      }
    ]
  },
  {
    path: '/favourite',
    component: layout,
    children: [
      {
        path: 'favourite',
        name: 'favourite',
        component: () => import('@/views/favourite'),
        meta: { keepAlive: true },
        props: {
          type: 'favourite'
        }
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/views/favourite'),
        meta: { keepAlive: true },
        props: {
          type: 'history'
        }
      }
    ]
  },
  {
    path: '/gallery',
    component: layout,
    children: [
      {
        path: 'index',
        name: 'gallery',
        component: () => import('@/views/gallery'),
        meta: { keepAlive: false }
      }
    ]
  },
  {
    path: '/read',
    component: layout,
    children: [
      {
        path: 'index',
        name: 'read',
        component: () => import('@/views/read'),
        meta: { keepAlive: false }
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
