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
import { jm } from '@/api/jm'
import { uni } from '@/api/union'
import { cosav } from '@/api/cosav'
const inputText = defineModel<string>({ required: true })
const searchMode = useSearchMode(inputText)
const show = defineModel<boolean>('show', { required: true })
defineEmits<{
  search: []
}>()
const $props = defineProps<{
  zIndex?: number
  source: uni.SearchSource
}>()
type SearchRes = bika.comic.CommonComic[] | bika.comic.LessComic[] | jm.comic.FullComic[] | jm.comic.CommonComic[] 
const bikaStore = useBikaStore()
const thinkList = shallowRef<uni.comic.Comic[] | null>(null)
watch(inputText, () => thinkList.value = null)
const keyOfStopRequest = new AbortController()

const sac = new SmartAbortController()
async function request(inputText: string) {
  sac.abort()
  try {
    const searchContent = getOriginalSearchContent(inputText)

    // 通用处理函数
    async function getByJid(searchContent: string, signal: AbortSignal) {
      const value = await jm.api.comic.getComic(searchContent, signal)
      return value ? [value] : []
    }
    async function getByPic(searchContent: string, signal: AbortSignal) {
      const value = await bika.api.comic.getComicByPicId(searchContent, signal)
      return value ? [value] : []
    }
    async function getByCos(searchContent: string, signal: AbortSignal) {
      const value = await cosav.api.video.getInfo(searchContent, signal)
      return value ? [value] : []
    }
    let req: SearchRes = []
    switch ($props.source) {
      case 'bika':
        switch (searchMode.value) {
          case 'uploader':
            req = (await bika.api.search.utils.getComicsByUploader(searchContent, undefined, undefined, sac.signal)).docs
            break
          case 'jid':
            req = await getByJid(searchContent, sac.signal)
            break
          case 'pid':
            req = await getByPic(searchContent, sac.signal)
            break
          case 'vid':
            // req = await getByCos(searchContent, sac.signal)
            break
          case 'category':
            req = (await bika.api.search.utils.getComicsByCategories(searchContent, undefined, undefined, sac.signal)).docs
            break
          case 'tag':
            req = (await bika.api.search.utils.getComicsByTag(searchContent, undefined, undefined, sac.signal)).docs
            break
          default:
            req = (await bika.api.search.utils.getComicsByKeyword(inputText, undefined, undefined, sac.signal)).docs
            break
        }
        break
      case 'jm':
        switch (searchMode.value) {
          case 'uploader':
            req = await jm.api.search.utils.byKeyword(searchContent, undefined, undefined, sac.signal)
            break
          case 'jid':
            req = await getByJid(searchContent, sac.signal)
            break
          case 'pid':
            req = await getByPic(searchContent, sac.signal)
            break
          case 'vid':
            // req = await getByCos(searchContent, sac.signal)
            break
          case 'category':
            req = await jm.api.search.utils.byCategory(searchContent, undefined, undefined, sac.signal)
            break
          case 'tag':
            req = await jm.api.search.utils.byCategory(searchContent, undefined, undefined, sac.signal)
            break
          default:
            req = await jm.api.search.utils.byKeyword(inputText, undefined, undefined, sac.signal)
            break
        }
        break
    }
    return req.map(v => v!.toUniComic())
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


const _zi = useZIndex(show)
const zIndex = computed(() => $props.zIndex ?? _zi[0].value)

</script>

<template>
  <Teleport to="#popups">
    <AnimatePresence>
      <motion.div @click="show = false" v-if="show" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }"
        class="bg-(--van-black) w-screen h-screen fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="show" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))]">
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
            <VanCell v-for="think of thinkList" :title="think.title" :value="think.author.join(',&nbsp;')" @click="() => {
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
