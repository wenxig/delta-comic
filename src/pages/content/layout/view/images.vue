<script setup lang='ts'>
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/virtual'
import 'swiper/css/zoom'
import { Swiper as SwiperClass } from 'swiper'
import { Virtual, Zoom, HashNavigation, Keyboard } from 'swiper/modules'
import { computed, nextTick, shallowRef } from 'vue'
import { inRange } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { ArrowBackIosNewRound, FullscreenExitRound } from '@vicons/material'
import { LikeOutlined } from '@vicons/antd'
import { AnimatePresence, motion } from 'motion-v'
import { watch } from 'vue'
import {  useRoute } from 'vue-router'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import ForkSelect from '@/components/forkSelect.vue'
import { imageViewConfig } from '@/config'
const $props = defineProps<{
  page: uni.content.ContentImagePage
}>()
const $emit = defineEmits<{
  firstSlide: []
  lastSlide: []
  click: []
  reloadPages: []
}>()

const isFullScreen = defineModel<boolean>('isFullScreen', { required: true })

const config = Store.useConfig().$load(imageViewConfig)

const swiper = shallowRef<SwiperClass>()

const images = computed(() => $props.page.images.content.data.value ?? [])
const comic = computed(() => $props.page.union.value!)

const pageOnIndex = shallowRef(0)
const selectPage = shallowRef(pageOnIndex.value)
watch(pageOnIndex, pageOnIndex => selectPage.value = pageOnIndex)
let initTimes = 0
const onInit = async () => {
  if (!pageOnIndex.value) return
  const id = setInterval(async () => {
    initTimes++
    if (initTimes > 10) return clearInterval(id)
    swiper.value?.slideTo(pageOnIndex.value, 0)
    if (pageOnIndex.value === pageOnIndex.value) clearInterval(id)
  }, 1)
}


const goToSlide = (offset: 1 | -1, emitEvent: () => void) => {
  const targetIndex = pageOnIndex.value + offset
  if (inRange(targetIndex, 0, images.value.length)) {
    offset < 0 ? swiper.value?.slidePrev() : swiper.value?.slideNext()
  } else {
    emitEvent()
  }
}
const goPrev = () => goToSlide(-1, () => $emit('firstSlide'))
const goNext = () => goToSlide(1, () => $emit('lastSlide'))


defineExpose({
  index: pageOnIndex,
  toIndex(index: number) {
    swiper.value?.slideTo(index)
  }
})
const isShowMenu = shallowRef(true)

const { handleTouchend, handleTouchmove, handleTouchstart, handleDbTap } = (() => {
  let touchStartTime = 0
  let touchStartX = 0
  let touchStartY = 0
  let isDragging = false
  let tapEventTimerId = 0

  const THRESHOLD = 200 // 单击的时间阈值（毫秒）
  const MOVE_THRESHOLD = 30 // 拖动的滑动距离阈值
  return {
    handleTouchstart: (_swiper: SwiperClass, e: TouchEvent | PointerEvent | MouseEvent) => {
      if (e instanceof TouchEvent) {
        var pageX = e.touches[0].pageX
        var pageY = e.touches[0].pageY
      } else {
        var pageX = e.pageX
        var pageY = e.pageY
      }
      touchStartTime = Date.now() // 记录触摸开始的时间
      touchStartX = pageX
      touchStartY = pageY
      isDragging = false
    },
    handleTouchmove: (_swiper: SwiperClass, e: TouchEvent | PointerEvent | MouseEvent) => {
      if (e instanceof TouchEvent) {
        var pageX = e.touches[0].pageX
        var pageY = e.touches[0].pageY
      } else {
        var pageX = e.pageX
        var pageY = e.pageY
      }
      const distanceX = Math.abs(pageX - touchStartX)
      const distanceY = Math.abs(pageY - touchStartY)

      // 如果滑动距离超过阈值，则认为是拖动
      if (distanceX > MOVE_THRESHOLD || distanceY > MOVE_THRESHOLD) {
        isDragging = true
      }
    },
    handleTouchend: () => {
      const touchEndTime = Date.now()
      // 判断是否为单击
      if (!isDragging && touchEndTime - touchStartTime < THRESHOLD && tapEventTimerId === 0) {
        tapEventTimerId = <number><any>setTimeout(() => {
          tapEventTimerId = 0
          $emit('click')
          isShowMenu.value = !isShowMenu.value
          // console.log('单击', tapEventTimerId)
        }, 300)
      }
    },
    handleDbTap: () => {
      clearTimeout(tapEventTimerId)
      tapEventTimerId = 0
      // console.log("双击", tapEventTimerId)
    }
  }
})()

const nowEp = computed(() => $props.page.eps.content.data.value?.find(v => v.index === $props.page.ep))
const isShowEpSelectPopup = shallowRef(false)
const $route = useRoute()
const nowEpId = $route.params.ep.toString()
const handleEpSelect = (preload: uni.item.RawItem) =>
  Utils.eventBus.SharedFunction.call('routeToContent', preload.contentType, preload.id, preload.thisEp.index, <any>preload)

const isShowOriginSelect = shallowRef(false)

const refreshFlag = shallowRef(true)
const refreshImages = async () => {
  refreshFlag.value = false
  await nextTick()
  refreshFlag.value = true
  await nextTick()
  swiper.value?.update()
}
defineSlots<{
  bottomBar(): any
}>()
const union = computed(() => $props.page.union.value!)

const isLiked = shallowRef(union.value?.isLiked ?? false)
const likeSignal = new Utils.request.SmartAbortController()
const handleLike = async () => {
  likeSignal.abort()
  try {
    union.value.like(likeSignal.signal)
      .then(v => isLiked.value = v)
  } catch (error) {
    console.error('liked fail')
  }
}
</script>

<template>
  <NSpin :show="isEmpty(images)" class="size-full *:first:size-full relative bg-black pt-safe">
    <Swiper :modules="[Virtual, Zoom, HashNavigation, Keyboard]" @swiper="sw => swiper = sw" :initialSlide="pageOnIndex"
      :slidesPerView="config.doubleImage ? 2 : 1" @slideChange="sw => pageOnIndex = sw.activeIndex" class="size-full"
      @double-tap="handleDbTap" @touch-move="handleTouchmove" @touch-end="handleTouchend"
      :virtual="{ enabled: true, addSlidesAfter: config.preloadImages, addSlidesBefore: config.preloadImages }"
      @init="onInit" zoom keyboard direction="horizontal" @touch-start="handleTouchstart">
      <SwiperSlide v-for="(image, index) of images" :key="index" :virtualIndex="index" :data-hash="index + 1"
        class="overflow-hidden">
        <Comp.Image fetchpriority="high" fit="contain" :src="image" class="swiper-zoom-container" v-if="refreshFlag">
          <template #loading>
            <div class="size-screen text-center flex justify-center items-center"> <span class="text-3xl text-white">
                {{ index + 1 }} </span></div>
          </template>
          <template #fail>
            <div class="size-screen text-center flex justify-center items-center"> <span class="text-3xl text-white">
                {{ index + 1 }} </span></div>
          </template>
        </Comp.Image>
      </SwiperSlide>
    </Swiper>
    <Comp.Image ref="imgIns" class="absolute size-full top-0" fit="contain" :src="comic.$cover"
      v-if="isEmpty(images)" />
    <div
      class="absolute z-2 top-0 left-0 w-full h-full pointer-events-none *:pointer-events-auto *:w-10 *:absolute *:top-0 *:h-full">
      <div class="left-0" @click.stop="goPrev" />
      <div class="right-0" @click.stop="goNext" />
    </div>
    <AnimatePresence>
      <motion.div v-if="isShowMenu && isFullScreen" :initial="{ translateY: '-100%', opacity: 0 }"
        class="absolute bg-[linear-gradient(rgba(0,0,0,0.5)_50%,_transparent)] z-3 top-0 w-full text-white flex h-14 items-center pt-safe"
        :exit="{ translateY: '-100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
        :transition="{ ease: 'easeInOut', duration: 0.2 }">
        <NButton class="text-2xl! mx-3!" text color="#fff" @click="$router.back()">
          <NIcon>
            <ArrowBackIosNewRound />
          </NIcon>
        </NButton>
        <div class="w-1/2 text-nowrap flex flex-col">
          <span class="text-[1rem] van-ellipsis">{{ comic.title }}</span>
          <span class="text-xs ml-1 van-ellipsis">{{ nowEp?.name }}</span>
        </div>
        <div class="w-full h-full flex items-center justify-around">
          <Comp.ToggleIcon padding size="30px" v-model="isLiked" @click="handleLike" :icon="LikeOutlined" />
          <FavouriteSelect :item="page.union.value" v-if="page.union.value" plain />
        </div>
      </motion.div>
      <motion.div v-if="isShowMenu && isFullScreen" :initial="{ translateY: '100%', opacity: 0 }"
        :exit="{ translateY: '100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
        :transition="{ ease: 'easeInOut', duration: 0.2 }"
        class="absolute use-backdrop-blur-md bg-black/50 z-3 bottom-0 w-full text-white flex h-14 items-center justify-center">
        <Comp.Var :value="{ showNum: false }" v-slot="{ value }">
          <VanSlider v-model="selectPage" @change="v => pageOnIndex === v || swiper?.slideTo(v, 0)" :min="0"
            :max="images.length > 1 ? images.length - 1 : selectPage + 1" @drag-start="value.showNum = true"
            @drag-end="value.showNum = false" class="w-[calc(100%-1rem)]! absolute! top-0!" inactive-color="#8888">
            <template #button>
              <div
                class="flex justify-center relative items-center w-3 h-2.5 rounded-sm bg-(--van-background-2) shadow-md">
                <div v-if="value.showNum"
                  class="slider-button-number w-6 absolute text-center p-0.5 z-200000 bottom-[calc(var(--spacing)*4+10px)] bg-black/50 rounded-lg text-white h-5 before:content-[''] before:bg-black/50 before:absolute before:left-1/2 before:bottom-0 before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45 before:size-2!">
                  {{ selectPage + 1 }}
                </div>
              </div>
            </template>
          </VanSlider>
          <div class="absolute -top-3 -translate-y-full left-2">{{ pageOnIndex + 1 }}&nbsp;/&nbsp;{{ images.length }}
          </div>
        </Comp.Var>
        <div class="w-full *:!flex *:items-center *:justify-center flex gap-4 justify-end pr-4">
          <slot name="bottomBar" />
          <div>
            <NButton text color="#fff" @click="isShowOriginSelect = true">
              数据源
            </NButton>
          </div>
          <div v-if="(page.eps.content.data.value?.length ?? 1) > 1">
            <NButton text color="#fff" @click="isShowEpSelectPopup = true">
              选集
            </NButton>
          </div>
          <div>
            <NButton class="!text-3xl " text color="#fff" @click="$router.back()">
              <NIcon>
                <FullscreenExitRound />
              </NIcon>
            </NButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    <Comp.Popup round position="bottom" class="h-[70vh] flex flex-col !bg-black/50 backdrop-blur"
      v-model:show="isShowEpSelectPopup" theme='dark'>
      <div class="w-full h-10 pt-2 pl-8 flex items-center font-bold text-lg text-white">选集</div>
      <Comp.List class="w-full h-full" :source="{ data: page.eps.content, isEnd: true }" :itemHeight="40"
        v-slot="{ data: { item: ep, index }, height }" :data-processor="v => v.toReversed()" ref="epSelList">
        <VanCell clickable @click="handleEpSelect({ ...page.union.value!.toJSON(), thisEp: ep.toJSON() })"
          :title="ep.name || `第${page.eps.content.data.value!.length - index}话`"
          :title-class="['text-white', nowEpId === ep.index && 'font-bold !text-(--p-color)']"
          class="w-full flex items-center !bg-transparent" :style="{ height: `${height}px !important` }">
        </VanCell>
      </Comp.List>
    </Comp.Popup>
    <ForkSelect @change="refreshImages()" v-model:show="isShowOriginSelect"
      class="!bg-black/10 backdrop-blur text-white" />
    <AnimatePresence>
      <motion.div v-if="!isShowMenu || !isFullScreen" :initial="{ opacity: 0, translateY: '8%' }"
        :animate="{ opacity: 1, translateY: '0%' }" :exit="{ opacity: 0, translateY: '8%' }"
        :transition="{ duration: 0.2 }" class="absolute bottom-0 left-0 w-full z-2 pointer-events-auto">
        <VanSlider v-model="pageOnIndex" :min="0" class="!w-full !absolute !bottom-0"
          :max="images.length > 1 ? images.length - 1 : 0" disabled>
          <template #button>
            <span></span>
          </template>
        </VanSlider>
      </motion.div>
    </AnimatePresence>
  </NSpin>
</template>
<style scoped lang='css'>
:deep(*) {
  --van-popover-dark-background: rgba(0, 0, 0, 0.5) !important;

  &.van-popover__content {
    backdrop-filter: blur(10px);
  }
}
</style>