<script setup lang='ts' generic="T = any, PF extends ((d: T[]) => any[]) = ((d: T[]) => T[])">
import { callbackToPromise, RPromiseContent, Stream } from '@/utils/data'
import { computed, onMounted, onUnmounted, Ref, shallowReactive, shallowRef, StyleValue, watch } from 'vue'
import { VirtualWaterfall } from '@lhlyu/vue-virtual-waterfall'
import { useEventListener } from '@vant/use'
import Content from './content.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { IfAny, useResizeObserver, useScroll } from '@vueuse/core'
import { useTemplateRef } from 'vue'
import { useTemp } from '@/stores/temp'
import { isArray } from 'lodash-es'
type Source = {
  data: RPromiseContent<any, T[]>
  isEnd?: boolean
} | Stream<T>
type Processed = IfAny<ReturnType<PF>[number], T, ReturnType<PF>[number]>
const $props = withDefaults(defineProps<{
  source: Source
  style?: StyleValue
  class?: any
  col?: [min: number, max: number] | number
  padding?: number
  gap?: number
  minHeight?: number
  dataProcessor?: PF

}>(), {
  padding: 4,
  col: 2,
  gap: 8,
  minHeight: 0
})
const $emit = defineEmits<{
  next: [then: () => void]
  reset: []
  retry: [then: () => void]
  col: [2, 2]
}>()
const dataProcessor = (v: T[]) => $props.dataProcessor?.(v) ?? v


const column = computed(() => (isArray($props.col) ? $props.col : [$props.col, $props.col]) as [min: number, max: number])

const unionSource = computed(() => ({
  ...Stream.isStream($props.source) ? {
    data: dataProcessor($props.source.data.value),
    isDone: $props.source.isDone.value,
    isRequesting: $props.source.isRequesting.value,
    isError: !!$props.source.error.value,
    length: dataProcessor($props.source.data.value).length,
    isEmpty: $props.source.isEmpty.value,
    source: $props.source
  } : {
    data: dataProcessor($props.source.data.data.value ?? []),
    isDone: $props.source.isEnd,
    isRequesting: $props.source.data.isLoading.value,
    isError: $props.source.data.isError.value,
    length: dataProcessor(($props.source.data.data.value) ?? []).length,
    isEmpty: $props.source.data.isEmpty.value,
    source: $props.source.data
  },
  next: () => Stream.isStream($props.source) ? $props.source.next() : callbackToPromise(r => $emit('next', r)),
  retry: () => Stream.isStream($props.source) ? $props.source.retry() : callbackToPromise(r => $emit('retry', r)),
  reset: () => Stream.isStream($props.source) ? $props.source.reset() : $emit('reset'),
}))

const isPullRefreshHold = shallowRef(false)
const isRefreshing = shallowRef(false)
const handleRefresh = async () => {
  unionSource.value.reset()
  console.log('reset done')
  await unionSource.value.next()
  isRefreshing.value = false
}
defineSlots<{
  default(props: { item: Processed, index: number, height?: number, minHeight: number, length: number }): any
}>()
const content = useTemplateRef<ComponentExposed<typeof Content>>('content')
const scrollParent = computed(() => content.value?.cont)
const { y: contentScrollTop } = useScroll(scrollParent)
const handleScroll = () => {
  const { isDone, isError, isRequesting, retry, next } = unionSource.value
  if (isRequesting || isDone) return
  const el = scrollParent.value
  if (!el) return
  const scrollHeight = el.scrollHeight
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight

  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  if (distanceFromBottom <= 100) {
    if (isError) retry()
    else next()
  }
}
useEventListener('scroll', handleScroll, {
  target: <Ref<HTMLDivElement>>scrollParent,
})
onMounted(() => {
  const { isError, retry, next, isEmpty } = unionSource.value
  if (!isEmpty) return
  if (isError) retry()
  else next()
})

defineExpose({
  scrollTop: contentScrollTop,
  scrollParent: scrollParent,
})
const waterfallEl = useTemplateRef('waterfallEl')
const sizeMapTemp = useTemp().$applyRaw('waterfall', () => shallowReactive(new Map<T, number>()))
const sizeWatcherCleaner = new Array<VoidFunction>()
const observer = new MutationObserver(([mutation]) => {
  for (const stop of sizeWatcherCleaner) stop()
  if (!(mutation.target instanceof HTMLDivElement) || !unionSource.value.data) return
  const elements = [...mutation.target.children] as HTMLDivElement[]
  for (const element of elements) {
    const index = Number(element.dataset.index)
    const data = unionSource.value.data[index]
    const handler = () => {
      const bound = element.firstElementChild?.getBoundingClientRect()
      sizeMapTemp.set(data, bound?.height ?? $props.minHeight)
    }
    const size = useResizeObserver(<HTMLElement>element.firstElementChild, handler)
    handler()

    sizeWatcherCleaner.push(() => size.stop())
  }
})
watch(waterfallEl, waterfallEl => {
  if (!waterfallEl) return observer.disconnect()
  observer.observe(waterfallEl.$el, {
    childList: true
  })
})
onUnmounted(() => {
  observer.disconnect()
  for (const stop of sizeWatcherCleaner) stop()
})
</script>

<template>
  <VanPullRefresh v-model="isRefreshing" :class="['relative h-full', $props.class]"
    :disabled="unionSource.isRequesting || (!!contentScrollTop && !isPullRefreshHold)" @refresh="handleRefresh"
    @change="({ distance }) => isPullRefreshHold = !!distance" :style>
    <Content retriable :source="Stream.isStream(source) ? source : source.data" class-loading="mt-2 !h-[24px]"
      class-empty="!h-full" class-error="!h-full" class="h-full overflow-auto w-full" @retry="handleRefresh"
      @reset-retry="handleRefresh" :hide-loading="isPullRefreshHold && unionSource.isRequesting" ref="content">
      <VirtualWaterfall :items="unionSource.data" :gap :padding :preload-screen-count="[0, 1]" ref="waterfallEl"
        v-slot="{ item, index }: { item: T, index: number }"
        :calc-item-height="item => sizeMapTemp.get(item) ?? minHeight" class="waterfall" :min-column-count="column[0]"
        :max-column-count="column[1]">
        <slot :item :index :height="sizeMapTemp.get(item)" :length="unionSource.length" :minHeight />
      </VirtualWaterfall>
    </Content>
  </VanPullRefresh>
</template>