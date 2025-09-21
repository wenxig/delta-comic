import { defineStore } from 'pinia'
import { computed, shallowReactive } from 'vue'
import { uni } from 'delta-comic-core'
import { useRoute } from 'vue-router'

export const useContentStore = defineStore('content', helper => {
  const history = shallowReactive(new Map<string, uni.content.ContentPage>())
  const createHistoryKey = (plugin: string, contentType_: uni.item.ContentType_, id: string, ep: string) => `${plugin}:${id}$${uni.item.Item.toContentTypeString(contentType_)}$${ep}`
  const $load = helper.action((plugin: string, contentType_: uni.item.ContentType_, id: string, ep: string, _preload?: uni.content.PreloadValue, load = true) => {
    const itemId = createHistoryKey(plugin, contentType_, id, ep)
    if (!history.has(itemId)) {
      var newIns = <uni.content.ContentPage>{}//new uni.content.ContentPage(preload, plugin, id, false)
      history.set(itemId, newIns)
      console.log('page cache miss', newIns)
    } else var newIns = history.get(itemId)!
    if (load) newIns.loadAll()
  }, 'load')
  const $route = useRoute()
  const now = computed(() => {
    if ($route.name != 'content') return
    const plugin = $route.params.plugin.toString()
    const ep = $route.params.ep.toString()
    const id = $route.params.id.toString()
    const contentType = uni.item.Item.toContentType($route.params.contentType.toString())
    const key = createHistoryKey(plugin, contentType, id, ep)
    return history.get(key)
  })
  return {
    history,
    now,
    $load
  }
})