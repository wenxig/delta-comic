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
      statusBar: {
        style: 'auto'
      }
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
        component: () => import('@/pages/main/home/hot/index.vue'),
      }, {
        path: ':id(hot)',
        component: () => import('@/pages/main/home/hot/index.vue'),
      }, {
        // query plugin=bika
        path: ':id',
        component: () => import('@/pages/main/home/other.vue'),
      }]
    }, {
      path: 'subscribe',
      component: () => import('@/pages/main/subscribe/index.vue'),
    }, {
      path: 'user',
      component: () => import('@/pages/main/user.vue')
    }]
  }, {
    path: '/user',
    meta: {
      statusBar: {
        style: 'auto'
      }
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
  }, {
    path: '/user/action/:plugin/:key',
    meta: {
      statusBar: {
        style: 'auto'
      }
    },
    component: () => import('@/pages/user/actionPage.vue')
  },
  {
    // query source=bika:keyword&sort=dd
    path: '/search/:input',
    name: 'search',
    meta: {
      statusBar: {
        style: 'auto'
      },
      force: true
    },
    component: () => import('@/pages/search/index.vue')
  },
  {
    path: '/cate',
    name: 'cate',
    meta: {
      statusBar: {
        style: 'auto'
      },
    },
    component: () => import('@/pages/cate/index.vue')
  },
  {
    path: '/content/:contentType/:id/:ep',
    component: () => import('@/pages/content/index.vue'),
    name: 'content',
    meta: {
      statusBar: { style: 'dark' },
      force: true
    }
  },
  {
    path: '/setting',
    meta: {
      statusBar: {
        style: 'auto'
      }
    },
    component: () => import('@/pages/setting/index.vue'),
  }, {
    // query plugin=jmcomic
    path: '/hot',
    meta: {
      statusBar: {
        style: 'auto'
      }
    },
    component: () => import('@/pages/hot.vue')
  },
]

export default routes