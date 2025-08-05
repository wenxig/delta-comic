<script setup lang='ts' generic="T extends NonNullable<VirtualListProps['items']>[number],PF extends ((d: T[])=>any[])">
import { NVirtualList, VirtualListProps } from 'naive-ui'
import { ceil, debounce, isArray, isEmpty } from 'lodash-es'
import { StyleValue, shallowRef, watch } from 'vue'
import { IfAny, useScroll } from '@vueuse/core'
import { callbackToPromise, SPromiseContent, Stream } from '@/utils/data'
import Content from './content.vue'
import { computed } from 'vue'
type Source = {
  data: SPromiseContent<T[]>
  isEnd?: boolean
} | Stream<T> | Array<T>
const $props = withDefaults(defineProps<{
  source: Source
  itemHeight: number
  listProp?: Partial<VirtualListProps>
  goBottom?: boolean
  itemResizable?: boolean
  dataProcessor?: PF

  style?: StyleValue
  class?: any
}>(), {
  listProp: <any>{}
})
const $emit = defineEmits<{
  next: [then: () => void]
  reset: []
  retry: [then: () => void]
}>()

const dataProcessor = (v: T[]) => $props.dataProcessor?.(v) ?? v
const unionSource = computed(() => ({
  ...Stream.isStream($props.source) ? {
    data: $props.source.data.value,
    isDone: $props.source.isDone.value,
    isRequesting: $props.source.isRequesting.value,
    isError: !!$props.source.error.value,
    length: dataProcessor($props.source.data.value).length,
    isEmpty: $props.source.isEmpty.value,
    source: $props.source
  } : (isArray($props.source) ?
    {
      data: $props.source,
      isDone: true,
      isRequesting: false,
      isError: false,
      length: dataProcessor($props.source).length,
      isEmpty: isEmpty($props.source),
      source: $props.source
    } :
    {
      data: $props.source.data.data,
      isDone: $props.source.isEnd,
      isRequesting: $props.source.data.isLoading,
      isError: $props.source.data.isError,
      length: dataProcessor($props.source.data.data ?? []).length,
      isEmpty: $props.source.data.isEmpty,
      source: $props.source.data
    }
  ),
  next: () => Stream.isStream($props.source) ? $props.source.next() : callbackToPromise(r => $emit('next', r)),
  retry: () => Stream.isStream($props.source) ? $props.source.retry() : callbackToPromise(r => $emit('retry', r)),
  reset: () => Stream.isStream($props.source) ? $props.source.reset() : $emit('reset'),
}))
watch(() => unionSource.value.data, () => {
  if ($props.goBottom) vList.value?.scrollTo({ position: 'bottom', behavior: 'instant' })
}, { flush: 'post', deep: true, immediate: true })
watch(unionSource, unionSource => {
  if (!unionSource.isRequesting) if (((ceil(window.innerHeight / $props.itemHeight) + 2) > unionSource.length) && !unionSource.isDone) {
    if (unionSource.isError) unionSource.retry()
    else unionSource.next()
  }
}, { immediate: true })


const vList = shallowRef<InstanceType<typeof NVirtualList>>()
const { y: listScrollTop } = useScroll(() => vList.value?.getScrollContainer())
const handleScroll: VirtualListProps['onScroll'] = debounce(async () => {
  const list = vList.value?.virtualListInstRef?.itemsElRef?.querySelector(' .v-vl-visible-items')
  if (!list) return
  // 能用
  const { itemHeight } = $props
  const { data, isDone, isError, isRequesting, retry, next, length } = unionSource.value
  if (!data) return
  if (!isRequesting && !isDone && (itemHeight * (length - 2)) < (listScrollTop.value + (list?.children?.length ?? window.innerHeight / itemHeight) * itemHeight)) {
    if (isError) retry()
    else next()
  }
}, 200)
const isPullRefreshHold = shallowRef(false)
const isRefreshing = shallowRef(false)
const handleRefresh = async () => {
  unionSource.value.reset()
  await unionSource.value.next()
  isRefreshing.value = false
}

type Processed = IfAny<ReturnType<PF>[number], T, ReturnType<PF>[number]>

defineSlots<{
  default(props: { height: number, data: { item: Processed, index: number } }): any
}>()
defineExpose({
  scrollTop: listScrollTop,
  listInstance: vList,
})
</script>

<template>
  <VanPullRefresh v-model="isRefreshing" :class="['relative', $props.class]" @refresh="handleRefresh"
    :disabled="unionSource.isError || unionSource.isRequesting || (!!listScrollTop && !isPullRefreshHold)"
    @change="({ distance }) => isPullRefreshHold = !!distance" :style>
    <Content retriable :source="Stream.isStream(source) ? source : (isArray(source) ? source : source.data)"
      class-loading="mt-2 !h-[24px]" class-empty="!h-full" class-error="!h-full" @retry="handleRefresh"
      :hide-loading="isPullRefreshHold && unionSource.isRequesting">
      <Var :value="dataProcessor(unionSource.data ?? [])" v-slot="{ value }">
        <NVirtualList :="listProp" :item-resizable :item-size="itemHeight" @scroll="handleScroll"
          class="overflow-x-hidden h-full" :items="value" v-slot="{ item }: { item: Processed }" ref="vList"
          :class="[isPullRefreshHold ? 'overflow-y-hidden' : 'overflow-y-auto']">
          <slot :height="itemHeight" :data="{ item: item, index: value.indexOf(item) }" />
        </NVirtualList>
      </Var>
    </Content>
  </VanPullRefresh>
</template>