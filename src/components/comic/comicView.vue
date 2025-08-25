<script setup lang='ts'>
import { ContentPage } from '@/stores/content'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/virtual'
import 'swiper/css/zoom'
import { Swiper as SwiperClass } from 'swiper'
import { Virtual, Zoom, HashNavigation, Keyboard } from 'swiper/modules'
import { computed, nextTick, shallowRef } from 'vue'
import { useConfig } from '@/config'
import { LoadingMask } from './comicView.helper'
import { entries, inRange, isEmpty } from 'lodash-es'
import { ArrowBackIosNewRound, FullscreenExitRound } from '@vicons/material'
import { motion } from 'motion-v'
import { watch } from 'vue'
import { imageQualityMap } from '@/utils/translator'
import { LikeOutlined } from '@vicons/antd'
import { bika } from '@/api/bika'
import { onBeforeRouteLeave } from 'vue-router'
import { uni } from '@/api/union'
const $props = withDefaults(defineProps<{
  comic: ContentPage
  nowEp?: uni.comic.Ep
  images: (() => PromiseLike<string>)[]
  startPosition?: number
}>(), {
  startPosition: 0,
  isBlock: false,
})
const isFullScreen = defineModel<boolean>('isFullScreen', { default: false })
onBeforeRouteLeave(() => {
  if (isFullScreen.value) {
    isFullScreen.value = false
    return false
  }
})
const $emit = defineEmits<{
  firstSlide: []
  lastSlide: []
  click: []
  reloadPages: []
}>()
const config = useConfig()
const swiper = shallowRef<SwiperClass>()

const pageOnIndex = shallowRef($props.startPosition)
const selectPage = shallowRef(pageOnIndex.value)
watch(pageOnIndex, pageOnIndex => selectPage.value = pageOnIndex)
let initTimes = 0
const onInit = async () => {
  if (!pageOnIndex.value) return
  const id = setInterval(async () => {
    initTimes++
    if (initTimes > 10) return clearInterval(id)
    swiper.value?.slideTo(pageOnIndex.value, 0)
    if (pageOnIndex.value == pageOnIndex.value) clearInterval(id)
  }, 1)
}


const goToSlide = (offset: 1 | -1, emitEvent: () => void) => {
  const targetIndex = pageOnIndex.value + offset
  if (inRange(targetIndex, 0, $props.images.length)) {
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

const comic = computed(() => <uni.comic.Comic | undefined>(<any>$props.comic.preload.value)?.toUniComic())
const comicDetail = computed(() => $props.comic.detail.content.data.value)
const uniDetail = computed(() => <uni.comic.Comic | undefined>(<any>comicDetail.value)?.toUniComic())

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
      if (!isDragging && touchEndTime - touchStartTime < THRESHOLD && tapEventTimerId == 0) {
        tapEventTimerId = <any>setTimeout(() => {
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

const freeMode = shallowRef(false)
watch(freeMode, async () => {
  await nextTick()
  swiper.value?.update()
}, { flush: 'post' })
</script>

<template>
  <NSpin :show="isEmpty(images)" class="size-full *:first:size-full relative bg-black">
    <Swiper :modules="[Virtual, Zoom, HashNavigation, Keyboard]" @swiper="sw => swiper = sw" :initialSlide="pageOnIndex"
      :slidesPerView="config['app.read.twoImage'] ? 2 : 1" @slideChange="sw => pageOnIndex = sw.activeIndex"
      class="size-full" @double-tap="handleDbTap" @touch-move="handleTouchmove" @touch-end="handleTouchend"
      :virtual="{ enabled: true, addSlidesAfter: config['app.read.preloadImageNumbers'], addSlidesBefore: config['app.read.preloadImageNumbers'] }"
      @init="onInit" zoom keyboard direction="horizontal" v-if="!freeMode"
      @touch-start="handleTouchstart">
      <SwiperSlide v-for="(image, index) of images" :key="index" :virtualIndex="index" :data-hash="index + 1"
        class="overflow-hidden">
        <Await :promise="image" auto-load v-slot="{ result: image }">
          <Image fetchpriority="high" fit="contain" :src="image" class="swiper-zoom-container">
            <template #loading>
              <LoadingMask :index="index + 1" />
            </template>
            <template #fail>
              <LoadingMask :index="index + 1" />
            </template>
          </Image>
        </Await>
      </SwiperSlide>
    </Swiper>
    <Image class="absolute size-full top-0" fit="contain" :src="comic?.cover" v-if="isEmpty(images)" />
    <div
      class="absolute z-2 top-0 left-0 w-full h-full pointer-events-none *:pointer-events-auto *:w-10 *:absolute *:top-0 *:h-full">
      <div class="left-0" @click.stop="goPrev" />
      <div class="right-0" @click.stop="goNext" />
    </div>
    <AnimatePresence>
      <motion.div v-if="isShowMenu && isFullScreen" :initial="{ translateY: '-100%', opacity: 0 }"
        class="absolute bg-[linear-gradient(rgba(0,0,0,0.5)_50%,_transparent)] z-3 top-0 w-full text-white flex h-14 items-center"
        :exit="{ translateY: '-100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
        :transition="{ ease: 'easeInOut', duration: 0.2 }">
        <NButton class="!text-2xl !mx-3" text color="#fff" @click="isFullScreen = false">
          <NIcon>
            <ArrowBackIosNewRound />
          </NIcon>
        </NButton>
        <div class="w-1/2 text-nowrap flex flex-col">
          <span class="text-[1rem] van-ellipsis">{{ comic?.title }}</span>
          <span class="text-xs ml-1 van-ellipsis">{{ nowEp?.title }}</span>
        </div>
        <div class="w-full h-full flex items-center justify-around">
          <VanBadge :content="uniDetail?.likeNumber" class="**:!border-none" color="transparent">
            <NIcon size="30px">
              <LikeOutlined />
            </NIcon>
          </VanBadge>
        </div>
      </motion.div>
      <motion.div v-if="isShowMenu && isFullScreen" :initial="{ translateY: '100%', opacity: 0 }"
        :exit="{ translateY: '100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
        :transition="{ ease: 'easeInOut', duration: 0.2 }"
        class="absolute backdrop-blur-md bg-black/50 z-3 bottom-0 w-full text-white flex h-14 items-center justify-center">
        <Var :value="{ showNum: false }" v-slot="{ value }">
          <VanSlider v-model="selectPage" @change="v => pageOnIndex == v || swiper?.slideTo(v, 0)" :min="0"
            :max="images.length > 1 ? images.length - 1 : selectPage + 1" @drag-start="value.showNum = true"
            @drag-end="value.showNum = false" class="!w-[calc(100%-1rem)] !absolute !top-0" inactive-color="#8888">
            <template #button>
              <div
                class="flex justify-center relative items-center w-3 h-2.5 rounded-sm bg-(--van-background-2) shadow-md">
                <div v-if="value.showNum"
                  class="slider-button-number w-6 absolute text-center p-[2px] z-200000 bottom-[calc(var(--spacing)*4+10px)] bg-black/50 rounded-lg text-white h-5 before:content-[''] before:bg-black/50 before:absolute before:left-1/2 before:bottom-0 before:-translate-x-1/2 before:translate-y-1/2 before:rotate-45 before:!size-2">
                  {{ selectPage + 1 }}
                </div>
              </div>
            </template>
          </VanSlider>
          <div class="absolute -top-3 -translate-y-full left-2">{{ pageOnIndex + 1 }}&nbsp;/&nbsp;{{ images.length }}
          </div>
        </Var>
        <div class="w-full *:!flex *:items-center *:justify-center flex gap-4 justify-end pr-4">
          <div>
            <NButton text color="#fff">
              选集
            </NButton>
          </div>
          <div>
            <VanPopover
              :actions="entries(imageQualityMap).map(v => ({ text: imageQualityMap[<bika.ImageQuality>v[0]], label: v[0] }))"
              @select="q => config['bika.read.imageQuality'] = q.label" placement="top-end" theme="dark">
              <template #reference>
                <NButton text color="#fff">
                  {{ imageQualityMap[config['bika.read.imageQuality']] }}
                </NButton>
              </template>
            </VanPopover>
          </div>
          <div>
            <NButton class="!text-3xl " text color="#fff" @click="isFullScreen = false">
              <NIcon>
                <FullscreenExitRound />
              </NIcon>
            </NButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </NSpin>
</template>
<style scoped lang='scss'>
:deep(*) {
  --van-popover-dark-background: rgba(0, 0, 0, 0.5) !important;

  &.van-popover__content {
    backdrop-filter: blur(10px);
  }
}
</style>