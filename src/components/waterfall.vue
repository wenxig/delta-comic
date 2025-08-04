<script setup lang='ts' generic="T">
import { callbackToPromise, SPromiseContent, Stream } from '@/utils/data'
import { computed, onMounted, ref, shallowRef, StyleValue, watch } from 'vue'
import { VirtualWaterfall } from '@lhlyu/vue-virtual-waterfall'
import { useEventListener } from '@vant/use'
import { PullRefresh } from 'vant'
import Content from './content.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useScroll } from '@vueuse/core'
type Source = {
  data: SPromiseContent<T[]>
  isEnd?: boolean
} | Stream<T>
const $props = withDefaults(defineProps<{
  source: Source
  style?: StyleValue
  class?: any
  calcItemHeight: (item: T) => number
}>(), {
})
const $emit = defineEmits<{
  next: [then: () => void]
  reset: []
  retry: [then: () => void]
}>()


const unionSource = computed(() => ({
  ...Stream.isStream($props.source) ? {
    data: $props.source.data.value,
    isDone: $props.source.isDone.value,
    isRequesting: $props.source.isRequesting.value,
    isError: !!$props.source.error.value,
    length: $props.source.data.value.length,
    isEmpty: $props.source.isEmpty.value,
    source: $props.source
  } : {
    data: $props.source.data.data,
    isDone: $props.source.isEnd,
    isRequesting: $props.source.data.isLoading,
    isError: $props.source.data.isError,
    length: ($props.source.data.data ?? []).length,
    isEmpty: $props.source.data.isEmpty,
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
  default(props: { item: T, index: number }): any
}>()
const content = ref<ComponentExposed<typeof Content>>()
const scrollParent = computed<HTMLDivElement | undefined>(() => content.value?.cont)
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
  console.log(distanceFromBottom)
  if (distanceFromBottom <= 20) {
    if (isError) retry()
    else next()
  }
}
useEventListener('scroll', handleScroll, {
  target: scrollParent,
})
onMounted(() => {
  const { isDone, isError, isRequesting, retry, next } = unionSource.value
  if (isError) retry()
  else next()
})
</script>

<template>
  <VanPullRefresh v-model="isRefreshing" :class="['relative h-full', $props.class]"
    :disabled="unionSource.isRequesting || (!!contentScrollTop && !isPullRefreshHold)" @refresh="handleRefresh"
    @change="({ distance }) => isPullRefreshHold = !!distance" :style>
    <Content retriable :source="Stream.isStream(source) ? source : source.data" class-loading="mt-2 !h-[24px]"
      class-empty="!h-full" class-error="!h-full" class="h-full overflow-auto" @retry="handleRefresh"
      @reset-retry="handleRefresh" :hide-loading="isPullRefreshHold && unionSource.isRequesting" ref="content">
      <VirtualWaterfall :items="unionSource.data" :gap="8" :padding="4" :preload-screen-count="[0, 1]"
        v-slot="{ item, index }: { item: T, index: number }" :calc-item-height ref="virtualWaterfall">
        <slot :item :index />
      </VirtualWaterfall>
    </Content>
  </VanPullRefresh>
</template>
<style scoped lang='scss'>
:deep(.van-pull-refresh__head) {
  overflow: hidden;
}
</style>