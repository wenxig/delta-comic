<script setup lang='ts'>
import { shallowRef, onMounted, ref, computed, watch, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ComicCard from '@/components/comic/comicCard.vue'
import Search from '@/components/search/search.vue'
import { isEmpty, uniqBy } from 'lodash-es'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { useTitle, watchOnce } from '@vueuse/core'
import Sorter from '@/components/search/sorter.vue'
import { useBikaStore } from '@/stores'
import { toCn, sorterValue } from '@/utils/translator'
import { cloneDeep } from 'lodash-es'
import Popup from '@/components/popup.vue'
import noneSearchTextIcon from '@/assets/images/none-search-text-icon.webp'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import symbol from '@/symbol'
import { bika } from '@/api/bika'
const config = useConfig()
const temp = useTemp().$applyRaw('searchConfig', () => ({
  result: new Map<string, bika.search.StreamType>(),
  scroll: new Map<string, number>()
}))
const sorter = useTemplateRef('sorter')
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const $route = useRoute()
const $router = useRouter()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as bika.SearchMode) ?? 'keyword')
useTitle(computed(() => `${decodeURIComponent($route.query.keyword as string ?? '')} | 搜索 | bika`))
const createStream = (keyword: string, sort: bika.SortType) => {
  const storeKey = keyword + "\u1145" + searchMode.value + '\u1145' + config['bika.search.sort']
  if (temp.result.has(storeKey)) return temp.result.get(storeKey)!
  switch (searchMode.value) {
    case 'pid': {
      return
    }
    case 'id': {
      $router.force.replace(`/comic/${searchText.value}`)
      return
    }
    case 'keyword': var s: bika.search.StreamType = bika.api.search.utils.createKeywordStream(keyword, sort); break
    case 'uploader': var s: bika.search.StreamType = bika.api.search.utils.createUploaderStream(keyword, sort); break
    case 'translator': var s: bika.search.StreamType = bika.api.search.utils.createTranslatorStream(keyword, sort); break
    case 'author': var s: bika.search.StreamType = bika.api.search.utils.createAuthorStream(keyword, sort); break
    case 'category': var s: bika.search.StreamType = bika.api.search.utils.createCategoryStream(keyword, sort); break
    case 'tag': var s: bika.search.StreamType = bika.api.search.utils.createTagStream(keyword, sort); break
  }
  temp.result.set(storeKey, s)
  return s
}
const comicStream = computed(() => createStream(searchText.value, config['bika.search.sort']))

onMounted(() => {
  if (temp.scroll.has(searchText.value)) list.value?.listInstance?.scrollTo({ top: temp.scroll.get(searchText.value) })
})
const stop = $router.beforeEach(() => {
  temp.scroll.set(searchText.value, list.value?.scrollTop!)
  stop()
})


const bikaStore = useBikaStore()
const tags = () => (bikaStore.preload.categories.data.value ?? []).slice(13)
const _fillerTags = ref<bika.FillerTag[]>(cloneDeep(config['bika.search.fillerTags']))
watchOnce(() => bikaStore.preload.categories, categories => _fillerTags.value = uniqBy([..._fillerTags.value, ...(categories.data.value ?? []).map(v => ({ name: v.title, mode: 'auto' as const }))], v => v.name))
const showFiller = shallowRef(false)
const syncFillerTags = () => config['bika.search.fillerTags'] = cloneDeep(_fillerTags.value)
const cancelWriteFillerTags = () => _fillerTags.value = cloneDeep(config['bika.search.fillerTags'])

const dataProcessor = (data: bika.comic.BaseComic[]) => data.filter(comic => {
  const tags = (bika.comic.CommonComic.is(comic) ? comic.categories.concat(comic.tags) : comic.categories) ?? []
  for (const hidden of config['bika.search.fillerTags'].filter(v => v.mode == 'hidden')) if (tags.find(v => v == hidden.name)) return false
  for (const show of config['bika.search.fillerTags'].filter(v => v.mode == 'show')) if (!tags.find(v => v == show.name)) return false
  const reg = symbol.banAi
  if (!config['app.search.showAIProject'] && (tags.includes('AI作畫') || reg.test(comic.title) || reg.test(comic.author))) return false
  return true
})

const getMode = (name: string) => _fillerTags.value.find(v => v.name == name)?.mode ?? 'auto'
const isInHidden = (name: string) => getMode(name) == 'hidden'
const isInShow = (name: string) => getMode(name) == 'show'

const showSearch = shallowRef(true)
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showSearch.value = false
  else showSearch.value = true
}, { immediate: true })

const searchCom = useTemplateRef('searchCom')
const toSearchInHideMode = async () => {
  showSearch.value = true
  searchCom.value?.searchInstance?.focus()
}
</script>

<template>
  <header class="w-full h-[86px] text-(--van-text-color) duration-200 transition-transform"
    :class="[showSearch ? '!translate-y-0' : '!-translate-y-[54px]']">
    <Search ref="searchCom" :base-text="searchText" :base-mode="searchMode" show-action />
    <!--  -->
    <div class="van-hairline--bottom h-8 w-full relative items-center bg-(--van-background-2) flex *:!text-nowrap">
      <div class="text-sm h-full ml-2 van-haptics-feedback flex justify-start items-center" @click="showFiller = true">
        <VanIcon name="filter-o" size="1.5rem"
          :badge="config['bika.search.fillerTags'].filter(v => v.mode != 'auto').length || undefined" />过滤
      </div>
      <div class="text-sm h-full ml-2 van-haptics-feedback flex justify-start items-center" @click="sorter?.show()">
        <VanIcon name="sort" size="1.5rem" class="sort-icon" />排序
        <span class="text-(--nui-primary-color) text-xs">-{{
          sorterValue.find(v => v.value == config['bika.search.sort'])?.text
        }}</span>
      </div>
      <div class="text-sm h-full ml-2 van-haptics-feedback flex justify-start items-center">
        <VanSwitch v-model="config['app.search.showAIProject']" size="1rem" />展示AI作品
      </div>
      <VanIcon name="search" class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2"
        @click="toSearchInHideMode" :class="[showSearch ? 'translate-x-full' : '-translate-x-2']" size="25px"
        color="var(--van-text-color-2)" />
    </div>
  </header>
  <Popup v-model:show="showFiller" position="bottom" class="max-h-[70%] !overflow-x-hidden" closeable round
    @closed="cancelWriteFillerTags">
    <div class="flex mt-2 ml-2 h-[calc(var(--van-popup-close-icon-margin)*3)] w-full items-center">
      <VanButton plain @click="showFiller = false">取消</VanButton>
      <VanButton class="!ml-2" type="primary" @click="() => { syncFillerTags(); showFiller = false }">确定
      </VanButton>
    </div>
    <div class="w-full flex flex-wrap">
      <Loading size="24px" v-if="isEmpty(tags())">加载中...</Loading>
      <template v-else>
        <VanTag :type="isInShow(tag) ? 'warning' : 'primary'" class="m-1" size="large"
          v-for="tag of tags().map(v => v.title)" :plain="isInHidden(tag)" @click="() => {
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
  <NResult status="info" title="无搜索" class="h-[80vh] flex items-center flex-col justify-center" description="请输入"
    v-if="isEmpty($route.query.keyword)">
    <template #icon>
      <Image :src="noneSearchTextIcon" />
    </template>
  </NResult>
  <List :itemHeight="140" v-else-if="comicStream" v-slot="{ data: { item: comic }, height }"
    class="duration-200 will-change-[transform,_height] transition-all"
    :class="[showSearch ? 'h-[calc(100vh-86px)] translate-y-0' : 'h-[calc(100vh-32px)] -translate-y-[54px]']" ref="list"
    :source="comicStream" :data-processor>
    <ComicCard :comic :height />
  </List>
  <Sorter ref="sorter" />
</template>