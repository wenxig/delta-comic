<script setup lang='ts'>
import { ImgHTMLAttributes, StyleValue, computed, nextTick, shallowRef, watch } from 'vue'
import { ImageProps, NImage } from 'naive-ui'
import { Image, Image_ } from '@/api/bika/image'
import { isString } from 'lodash-es'
import { showImagePreview } from '@/utils/image'
import { image } from '@/stores/temp'
const $props = withDefaults(defineProps<{
  src?: Image_
  alt?: string
  previewable?: boolean
  infiniteRetry?: boolean
  round?: boolean
  fit?: ImageProps['objectFit']
  class?: any,
  hideLoading?: boolean
  hideError?: boolean
  inline?: boolean
  style?: StyleValue
  imgProp?: ImgHTMLAttributes
  useList?: {
    loaded: Set<string>
    error: Set<string>
  }
  fetchpriority?: 'high' | 'low' | 'auto'
}>(), {
  fetchpriority: 'auto'
})
const src = computed(() => {
  try {
    if (!$props.src) return ''
    if (isString($props.src)) return $props.src
    return $props.src.getUrl()
  } catch (error) {
    console.error(error)
  }
  return ''
})

const $emit = defineEmits<{
  load: any[]
  click: []
  error: []
}>()
let reloadTime = 0
const reload = async () => {
  if (!$props.infiniteRetry) reloadTime++
  if (reloadTime > 6) {
    images.error.add(src.value)
    return $emit('error')
  }
  show.value = false
  await nextTick()
  show.value = true
}
const images = $props.useList ?? image
const show = shallowRef(true)
const beginReload = () => {
  reloadTime = 0
  reload()
}
watch(src, beginReload)
defineSlots<{
  loading?(): any
  fail?(): any
}>()
const imageComp = shallowRef<HTMLImageElement>()
defineExpose({
  imageEl: imageComp
})
//vue3监听如何图片加载完成
</script>

<template>
  <NImage @error="reload" v-bind="$props" :object-fit="fit" preview-disabled :alt
    :img-props="{ ...(imgProp ?? {}), class: 'w-full', ['fetchpriority' as any]: $props.fetchpriority }"
    :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]" :style
    v-show="!images.error.has(src) && images.loaded.has(src)" v-if="show" @load="(...e) => {
      $emit('load', ...e)
      images.loaded.add(src)
    }" @click="(e: Event) => {
      $emit('click')
      if (previewable) {
        e.stopPropagation()
        showImagePreview([src], {
          closeable: true,
        })
      }
    }" :src>
  </NImage>
  <div class="justify-center items-center" v-if="!images.loaded.has(src) && !images.error.has(src) && !hideLoading"
    :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]" :style
    @click="$emit('click')">
    <slot name="loading" v-if="$slots.loading"></slot>
    <VanLoading v-else />
  </div>
  <div class="justify-center items-center flex-col" @click.stop="() => {
    images.error.delete(src)
    beginReload()
  }" v-if="images.error.has(src) && !hideError"
    :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]">
    <slot name="loading" v-if="$slots.loading"></slot>
    <template v-else>
      <VanIcon name="warning-o" size="2.5rem" color="var(--van-text-color-2)" />
      <div class="text-sm text-(--van-text-color-2)">点击重试</div>
    </template>
  </div>
</template>
