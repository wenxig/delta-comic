<script setup lang='ts' generic="T extends (bika.comic.BaseComic | jm.comic.BaseComic| uni.comic.Comic<any>)">
import Image from '../image.vue'
import { computed, StyleValue, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useComicStore } from '@/stores/comic'
import { DrawOutlined } from '@vicons/material'
import { LikeOutlined } from '@vicons/antd'
import { bika } from '@/api/bika'
import { jm } from '@/api/jm'
import { uni } from '@/api/union'
const $props = withDefaults(defineProps<{
  comic?: T
  height: number | string | false
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
  mode?: 'push' | 'replace'
  hideEpInfo?: boolean
  hideViewNumber?: boolean

  class?: any
  style?: StyleValue
}>(), {
  mode: 'push',
  type: 'default'
})
const $emit = defineEmits<{
  click: []
  resize: [comic: T, height: number]
}>()
const comic = computed(() => $props.comic && <uni.comic.Comic<T>>$props.comic.toUniComic())
const $router = useRouter()
const comicStore = useComicStore()
const handleClick = () => {
  if (!comic.value) return
  $emit('click')
  comicStore.$load(comic.value.id, comic.value)
  $router.force[$props.mode](`/comic/${comic.value.id}`)
}
const cover = useTemplateRef('cover')
const imageRatio = computed(() => cover.value?.isLoaded ? 'unset' : `${comic.value?.cover.width || 3} / ${comic.value?.cover.height || 4}`)
</script>

<template>
  <template v-if="comic">
    <button ref="container" @click="handleClick" :disabled v-if="type != 'small'"
      class="overflow-hidden w-full van-hairline--top-bottom flex bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-0 items-center"
      :style="[{ height: height == false ? 'auto' : `${height}px` }, style]"
      :class="[{ 'van-haptics-feedback': !disabled }, $props.class]">
      <Image :src="comic.cover" v-if="type == 'big' && !$slots.cover"
        class="blur-lg absolute top-0 left-0 w-full h-full" fit="cover" />
      <Image :src="comic.cover" class="ml-[5%] !rounded-lg image-size h-[90%] z-2" fit="contain" ref="cover" />
      <div class="w-[62%] min-h-[98%] flex absolute right-[2%] flex-col *:text-justify">
        <span class="mt-[3%] van-ellipsis">{{ comic.title }}</span>
        <slot />
        <div class="absolute bottom-2 text-(--van-text-color-2) text-sm">
          <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
            <NIcon color="var(--van-text-color-2)" size="14px">
              <DrawOutlined />
            </NIcon>
            <span v-for="author of comic.author" class="mr-2 van-haptics-feedback"
              @click.stop="$router.force[mode](`/search?keyword=${author}&mode=author`)">{{ author }}</span>
          </div>
          <div class="w-full flex -mt-1 text-sm" v-if="!hideViewNumber">
            <span class="flex items-center mr-2 " v-if="comic.viewNumber">
              <VanIcon color="var(--van-text-color-2)" name="eye-o" size="14px" />
              <span class="ml-0.5">{{ comic.viewNumber }}</span>
            </span>
            <span class="flex items-center" v-if="comic.likeNumber">
              <NIcon size="14px" color="var(--van-text-color-2)">
                <LikeOutlined />
              </NIcon>
              <span class="ml-0.5">{{ comic.likeNumber }}</span>
            </span>
          </div>
        </div>
      </div>
    </button>
    <button :style="[{ height: height == false ? 'auto' : `${height}px` }, style]" v-else @click="handleClick" :disabled
      :class="[{ 'van-haptics-feedback': !disabled }, $props.class]" ref="container"
      class="overflow-hidden w-full rounded-lg block van-hairline--top-bottom bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-0 items-center">
      <div class="w-full flex items-center relative">
        <Image v-if="!$slots.cover" :src="comic.cover" class="rounded-t-lg w-full image-size" fit="cover" ref="cover" />
        <div
          class="absolute w-full h-6 !text-[10px] text-white bg-[linear-gradient(transparent,rgba(0,0,0,0.9))] bottom-0 flex pb-0.5 gap-1 pl-1 items-end justify-start *:flex *:items-center">
          <span v-if="comic.viewNumber">
            <VanIcon name="eye-o" class="mr-0.5" size="14px" />
            <span>{{ comic.viewNumber }}</span>
          </span>
          <span v-if="comic.likeNumber">
            <NIcon class="mr-0.5" size="14px" color="white">
              <LikeOutlined />
            </NIcon>
            <span>{{ comic.likeNumber }}</span>
          </span>
          <template v-if="jm.comic.CommonComic.is($props.comic)">
            <span v-if="$props.comic.category.title">
              <VanIcon class="mr-0.5" name="apps-o" size="14px" color="white" />
              <span>{{ $props.comic.category.title }}</span>
            </span>
            <span v-if="$props.comic.category_sub.title && $props.comic.category_sub.id != $props.comic.category.id">
              <VanIcon class="mr-0.5" name="apps-o" size="14px" color="white" />
              <span>{{ $props.comic.category_sub.title }}</span>
            </span>
          </template>
        </div>
      </div>
      <div class="w-full overflow-hidden p-1 flex flex-col text-(--van-text-color)">
        <div class="flex flex-nowrap">
          <span class="text-start text-sm">{{ comic.title }}</span>
        </div>
        <div class=" my-1 w-full h-auto flex-nowrap flex items-center">
          <NIcon color="white" size="14px">
            <DrawOutlined />
          </NIcon>
          <span @click.stop="$router.force[mode](`/search?keyword=${comic.author[0]}&mode=author`)"
            class="ml-0.5 text-xs van-ellipsis max-w-2/3 text-(--van-text-color-2)">{{ comic.author.join(',') }}</span>
        </div>
      </div>
    </button>
  </template>
</template>
<style scoped lang='scss'>
:deep(.image-size) {
  aspect-ratio: v-bind("imageRatio");
}
</style>