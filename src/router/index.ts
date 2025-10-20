import { createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import routes from "./routes"
import { StatusBar } from "@capacitor/status-bar"
import { Capacitor } from "@capacitor/core"
import { App } from '@capacitor/app'
import { uni, Utils } from "delta-comic-core"
import { useContentStore } from "@/stores/content"
window.$api.StatusBar = StatusBar
export const router = window.$router = createRouter({
  history: createWebHistory(),
  routes
})

Utils.eventBus.SharedFunction.define((contentType_: uni.content.ContentType_, id: string, ep: string, preload?: uni.content.PreloadValue) => {
  const contentStore = useContentStore()
  contentStore.$load(contentType_, id, ep, preload)
  return router.force.push({
    name: 'content',
    params: {
      id: encodeURI(id),
      ep: encodeURI(ep),
      contentType: uni.content.ContentPage.toContentTypeString(contentType_)
    }
  })
}, 'core', 'routeToContent')
Utils.eventBus.SharedFunction.define((input: string, source: string, sort?: string) => {
  return router.force.push({
    name: 'search',
    params: {
      input: encodeURI(input)
    },
    query: {
      source: source && encodeURIComponent(source),
      sort: sort && encodeURIComponent(sort),
    }
  })
}, 'core', 'routeToSearch')

App.addListener('backButton', () => {
  router.back()
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