<script setup lang='ts'>
import { shallowRef, onMounted, ref, computed, watch, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComicCard from '@/components/comic/comicCard.vue'
import { isEmpty, uniqBy } from 'lodash-es'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { watchOnce } from '@vueuse/core'
import { useBikaStore } from '@/stores'
import { toCn } from '@/utils/translator'
import { cloneDeep } from 'lodash-es'
import Popup from '@/components/popup.vue'
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
  const storeKey = keyword + "\u1145" + searchMode.value + '\u1145' + config['bika.search.sort']
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



const bikaStore = useBikaStore()
const tags = () => (bikaStore.preload.categories.data.value ?? []).slice(13)
const _fillerTags = ref<bika.FillerTag[]>(cloneDeep(config['bika.search.fillerTags']))
watchOnce(() => bikaStore.preload.categories, categories => _fillerTags.value = uniqBy([..._fillerTags.value, ...(categories.data.value ?? []).map(v => ({ name: v.title, mode: 'auto' as const }))], v => v.name))
const showFiller = shallowRef(false)
const syncFillerTags = () => config['bika.search.fillerTags'] = cloneDeep(_fillerTags.value)
const cancelWriteFillerTags = () => _fillerTags.value = cloneDeep(config['bika.search.fillerTags'])
defineExpose({
  setShowFiller(v: boolean) {
    showFiller.value = v
  }
})
const dataProcessor = (data: bika.comic.BaseComic[]) => {
  const v = data.filter(comic => {
    const tags = (bika.comic.CommonComic.is(comic) ? comic.categories.concat(comic.tags) : comic.categories) ?? []
    for (const hidden of config['bika.search.fillerTags'].filter(v => v.mode == 'hidden')) if (tags.find(v => v == hidden.name)) return false
    for (const show of config['bika.search.fillerTags'].filter(v => v.mode == 'show')) if (!tags.find(v => v == show.name)) return false
    return true
  })
  return config['app.search.showAIProject'] ? v : v.filter(comic => !comic.$isAi)
}

const getMode = (name: string) => _fillerTags.value.find(v => v.name == name)?.mode ?? 'auto'
const isInHidden = (name: string) => getMode(name) == 'hidden'
const isInShow = (name: string) => getMode(name) == 'show'

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
  <Popup v-model:show="showFiller" position="bottom" class="max-h-[70%] !overflow-x-hidden" closeable round
    @closed="cancelWriteFillerTags">
    <div class="flex mt-2 ml-2 h-[calc(var(--van-popup-close-icon-margin)*3)] w-full items-center">
      <VanButton plain @click="showFiller = false">取消</VanButton>
      <VanButton class="!ml-2" type="primary" @click="() => { syncFillerTags(); showFiller = false }">确定
      </VanButton>
    </div>
    <div class="w-full flex flex-wrap gap-1 p-1">
      <Loading size="24px" v-if="isEmpty(tags())">加载中...</Loading>
      <template v-else>
        <VanTag :type="isInShow(tag) ? 'warning' : 'primary'" size="large" v-for="tag of tags().map(v => v.title)"
          :plain="isInHidden(tag)" @click="() => {
            let obj = _fillerTags.find(v => v.name == tag)
            if (!obj) _fillerTags.push({ name: tag, mode: 'auto' })
            obj = _fillerTags.find(v => v.name == tag)!
            switch (getMode(tag)) {
              case 'auto': return obj.mode = 'hidden'
              case 'hidden': return obj.mode = 'show'
              case 'show': return obj.mode = 'auto'
            }
          }">
          {{ toCn(tag) }}
        </VanTag>
      </template>
    </div>
  </Popup>
  <List :itemHeight="140" v-slot="{ data: { item: comic }, height }" v-if="isActive ?? true"
    class="duration-200 will-change-[transform,_height] transition-all h-full" ref="list" :source="comicStream!"
    :data-processor>
    <ComicCard :comic :height />
  </List>
</template>