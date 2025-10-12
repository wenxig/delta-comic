import { Style } from '@capacitor/status-bar'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: '/main/home'
  }, {
    path: '/main',
    component: () => import('@/pages/main/index.vue'),
    redirect: '/main/home',
    meta: {
      statusBar: { style: Style.Light }
    },
    children: [{
      path: 'home',
      component: () => import('@/pages/main/home/index.vue'),
      redirect: '/main/home/random',
      children: [{
        path: ':id(random)',
        component: () => import('@/pages/main/home/random.vue'),
      }, {
        path: ':id(hot)',
        component: () => import('@/pages/main/home/random.vue'),
      }, {
        // query plugin:bika
        path: ':id',
        component: () => import('@/pages/main/home/other.vue'),
      }]
    }, {
      path: 'user',
      component: () => import('@/pages/main/user.vue')
    }]
  }, {
    path: '/user',
    meta: {
      statusBar: { style: Style.Light }
    },
    children: [{
      path: 'history',
      component: () => import('@/pages/user/history/index.vue')
    }, {
      path: 'favourite',
      component: () => import('@/pages/user/favourite/index.vue')
    }, {
      path: 'favourite/:id',
      component: () => import('@/pages/user/favourite/info.vue')
    }, {
      path: 'recent',
      component: () => import('@/pages/user/recent/index.vue')
    }, {
      path: 'edit/:plugin',
      component: () => import('@/pages/user/edit.vue')
    }]
  },
  {
    // query source: bika:keyword, sort: dd
    path: '/search/:input',
    name: 'search',
    meta: {
      statusBar: { style: Style.Light },
      force: true
    },
    component: () => import('@/pages/search/index.vue')
  },
  {
    path: '/cate',
    name: 'cate',
    meta: {
      statusBar: { style: Style.Light },
    },
    component: () => import('@/pages/cate/index.vue')
  },
  {
    path: '/content/:contentType/:id/:ep',
    component: () => import('@/pages/content/index.vue'),
    name: 'content',
    meta: {
      force: true
    }
  },
  {
    path: '/setting',
    component: () => import('@/pages/setting/index.vue'),
  }
]

export default routes