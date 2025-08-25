import symbol from '@/symbol'
import { Style } from '@capacitor/status-bar'
import { isEmpty } from 'lodash-es'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: isEmpty(localStorage.getItem(symbol.loginTokenBika)) ? '/auth/login' : '/main/home'
  }, {
    path: "/auth/login",
    component: () => import('@/pages/auth/login.vue'),
  }, {
    path: "/comic",
    meta: { force: true, statusBar: { style: Style.Dark } },
    children: [{
      path: ':id(\\d+)/:epId?',
      meta: { force: true, statusBar: { style: Style.Dark } },
      component: () => import('@/pages/comic/jm.vue')
    }, {
      path: ':id/:epId?',
      meta: { force: true, statusBar: { style: Style.Dark } },
      component: () => import('@/pages/comic/bika.vue')
    }]
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
        path: ':id(video)',
        component: () => import('@/pages/main/home/video.vue'),
      }, {
        path: ':id(random)',
        component: () => import('@/pages/main/home/random.vue'),
      }, {
        path: ':id(week)',
        component: () => import('@/pages/main/home/week.vue')
      }, {
        path: ':id(level)',
        component: () => import('@/pages/main/home/level/index.vue'),
        redirect: '/main/home/level/day',
        children: [{
          path: 'user',
          component: () => import('@/pages/main/home/level/userTotal.vue'),
        }, {
          path: ':path(day|week|month)',
          component: () => import('@/pages/main/home/level/comicTotal.vue'),
        }]
      },
       {
        path: ':id(video@.+)',
        component: () => import('@/pages/main/home/otherVideo.vue')
      }, 
      {
        path: ':id',
        component: () => import('@/pages/main/home/other.vue')
      }]
    }, {
      path: 'user',
      component: () => import('@/pages/main/user.vue')
    }]
  }, {
    path: '/user',
    children: [{
      path: 'favourite',
      component: () => import('@/pages/user/favourite.vue'),
    }, {
      path: 'comment',
      component: () => import('@/pages/user/comment.vue'),
    }, {
      path: 'edit',
      component: () => import('@/pages/user/edit.vue'),
    }]
  }, {
    path: '/search',
    component: () => import('@/pages/search/index.vue')
  }
]

export default routes