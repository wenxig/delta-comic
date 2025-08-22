<script setup lang='ts'>
import { useComicStore } from '@/stores/comic'
import { ArrowBackRound, ArrowForwardIosOutlined, DrawOutlined, FullscreenRound, KeyboardArrowDownRound, PlayArrowRound, PlusRound } from '@vicons/material'
import { motion } from 'motion-v'
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { createReusableTemplate } from '@vueuse/core'
import { NScrollbar } from 'naive-ui'
import { toCn } from '@/utils/translator'
import { useRoute, useRouter } from 'vue-router'
import ComicView from '@/components/comic/comicView.vue'
import symbol from '@/symbol'
import { uni } from '@/api/union'
import { useConfig } from '@/config'
import { useAppStore } from '@/stores/app'
const $route = useRoute()
const $router = useRouter()
const nowPage = computed(() => comic.now)
const comicId = $route.params.id.toString()
const eps = computed(() => nowPage.value?.eps.content.data.value)
const $props = defineProps<{
  tags: string[]
  categories: string[]
  avatar?: uni.image.Image_
  idPrefix: string
  getEps: (epId: string | number, signal?: AbortSignal) => Promise<uni.image.Image[]>
  isR18g?: boolean
  defaultEp: string | number
}>()
const epId = computed({
  get() {
    console.log('epId', $route.params.epId.toString() || $props.defaultEp)
    return $route.params.epId.toString() || $props.defaultEp
  },
  set(epId) {
    console.log('set', `/comic/${comicId}/${epId}`)
    return $router.force.replace(`/comic/${comicId}/${epId}`)
  }
})
const selectEp = computed(() => eps.value?.find(ep => ep.toUniEp().id == epId.value)?.toUniEp())
const comic = useComicStore()
const detail = computed(() => nowPage.value?.detail.content.data.value)
const preload = computed(() => nowPage.value?.preload.value?.toUniComic())
const pid = computed(() => nowPage.value?.pid.content.data.value)
const showTitleFull = shallowRef(false)
const [TitleTemp, TitleComp] = createReusableTemplate()
const isScrolled = shallowRef(false)

const epPageContent = shallowRef<(() => Promise<string>)[]>([])


const config = useConfig()
watch(() => [epId.value, config['bika.read.imageQuality']], async (_, __, onCancel) => {
  const signal = new AbortController()
  onCancel(() => signal.abort())
  const result = await $props.getEps(epId.value, signal.signal)
  epPageContent.value = result.map(img => (async () => await img.getUrl()))
}, { immediate: true })

const appStore = useAppStore()
const view = useTemplateRef('view')

const isShowAuthorSelect = shallowRef(false)
const previewUser = useTemplateRef('previewUser')


const scrollbar = useTemplateRef('scrollbar')
const epSelList = useTemplateRef('epSelList')
const isShowEpSelectPopup = shallowRef(false)
const openEpSelectPopup = async () => {
  scrollbar.value?.scrollTo(0, 0)
  isShowEpSelectPopup.value = true
  await nextTick()
  epSelList.value?.listInstance?.scrollTo({
    index: eps.value?.toReversed().findIndex(ep => ep.toUniEp().id == epId.value)
  })
}

defineSlots<{
  userInfo: () => void
  id: () => void
  action: () => void
  searchPopup: (props: { previewUser: typeof previewUser['value'] }) => void
  commitView: () => void
}>()
</script>

<template>
  <NScrollbar ref="scrollbar" class="*:w-full !h-full bg-(--van-background-2)"
    :style="{ '--van-background-2': isR18g ? 'color-mix(in oklab, var(--nui-error-color-hover) 5%, transparent)' : 'var(--van-white)' }"
    v-if="nowPage">
    <div class="bg-black text-white h-[30vh] relative flex justify-center">
      <div
        class="absolute bg-[linear-gradient(rgba(0,0,0,0.9),transparent)] z-3 pointer-events-none *:pointer-events-auto top-0 w-full flex h-14 items-center">
        <VanSticky>
          <div class="h-14 transition-colors flex items-center w-screen"
            :class="[isScrolled ? ' bg-(--nui-primary-color)' : 'bg-transparent']">
            <NIcon color="white" size="1.5rem" class="ml-5" @click="$router.back()">
              <ArrowBackRound />
            </NIcon>
            <NIcon color="white" size="1.5rem" class="ml-5" @click="$router.force.push('/')">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M19 8.71l-5.333-4.148a2.666 2.666 0 0 0-3.274 0L5.059 8.71a2.665 2.665 0 0 0-1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.2c0-.823-.38-1.6-1.03-2.105">
                  </path>
                  <path d="M16 15c-2.21 1.333-5.792 1.333-8 0"></path>
                </g>
              </svg>
            </NIcon>
            <div class="size-full text-[16px] flex items-center justify-center transition-opacity"
              :class="[isScrolled || 'opacity-0']">
              <NIcon size="2.5rem">
                <PlayArrowRound />
              </NIcon>
              返回顶部
            </div>
          </div>
        </VanSticky>
      </div>
      <Teleport to="#cover" :disabled="!appStore.isFullScreen">
        <ComicView ref="view" :comic="nowPage" v-model:isFullScreen="appStore.isFullScreen" :images="epPageContent"
          :nowEpOrder="epId" class="view" />
      </Teleport>
      <!-- small size menu -->
      <VanRow class="absolute bottom-0 w-full z-2 bg-[linear-gradient(transparent,rgba(0,0,0,0.9))]">
        <VanSlider :modelValue="view?.index" :min="0" inactive-color="black" class="!w-full !absolute !bottom-0"
          :max="epPageContent.length > 1 ? epPageContent.length - 1 : view?.index ?? 0 + 1">
          <template #button>
            <span></span>
          </template>
        </VanSlider>
        <VanCol span="1" offset="21">
          <NButton class="!text-3xl" @click="appStore.isFullScreen = true" text color="#fff">
            <NIcon>
              <FullscreenRound />
            </NIcon>
          </NButton>
        </VanCol>
      </VanRow>
    </div>
    <VanTabs shrink swipeable sticky :offset-top="56" background="var(--van-background-2)"
      @scroll="({ isFixed }) => isScrolled = isFixed">
      <VanTab class="min-h-full relative van-hairline--top bg-(--van-background-2)" title="简介" name="info">
        <Content :source="nowPage.detail.content">
          <div class="flex items-center mt-3" @click="isShowAuthorSelect = true">
            <Image class="size-8.5 shrink-0 mx-3" :src="avatar" v-if="avatar" round />
            <div class="flex flex-col w-full text-nowrap">
              <slot name="userInfo" />
            </div>
            <NButton round type="primary" class="!absolute right-3" size="small" @click.stop>
              <template #icon>
                <NIcon>
                  <PlusRound />
                </NIcon>
              </template>
              关注
            </NButton>
            <Popup v-model:show="isShowAuthorSelect" round class="min-h-1/3" position="bottom">
              <slot name="searchPopup" :previewUser="previewUser" />
              <PreviewUser ref="previewUser" />
              <VanCell v-for="author of preload?.author" center :title="author" is-link
                @click="$router.force.push(`/search?keyword=${author}&mode=keyword`)">
                <template #icon>
                  <NIcon size="30px" class="mr-1.5">
                    <DrawOutlined />
                  </NIcon>
                </template>
              </VanCell>
            </Popup>
          </div>

          <div class="w-[95%] mx-auto mt-2">
            <div class="flex relative h-fit">
              <div class="text-[17px] font-[460] w-[89%] relative">
                <TitleTemp>
                  <div class="text-xs mt-1 font-light flex text-(--van-text-color-2) *:flex *:items-center gap-1">
                    <slot name="id" />
                  </div>
                </TitleTemp>
                <AnimatePresence>
                  <motion.div :initial="{ opacity: 0 }" :exit="{ opacity: 0 }" key="info" :animate="{ opacity: 1 }"
                    v-if="!showTitleFull" class="flex flex-col absolute top-0 van-ellipsis w-full">
                    <span @click="showTitleFull = !showTitleFull">
                      {{ preload?.title }}
                    </span>
                    <TitleComp />
                  </motion.div>
                </AnimatePresence>
                <NCollapseTransition :show="showTitleFull" class="!w-[calc(100%+2rem)]">
                  <span @click="showTitleFull = !showTitleFull" class="w-[calc(100%-2rem)]">
                    {{ preload?.title }}
                  </span>
                  <TitleComp />
                  <div class="flex  font-light text-(--van-text-color-2) justify-start text-xs mt-0.5">
                    <div class="mr-2">
                      {{ idPrefix }}{{ pid }}
                    </div>
                  </div>
                  <Text class="font-[350]  mt-1 text-(--van-text-color-2) justify-start text-xs">
                    {{ detail?.description.replaceAll(symbol.bikaR18gNotice, '') }}
                  </Text>
                  <div class=" mt-6 flex flex-wrap gap-2.5 *:!px-3 **:!text-xs">
                    <NButton tertiary round
                      v-for="category of categories.toSorted((a, b) => b.length - a.length).filter(Boolean)"
                      type="primary" size="small"
                      @click="$router.force.push({ path: `/search`, query: { keyword: encodeURIComponent(category), mode: 'category' } })">
                      {{ toCn(category) }}
                    </NButton>
                    <NButton tertiary round v-for="tag of tags.toSorted((a, b) => b.length - a.length).filter(Boolean)"
                      class="!text-(--van-gray-7)" size="small"
                      @click="$router.force.push({ path: `/search`, query: { keyword: encodeURIComponent(tag), mode: 'tag' } })">
                      {{ toCn(tag) }}
                    </NButton>
                  </div>
                </NCollapseTransition>
              </div>
              <NIcon size="2rem" color="var(--van-text-color-3)" class="absolute -top-0.5 -right-1 transition-transform"
                :class="[showTitleFull && '!rotate-180']" @click="showTitleFull = !showTitleFull">
                <KeyboardArrowDownRound />
              </NIcon>
            </div>
            <!-- action bar -->
            <div class="mt-8 mb-4 flex justify-around" v-if="preload">
              <slot name="action" />
            </div>
            <!-- ep select -->
            <div class="relative mb-4 w-full flex items-center rounded pl-3 py-2 van-haptics-feedback"
              :class="[isR18g ? 'bg-(--van-gray-1)/70' : 'bg-(--van-gray-2)']" v-if="eps && eps.length > 1"
              @click="openEpSelectPopup">
              <span>选集</span>
              <span class="mx-0.5">·</span>
              <span class="max-w-1/2 van-ellipsis">{{ selectEp?.title || `第${selectEp?.order}话` }}</span>
              <span class="absolute right-2 text-xs text-(--van-text-color-2) flex items-center">
                <span>{{ selectEp?.order }}/{{ eps.length }}</span>
                <NIcon size="12px" class="ml-1">
                  <ArrowForwardIosOutlined />
                </NIcon>
              </span>
            </div>
            <Popup round position="bottom" class="h-[70vh] flex flex-col" v-if="nowPage"
              v-model:show="isShowEpSelectPopup">
              <div class="w-full h-10 pt-2 pl-8 flex items-center font-bold text-lg">选集</div>
              <List class="w-full h-full"
                :source="{ data: nowPage.eps.content.useProcessor(v => v.map(v => v.toUniEp())), isEnd: true }"
                :itemHeight="40" v-slot="{ data: { item: ep }, height }" :data-processor="v => v.toReversed()"
                ref="epSelList">
                <VanCell class="w-full flex items-center van-hairline--top pl-5" clickable @click="epId = ep.id"
                  :title-class="[epId == ep.id && 'font-bold !text-(--nui-primary-color)']"
                  :style="{ height: `${height}px !important` }" :title="ep.title || `第${ep.order}话`">
                </VanCell>
              </List>
            </Popup>
          </div>
          <!-- recommend -->
          <div class="van-hairline--top w-full *:bg-transparent" v-if="nowPage.recommendComics.content.data.value">
            <ComicCard v-for="comic of nowPage.recommendComics.content.data.value" :comic :height="140" />
          </div>
        </Content>
      </VanTab>

      <VanTab class="min-h-full van-hairline--top" title="评论" name="comment">
        <template #title>
          <span>评论</span>
          <span class="!text-xs ml-0.5 font-light">{{ detail?.toUniComic().commentNumber ?? '' }}</span>
        </template>
        <slot name="commitView" />
      </VanTab>
    </VanTabs>
  </NScrollbar>
</template>