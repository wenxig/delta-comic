import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import { isEmpty } from "lodash-es"
import { useContentStore } from "@/stores/content"
import { Utils } from "delta-comic-core"
import { isCancel } from "axios"
import routes from "./routes"
import { StatusBar } from "@capacitor/status-bar"
import { Capacitor } from "@capacitor/core"
window.$api.StatusBar = StatusBar
export const router = createRouter({
  history: createWebHistory(),
  routes
})

import { App } from '@capacitor/app'
App.addListener('backButton', () => {
  router.back()
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

const comicAbort = new Utils.request.SmartAbortController()
router.beforeEach(to => {
  comicAbort.abort()
  if (!((to.path.startsWith('/comic') || to.path.startsWith('/video')) && !isEmpty(to.params.id))) return true
  try {
    const contentStore = useContentStore()
    if (to.name != 'content') return
    const plugin = to.params.plugin.toString()
    const ep = to.params.ep.toString()
    const id = to.params.id.toString()
    const contentType = to.params.contentType.toString()
    return contentStore.$load(plugin, contentType, id, ep)
  } catch (error) {
    console.error(error)
    if (!isCancel(error)) throw error
  }
  return true
})



if (Capacitor.isNativePlatform()) {
  const baseStatusBarStyle = await StatusBar.getInfo()
  router.beforeEach(async to => {
    if (to.meta.statusBar) {
      const sb = to.meta.statusBar
      await Promise.all([
        sb.backgroundColor ? StatusBar.setBackgroundColor({ color: sb.backgroundColor }) : undefined,
        sb.overlaysWebView ? StatusBar.setOverlaysWebView({ overlay: sb.overlaysWebView }) : undefined,
        sb.style ? StatusBar.setStyle({ style: sb.style }) : undefined
      ])
    } else {
      await Promise.all([
        baseStatusBarStyle.color ? StatusBar.setBackgroundColor({ color: baseStatusBarStyle.color }) : undefined,
        baseStatusBarStyle.overlays ? StatusBar.setOverlaysWebView({ overlay: baseStatusBarStyle.overlays }) : undefined,
        StatusBar.setStyle({ style: baseStatusBarStyle.style })
      ])
    }
    return true
  })
}