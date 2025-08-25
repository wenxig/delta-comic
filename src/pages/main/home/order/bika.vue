<script setup lang='ts'>
import { useRoute, useRouter } from 'vue-router'
import { shallowRef, inject, watch, computed, onMounted, ref } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useBikaStore } from '@/stores'
import { useTemp } from '@/stores/temp'
import { until, useResizeObserver } from '@vueuse/core'
import { isEmpty } from 'lodash-es'

const $route = useRoute()
const $router = useRouter()
const id = decodeURI($route.params.id.toString())
const bikaStore = useBikaStore()

const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const temp = useTemp()
const orderScoreSaveTemp = temp.$applyRaw(`orderBikaScoreSave`, () => new Map<string, number>())
const containBound = ref<DOMRectReadOnly>()
useResizeObserver(() => <HTMLDivElement | null>list.value?.scrollParent?.firstElementChild, ([b]) => containBound.value = b.contentRect)
onMounted(async () => {
  if (!isEmpty(dataSource.value.data.value)) {
    await until(() => (containBound.value?.height ?? 0) > 8).toBeTruthy()
    list.value?.scrollParent?.scroll(0, orderScoreSaveTemp.get(id) ?? 0)
  }
})
const stop = $router.beforeEach(() => {
  stop()
  orderScoreSaveTemp.set(id, list.value?.scrollTop ?? 0)
})
const dataSource = computed(() => bikaStore.preload.collections.useProcessor(v => v.find(v => v.title == id)?.$comics ?? []))
</script>

<template>
  <Waterfall :source="{ data: dataSource, isEnd: true }"
    v-slot="{ item }" ref="list">
    <ComicCard :comic="item" :height="false" type="small" />
  </Waterfall>
</template>