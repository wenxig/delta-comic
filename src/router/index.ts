import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import routes from "./routes"
import { StatusBar } from "@capacitor/status-bar"
import { Capacitor } from "@capacitor/core"
window.$api.StatusBar = StatusBar
export const router = window.$router = createRouter({
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