<script setup lang='ts'>
import { useBikaStore } from '@/stores'
import { isEmpty, noop } from 'lodash-es'
import { watchDebounced } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'
import { SmartAbortController } from '@/utils/request'
import { getOriginalSearchContent, useSearchMode } from '@/utils/translator'
import { useZIndex } from '@/utils/layout'
import { motion } from 'motion-v'
import { bika } from '@/api/bika'
const inputText = defineModel<string>({ required: true })
const searchMode = useSearchMode(inputText)
const show = defineModel<boolean>('show', { required: true })
defineEmits<{
  search: []
}>()
const $props = defineProps<{
  zIndex?: number
}>()
type SearchRes = bika.comic.CommonComic[] | bika.comic.LessComic[]
const bikaStore = useBikaStore()
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
        var req: SearchRes = (await bika.api.search.utils.getComicsByUploader(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'id': {
        const value = await bika.api.comic.getComicInfo(searchContent, sac.signal)
        if (value) var req: SearchRes = [value]
        else var req: SearchRes = []
        break
      }
      case 'pid': {
        const value = await bika.api.comic.getComicByPicId(searchContent, sac.signal)
        if (value) var req: SearchRes = [value]
        else var req: SearchRes = []
        break
      }
      case 'category': {
        var req: SearchRes = (await bika.api.search.utils.getComicsByCategories(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      case 'tag': {
        var req: SearchRes = (await bika.api.search.utils.getComicsByTag(searchContent, undefined, undefined, sac.signal)).docs
        break
      }
      default: {
        var req: SearchRes = (await bika.api.search.utils.getComicsByKeyword(inputText, undefined, undefined, sac.signal)).docs
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
    <AnimatePresence>
      <motion.div @click="show = false" v-if="show" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }" class="bg-(--van-black) h-[100vh] w-[100vw] fixed top-[54px] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="show" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[54px]">
        <template v-if="isEmpty(inputText)">
          <!-- <template v-if="!isEmpty(app.searchHistory)">
          <span class="text-xl text-(--van-primary-color) font-bold w-full pl-3 van-hairline--top">历史搜索</span>
          <div class="w-full h-auto flex flex-wrap pl-1 mb-1">
            <van-tag type="primary" v-for="(tag, index) of app.searchHistory.toReversed().slice(0, 12)" size="large"
              class="m-1 text-nowrap van-haptics-feedback" plain :key="index"
              @click="() => { inputText = tag.toString(); $emit('search') }">{{ tag }}</van-tag>
          </div>
        </template> -->
          <span class="text-xl text-(--van-primary-color) font-bold w-full pl-3 van-hairline--top">热词</span>
          <VanTag type="primary" v-for="tag of bikaStore.preload.hotTag.data.value ?? []" size="large"
            class="m-1 text-nowrap van-haptics-feedback" @click="() => { inputText = `##${tag}`; $emit('search') }">
            {{ tag }}
          </VanTag>
        </template>
        <VanList v-else class="w-full">
          <template v-if="thinkList == null">
            <div class="w-full flex justify-center items-center">
              <VanLoading size="24px">加载中...</VanLoading>
            </div>
          </template>
          <template v-else-if="!isEmpty(thinkList)">
            <VanCell v-for="think of thinkList" :title="think.title" :value="think.author" @click="() => {
              inputText = think.title
              $emit('search')
            }" class="van-haptics-feedback w-full" />
          </template>
          <div v-else>
            <NEmpty description="无结果" class="w-full my-1" />
          </div>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
