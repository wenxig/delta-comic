import { defineStore } from 'pinia'
import { computed, shallowReactive } from 'vue'
import { uni } from 'delta-comic-core'
import { useRoute } from 'vue-router'

export const useContentStore = defineStore('content', helper => {
  const history = shallowReactive(new Map<string, uni.content.ContentPage>())
  const createHistoryKey = (contentType_: uni.content.ContentType_, id: string, ep: string) => `${id}$${uni.content.ContentPage.toContentTypeString(contentType_)}$${ep}`
  const $load = helper.action((contentType_: uni.content.ContentType_, id: string, ep: string, preload?: uni.content.PreloadValue, load: boolean = true, _offline: boolean = false) => {
    const itemId = createHistoryKey(contentType_, id, ep)
    if (!history.has(itemId)) {
      var newIns = new (uni.content.ContentPage.getContentPage(contentType_))(preload, id, ep)
      history.set(itemId, newIns)
      console.log('[useContentStore.$load] page cache miss', newIns)
    } else var newIns = history.get(itemId)!
    if (load) newIns.loadAll()
  }, 'load')
  const $route = useRoute()
  const now = computed(() => {
    if ($route.name != 'content') return
    const ep = $route.params.ep.toString()
    const id = $route.params.id.toString()
    const contentType = uni.content.ContentPage.toContentType($route.params.contentType.toString())
    const key = createHistoryKey(contentType, id, ep)
    return history.get(key)
  })
  return {
    history,
    now,
    $load
  }
})