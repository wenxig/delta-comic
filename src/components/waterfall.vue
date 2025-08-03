<script setup lang='ts' generic="T">
import { callbackToPromise, SPromiseContent, Stream } from '@/utils/data'
import { computed, shallowRef, StyleValue } from 'vue'
import { VirtualWaterfall } from '@lhlyu/vue-virtual-waterfall'
type Source = {
  data: SPromiseContent<T[]>
  isEnd?: boolean
} | Stream<T>
const $props = withDefaults(defineProps<{
  source: Source

  style?: StyleValue
  class?: any
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
  await unionSource.value.next()
  isRefreshing.value = false
}
// unionSource.value.next()
</script>

<template>
  <VanPullRefresh v-model="isRefreshing" :class="['relative', $props.class]" @refresh="handleRefresh"
    @change="({ distance }) => isPullRefreshHold = !!distance" :style>
    <Content retriable :source="Stream.isStream(source) ? source : source.data" class-loading="mt-2 !h-[24px]"
      class-empty="!h-full" class-error="!h-full" @retry="handleRefresh"
      :hide-loading="isPullRefreshHold && unionSource.isRequesting">
      <VirtualWaterfall :items="unionSource.data"   ></VirtualWaterfall>
    </Content>
  </VanPullRefresh>
</template>