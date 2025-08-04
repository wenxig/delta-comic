<script setup lang='ts'>
import { ComicPage } from '@/stores/comic'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/virtual'
import 'swiper/css/zoom'
import { Swiper as SwiperClass } from 'swiper'
import { Virtual, Zoom, HashNavigation, } from 'swiper/modules'
import { computed, shallowRef } from 'vue'
import { useConfig } from '@/config'
import { Page } from '@/api/bika/comic'
import { LoadingMask } from './comicView.helper'
import { inRange, isEmpty } from 'lodash-es'
import { PromiseContent } from '@/utils/data'
const $props = withDefaults(defineProps<{
  comic: ComicPage
  nowEpId: number
  pages: Page[]
  startPosition?: number
}>(), {
  startPosition: 0,
  isBlock: false,
})
const $emit = defineEmits<{
  firstSlide: []
  lastSlide: []
}>()
const config = useConfig()
const swiper = shallowRef<SwiperClass>()

const pageOnIndex = shallowRef($props.startPosition)
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

const images = computed(() => $props.pages?.map(v => v.$media.getUrl()) ?? [])

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
</script>

<template>
  <div class="w-full h-full relative">
    <Swiper :modules="[Virtual, Zoom, HashNavigation]" @swiper="sw => swiper = sw" :initialSlide="pageOnIndex"
      :slidesPerView="config['bika.read.twoImage'] ? 2 : 1" @slideChange="sw => pageOnIndex = sw.activeIndex"
      class="w-full h-full bg-black" virtual @init="onInit" zoom :dir="config['bika.read.rtl'] ? 'rtl' : 'ltr'"
      :direction="config['bika.read.vertical'] ? 'vertical' : 'horizontal'" v-if="!isEmpty(images)">
      <SwiperSlide v-for="(image, index) of images" :key="index" :virtualIndex="index" :data-hash="index + 1"
        class="overflow-hidden">
        <Image fetchpriority="high"  fit="contain" :src="image"
          class="w-full h-full swiper-zoom-container">
          <template #loading>
            <LoadingMask :index="index + 1" />
          </template>
          <template #fail>
            <LoadingMask :index="index + 1" />
          </template>
        </Image>
      </SwiperSlide>
    </Swiper>
    <div
      class="absolute z-2 top-0 left-0 w-full h-full pointer-events-none *:pointer-events-auto *:w-10 *:absolute *:top-0 *:h-full">
      <div class="left-0" @click="goPrev" />
      <div class="right-0" @click="goNext" />
    </div>
  </div>
</template>