import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import { isEmpty } from "lodash-es"
import symbol from "@/symbol"
import { useComicStore } from "@/stores/comic"
import { SmartAbortController } from "@/utils/request"
import { isCancel } from "axios"
import eventBus from "@/utils/eventBus"
import routes from "./routes"

// token check
const bikaToken = localStorage.getItem(symbol.loginTokenBika)
const jmToken = localStorage.getItem(symbol.loginTokenJm)
if (isEmpty(bikaToken) || isEmpty(jmToken)) {
  if (!window.location.pathname.startsWith('/auth')) window.location.pathname = '/auth/login'
}

export const router = createRouter({
  history: createWebHistory(),
  routes
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
