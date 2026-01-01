import { createMemoryHistory, createRouter, createWebHistory, isNavigationFailure, NavigationFailureType, type RouteLocationRaw } from "vue-router"
import routes from "./routes"
import { uni, Utils } from "delta-comic-core"
import { useContentStore } from "@/stores/content"
import { toRef } from "vue"
import { searchSourceKey } from "@/pages/search/source"
import { StatusBar, StatusBarStyle } from "@/utils/native"

export const router = window.$router = createRouter({
  history: import.meta.env.DEV ? createWebHistory() : createMemoryHistory(),
  routes
})

Utils.eventBus.SharedFunction.define((contentType_, id, ep, preload) => {
  const contentStore = useContentStore()
  contentStore.$load(contentType_, id, ep, preload)
  return router.force.push({
    name: 'content',
    params: {
      id: encodeURI(id),
      ep: encodeURI(ep),
      contentType: uni.content.ContentPage.contentPage.toString(contentType_)
    }
  })
}, 'core', 'routeToContent')
Utils.eventBus.SharedFunction.define((input, source, sort) => {
  return router.force.push({
    name: 'search',
    params: {
      input: encodeURI(input)
    },
    query: {
      source: source ? searchSourceKey.toString(source) : undefined,
      sort: sort,
    }
  })
}, 'core', 'routeToSearch')


const $routerForceDo = async (mode: keyof typeof router.force, to: RouteLocationRaw) => { do var r = await router[mode](to); while (isNavigationFailure(r, NavigationFailureType.aborted)); return r }
router.force = {
  push: to => $routerForceDo('push', to),
  replace: to => $routerForceDo('replace', to),
}


router.beforeEach(async to => {
  if (to.meta.statusBar) {
    const sb = toRef(to.meta.statusBar).value
    await Promise.all([
      sb.style ? StatusBar.setStyle({ style: sb.style }) : undefined
    ])
  } else {
    await Promise.all([
      StatusBar.setStyle({ style: StatusBarStyle.Light })
    ])
  }
  return true
})
