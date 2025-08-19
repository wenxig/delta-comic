<script setup lang='ts'>
import { ImgHTMLAttributes, StyleValue, computed, nextTick, shallowRef, watch } from 'vue'
import { ImageProps, NImage } from 'naive-ui'
import { isString } from 'lodash-es'
import { showImagePreview } from '@/utils/image'
import { useTemp } from '@/stores/temp'
import { computedAsync } from '@vueuse/core'
import { uni } from '@/api/union'
const $props = withDefaults(defineProps<{
  src?: uni.image.Image_
  alt?: string
  previewable?: boolean
  retryMax?: number
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
  fallback?: uni.image.Image_

  lazy?: boolean
}>(), {
  fetchpriority: 'auto',
  retryMax: 6,
})
const src = computedAsync(async () => {
  try {
    if (!$props.src) return ''
    if (isString($props.src)) return $props.src
    return await $props.src.getUrl()
  } catch (error) {
    console.error(error)
  }
  return ''
}, '')

const $emit = defineEmits<{
  load: any[]
  click: []
  error: []
}>()
let reloadTime = 0
const reload = async () => {
  reloadTime++
  if (reloadTime > $props.retryMax) {
    images.error.add(src.value)
    return $emit('error')
  }
  show.value = false
  await nextTick()
  show.value = true
}
const temp = useTemp().$apply('imageState', () => ({
  loaded: new Set<string>(),
  error: new Set<string>()
}))
const images = $props.useList ?? temp
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
const isLoaded = computed(() => images.loaded.has(src.value))
defineExpose({
  isLoaded
})
const fallbackSrc = computedAsync(async () => {
  try {
    if (!$props.fallback) return ''
    if (isString($props.fallback)) return $props.fallback
    return await $props.fallback.getUrl()
  } catch (error) {
    console.error(error)
  }
  return ''
}, '')

const handleClickImage = (e: Event) => {
  $emit('click')
  if (!$props.previewable) return
  e.stopPropagation()
  showImagePreview([src.value], {
    closeable: true,
  })
}
const handleImageLoad = (...e: Event[]) => {
  $emit('load', ...e)
  images.loaded.add(src.value)
}
</script>

<template>
  <NImage @error="reload" v-bind="$props" :object-fit="fit" preview-disabled :alt
    :img-props="{ ...(imgProp ?? {}), class: 'w-full', ['fetchpriority' as any]: $props.fetchpriority }"
    :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]" :style lazy
    v-show="!images.error.has(src) && images.loaded.has(src)" v-if="show" @load="handleImageLoad" @click="handleClickImage" :src>
  </NImage>
  <div class="justify-center items-center" v-if="!images.loaded.has(src) && !images.error.has(src) && !hideLoading"
    :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]" :style
    @click="$emit('click')">
    <slot name="loading" v-if="$slots.loading"></slot>
    <VanLoading v-else />
  </div>
  <template v-if="images.error.has(src) && !hideError">
    <NImage @error="reload" v-bind="$props" :object-fit="fit" preview-disabled :alt
      :img-props="{ ...(imgProp ?? {}), class: 'w-full', ['fetchpriority' as any]: $props.fetchpriority }"
      :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]" :style v-if="fallback"
      :src="fallbackSrc" />
    <div class="justify-center items-center flex-col" @click.stop="() => {
      images.error.delete(src)
      beginReload()
    }" v-else :class="[{ '!rounded-full': !!round }, inline ? 'inline-flex' : 'flex', $props.class]">
      <slot name="loading" v-if="$slots.loading"></slot>
      <template v-else>
        <VanIcon name="warning-o" size="2.5rem" color="var(--van-text-color-2)" />
        <div class="text-sm text-(--van-text-color-2)">点击重试</div>
      </template>
    </div>
  </template>
</template>
