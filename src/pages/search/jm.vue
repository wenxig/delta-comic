<script setup lang='ts'>
import { onMounted, computed, watch, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComicCard from '@/components/comic/comicCard.vue'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { getOriginalSearchContent, jmSorterValue } from '@/utils/translator'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import { useTabStatus } from 'vant'
import { jm } from '@/api/jm'
import { RStream } from '@/utils/data'
import Sorter from '@/components/search/jmSorter.vue'
const config = useConfig()
const temp = useTemp().$applyRaw('jm_searchConfig', () => ({
  result: new Map<string, RStream<jm.comic.CommonComic>>(),
  scroll: new Map<string, number>()
}))
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const sorter = useTemplateRef('sorter')
const $route = useRoute()
const $router = useRouter()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as jm.SearchMode) ?? 'keyword')
const createStream = (keyword: string, sort: jm.SortType) => {
  const storeKey = keyword + "\u1145" + searchMode.value + '\u1145' + config['jm.search.sort']
  if (temp.result.has(storeKey)) return temp.result.get(storeKey)!
  switch (searchMode.value) {
    case 'jid': {
      $router.force.replace(`/comic/${getOriginalSearchContent(searchText.value)}`)
      return
    }
    case 'keyword': var s = jm.api.search.utils.createKeywordStream(keyword, sort); break
    case 'tag':
    case 'category': var s = jm.api.search.utils.createCategoryStream(keyword, sort); break
  }
  temp.result.set(storeKey, s)
  return s
}
const comicStream = computed(() => createStream(searchText.value, config['jm.search.sort']))

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
  <header class="van-hairline--bottom h-8 w-full relative items-center bg-(--van-background-2) flex *:!text-nowrap">
    <div class="text-sm h-full ml-2 van-haptics-feedback flex justify-start items-center" @click="sorter?.show()">
      <VanIcon name="sort" size="1.5rem" class="sort-icon" />排序
      <span class="text-(--nui-primary-color) text-xs">-{{
        jmSorterValue.find(v => v.value == config['jm.search.sort'])?.text
      }}</span>
    </div>
  </header>
  <List :itemHeight="140" v-slot="{ data: { item: comic }, height }" v-if="isActive ?? true"
    class="duration-200 will-change-[transform,_height] transition-all h-full" ref="list" :source="comicStream!">
    <ComicCard :comic :height />
  </List>
  <Sorter ref="sorter" />
</template>