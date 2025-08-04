<script setup lang='ts' generic="T">
import { callbackToPromise, SPromiseContent, Stream } from '@/utils/data'
import { computed, ref, shallowRef, StyleValue, watch } from 'vue'
import { VirtualWaterfall } from '@lhlyu/vue-virtual-waterfall'
import { useEventListener } from '@vant/use'
import { noop } from 'lodash-es'
import { PullRefresh } from 'vant'
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
const pullRefresh = ref<InstanceType<typeof PullRefresh>>()
const scrollParent = computed(() => pullRefresh.value?.$el.querySelector('.van-pull-refresh__track'))
useEventListener('scroll', e => {
  const { isDone, isError, isRequesting, retry, next } = unionSource.value
  if (isRequesting || isDone) return
  const el = e.target! as HTMLDivElement

  const scrollHeight = el.scrollHeight
  const scrollTop = el.scrollTop
  const clientHeight = el.clientHeight

  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  console.log(scrollHeight, scrollTop, clientHeight, distanceFromBottom)
  if (distanceFromBottom <= 20) {
    if (isError) retry()
    else next()
  }
}, {
  target: scrollParent
})
</script>

<template>
  <VanPullRefresh v-model="isRefreshing" :class="['relative h-full *:overflow-auto', $props.class]"
    :disabled="unionSource.isError || unionSource.isRequesting || (!!(scrollParent.scrollTop) && !isPullRefreshHold)"
    @refresh="handleRefresh" @change="({ distance }) => isPullRefreshHold = !!distance" :style ref="pullRefresh">
    <Content retriable :source="Stream.isStream(source) ? source : source.data" class-loading="mt-2 !h-[24px]"
      class-empty="!h-full" class-error="!h-full" class="!h-full overflow-auto" @retry="handleRefresh"
      @reset-retry="handleRefresh" :hide-loading="isPullRefreshHold && unionSource.isRequesting">
      <VirtualWaterfall :items="unionSource.data" :gap="8" :padding="4" :preload-screen-count="[3, 4]"
        v-slot="{ item, index }: { item: T, index: number }" :calc-item-height ref="virtualWaterfall">
        <slot :item :index />
      </VirtualWaterfall>
    </Content>
  </VanPullRefresh>
</template>