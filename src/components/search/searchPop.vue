<script setup lang='ts'>
import { useBikaStore } from '@/stores'
import { isBoolean, isEmpty, noop } from 'lodash-es'
import { watchDebounced } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { SmartAbortController } from '@/utils/request'
import { getOriginalSearchContent, searchModeMap, useSearchMode } from '@/utils/translator'
import { useZIndex } from '@/utils/layout'
import { BKSearchMode } from '@/api/bika'
import { search } from '@/api/bika/api/search'
import { CommonComic, LessComic } from '@/api/bika/comic'
import { getComicByPicId, getComicInfo, getComicPicId } from '@/api/bika/api/comic'
const inputText = defineModel<string>({ required: true })
const searchMode = useSearchMode(inputText)
const show = defineModel<boolean>('show', { required: true })
defineEmits<{
  search: []
}>()
const $props = defineProps<{
  zIndex?: number
}>()
type SearchRes = CommonComic[] | LessComic[]
const app = useBikaStore()
const thinkList = shallowRef<SearchRes | null>(null)
watch(inputText, () => thinkList.value = null)
const keyOfStopRequest = new AbortController()

const sac = new SmartAbortController()
async function request(inputText: string) {
  sac.abort()
  try {
    const searchContent = getOriginalSearchContent(inputText)
    switch (searchMode.value) {
      case 'uploader': {
        var req: SearchRes = (await search.getComicsByUploader(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'translator': {
        var req: SearchRes = (await search.getComicsByTranslator(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'author': {
        var req: SearchRes = (await search.getComicsByAuthor(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'id': {
        const value = await getComicInfo(searchContent, sac.signal)
        if (value) var req: SearchRes = [value]
        else var req: SearchRes = []
        break
      }
      case 'pid': {
        const value = await getComicByPicId(searchContent, sac.signal)
        if (value) var req: SearchRes = [value]
        else var req: SearchRes = []
        break
      }
      case 'categories': {
        var req: SearchRes = (await search.getComicsByCategories(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'tag': {
        var req: SearchRes = (await search.getComicsByTag(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      default: {
        var req: SearchRes = (await search.getComicsByKeyword(inputText, undefined, undefined, sac.signal)).docs
        break
      }
    }
    return req
  } catch {
    return []
  }
}
watchDebounced(inputText, async (inputText, ov) => {
  if (ov == inputText) return
  keyOfStopRequest.abort()
  try {
    const req = await request(inputText!)
    thinkList.value = req.slice(0, 7)
  } catch { }
}, { debounce: 500, maxWait: 100000 })
if (inputText.value) request(inputText.value!).then(v => thinkList.value = v.slice(0, 7)).catch(noop)


// const searchHistorySac = new SmartAbortController()
// watch(show, show => {
//   if (!show) return
//   searchHistorySac.abort()
//   SearchHistory.get({ signal: searchHistorySac.signal }).then(v => !isBoolean(v) && (app.searchHistory = v))
// }, { immediate: true })

const _zi = useZIndex(show)
const zIndex = computed(() => $props.zIndex ?? _zi[0].value)
</script>

<template>
  <Teleport to="#popups">
    <div @click="show = false" v-if="show" :style="{ zIndex }"
      class="bg-[--van-black] opacity-50 h-[100vh] w-[100vw] fixed top-[54px] left-0">
    </div>
    <div :class="{ '!max-h-[60vh] h-auto !pt-1 !pb-4': show }" :style="{ zIndex }"
      class="w-full flex flex-wrap justify-evenly transition-all overflow-y-auto h-0 overflow-hidden bg-[--van-background-2] rounded-b-3xl pb-0 pt-0 fixed top-[54px]">
      <template v-if="isEmpty(inputText)">
        <!-- <template v-if="!isEmpty(app.searchHistory)">
          <span class="text-xl text-[--van-primary-color] font-bold w-full pl-3 van-hairline--top">历史搜索</span>
          <div class="w-full h-auto flex flex-wrap pl-1 mb-1">
            <van-tag type="primary" v-for="(tag, index) of app.searchHistory.toReversed().slice(0, 12)" size="large"
              class="m-1 text-nowrap van-haptics-feedback" plain :key="index"
              @click="() => { inputText = tag.toString(); $emit('search') }">{{ tag }}</van-tag>
          </div>
        </template> -->
        <span class="text-xl text-[--van-primary-color] font-bold w-full pl-3 van-hairline--top">热词</span>
        <van-tag type="primary" v-for="tag of app.hotTags" size="large" class="m-1 text-nowrap van-haptics-feedback"
          @click="() => { inputText = `##${tag}`; $emit('search') }">{{ tag }}</van-tag>
      </template>
      <VanList v-else class="w-full">
        <template v-if="thinkList == null">
          <div class="w-full flex justify-center items-center">
            <van-loading size="24px">加载中...</van-loading>
          </div>
        </template>
        <template v-else-if="!isEmpty(thinkList)">
          <van-cell v-for="think of thinkList" :title="think.title" :value="think.author" @click="() => {
            inputText = think.title
            $emit('search')
          }" class="van-haptics-feedback w-full" />
        </template>
        <div v-else>
          <NEmpty description="无结果" class="w-full my-1" />
        </div>
      </VanList>
    </div>
  </Teleport>
</template>
