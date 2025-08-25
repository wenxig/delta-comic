<script setup lang='ts'>
import { onMounted, computed, watch, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComicCard from '@/components/comic/comicCard.vue'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import { bika } from '@/api/bika'
import { uni } from '@/api/union'
import { useTabStatus } from 'vant'
const config = useConfig()
const temp = useTemp().$applyRaw('bk_searchConfig', () => ({
  result: new Map<string, bika.search.StreamType>(),
  scroll: new Map<string, number>()
}))
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const $route = useRoute()
const $router = useRouter()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as uni.SearchMode) ?? 'keyword')
const createStream = (keyword: string, sort: bika.SortType) => {
  const storeKey = `${keyword}\u1145${searchMode.value}\u1145${config['bika.search.sort']}\u1145bika`
  if (temp.result.has(storeKey)) return temp.result.get(storeKey)!
  switch (searchMode.value) {
    case 'pid': {
      return
    }
    case 'jid': {
      return
    }
    case 'keyword': var s: bika.search.StreamType = bika.api.search.utils.createKeywordStream(keyword, sort); break
    case 'uploader': var s: bika.search.StreamType = bika.api.search.utils.createUploaderStream(keyword, sort); break
    case 'category': var s: bika.search.StreamType = bika.api.search.utils.createCategoryStream(keyword, sort); break
    case 'tag': var s: bika.search.StreamType = bika.api.search.utils.createTagStream(keyword, sort); break
  }
  temp.result.set(storeKey, s)
  return s
}
const comicStream = computed(() => createStream(searchText.value, config['bika.search.sort']))

const dataProcessor = (data: bika.comic.BaseComic[]) => {
  return config['app.search.showAIProject'] ? data : data.filter(comic => !comic.$isAi)
}

const showSearch = defineModel<boolean>('showHeader', { required: true })
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showSearch.value = false
  else showSearch.value = true
}, { immediate: true })

const setupScroll = () => {
  if (temp.scroll.has(searchText.value)) list.value?.listInstance?.scrollTo({ top: temp.scroll.get(searchText.value) })
}
const setScroll = () => {
  temp.scroll.set(searchText.value, list.value?.scrollTop!)
}
const isActive = useTabStatus()
if (isActive) {
  watch(isActive, isActive => {
    if (isActive) setupScroll()
    else setScroll()
  })
}
const stop = $router.beforeEach(() => {
  setScroll()
  stop()
})
onMounted(setupScroll)
</script>

<template>
  <List :itemHeight="140" v-slot="{ data: { item: comic }, height }" v-if="isActive ?? true"
    class="duration-200 will-change-[transform,_height] transition-all h-full" ref="list" :source="comicStream!"
    :data-processor>
    <ComicCard :comic :height />
  </List>
</template>