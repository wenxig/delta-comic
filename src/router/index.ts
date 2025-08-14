import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import { isEmpty } from "lodash-es"
import symbol from "@/symbol"
import { useComicStore } from "@/stores/comic"
import { SmartAbortController } from "@/utils/request"
import { isCancel } from "axios"
import eventBus from "@/utils/eventBus"

// token check
const bikaToken = localStorage.getItem(symbol.loginTokenBika)
const jmToken = localStorage.getItem(symbol.loginTokenJm)
if (isEmpty(bikaToken) || isEmpty(jmToken)) {
  if (!window.location.pathname.startsWith('/auth')) window.location.pathname = '/auth/login'
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: isEmpty(localStorage.getItem(symbol.loginTokenBika)) ? '/auth/login' : '/main/home'
    }, {
      path: "/auth/login",
      component: () => import('@/pages/auth/login.vue')
    }, {
      path: "/comic",
      meta: { force: true },
      children: [{
        path: ':id(\\d+)/:epId?',
        meta: { force: true },
        component: () => import('@/pages/comic/jm.vue')
      }, {
        path: ':id/:epId?',
        meta: { force: true },
        component: () => import('@/pages/comic/bika.vue')
      }]
    }, {
      path: '/main',
      component: () => import('@/pages/main/index.vue'),
      redirect: '/main/home',
      children: [{
        path: 'home',
        component: () => import('@/pages/main/home/index.vue'),
        redirect: '/main/home/random',
        children: [{
          path: ':id(random)',
          component: () => import('@/pages/main/home/random.vue'),
        }, {
          path: ':id(week)',
          component: () => import('@/pages/main/home/week/index.vue'),
          children: [{
            path: ':type',
            component: () => import('@/pages/main/home/week/view.vue'),
          }]
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
        }, {
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
      component: () => import('@/pages/search.vue'),
    }
  ]
})
const stopSetupWatch = router.afterEach(() => {
  const { promise, resolve } = Promise.withResolvers<void>()
  const el = document.getElementById('setup')
  if (!el) return stopSetupWatch()
  el.animate([
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration: 300,
    iterations: Infinity,
    easing: 'cubic-bezier(0, 0, 0.2, 1)'
  }).addEventListener('finish', () => {
    el.remove()
    resolve()
  })
  el.remove()
  return promise
})

const $routerForceDo = async (mode: keyof typeof router.force, to: RouteLocationRaw) => { do var r = await router[mode](to); while (isNavigationFailure(r, NavigationFailureType.aborted)); return r }
router.force = {
  push: to => $routerForceDo('push', to),
  replace: to => $routerForceDo('replace', to),
}

const comicAbort = new SmartAbortController()
router.beforeEach(async to => {
  comicAbort.abort()
  if (!(to.path.startsWith('/comic') && !isEmpty(to.params.id))) return true
  try {
    const comicStore = useComicStore()
    const id = to.params.id.toString()
    console.log('router matched, load detail')
    comicStore.$load(id)
  } catch (error) {
    console.error(error)
    if (!isCancel(error)) throw error
  }
  return true
})


eventBus.on('networkError_unauth', () => {
  console.log('unlogin')
  router.force.replace('/auth/login')

})
