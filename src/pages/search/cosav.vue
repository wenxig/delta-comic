<script setup lang='ts'>
import { onMounted, computed, watch, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import { useTabStatus } from 'vant'
import { RStream } from '@/utils/data'
import { cosav } from '@/api/cosav'
const config = useConfig()
const temp = useTemp().$applyRaw('cosav_searchConfig', () => ({
  result: new Map<string, RStream<cosav.video.CommonVideo>>(),
  scroll: new Map<string, number>()
}))
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const $route = useRoute()
const $router = useRouter()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as cosav.SearchMode) ?? 'keyword')
const createStream = (keyword: string, sort: cosav.SortType) => {
  const storeKey = `${keyword}\u1145${searchMode.value}\u1145${config['cosav.search.sort']}\u1145cosav`
  if (temp.result.has(storeKey)) return temp.result.get(storeKey)!
  switch (searchMode.value) {
    case 'vid': {
      return
    }
    case 'keyword': var s = cosav.api.search.utils.createKeywordStream(keyword, sort); break
    case 'category': var s = cosav.api.search.utils.createCategoryStream(keyword, sort); break
  }
  temp.result.set(storeKey, s)
  return s
}
const videoStream = computed(() => createStream(searchText.value, config['cosav.search.sort']))

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
  <List :itemHeight="110" v-slot="{ data: { item: video }, height }" v-if="isActive ?? true"
    class="duration-200 will-change-[transform,_height] transition-all h-full" ref="list" :source="videoStream!">
    <VideoCard :video :height />
  </List>
</template>